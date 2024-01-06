require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const server = express();
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const JwtStrategy = require("passport-jwt").Strategy;
// const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");

const { isAuth, sanitizeUser, cookieExtractor } = require("./services/common");
const { User } = require("./model/User.model");

const authRouter = require("./routes/Auth.route");
const userRouter = require("./routes/User.route");
const productsRouter = require("./routes/Products.route");
const brandsRouter = require("./routes/Brands.route");
const categoriesRouter = require("./routes/Categories.route");
const cartRouter = require("./routes/Cart.route");
const ordersRouter = require("./routes/Order.route");
const { Order } = require("./model/Order.model");


// webhook --> stripe server talk to my Node.js express server
// TODO: we will capture actually order after deploying out server live on public URL
const endpointSecret = process.env.ENDPOINT_SECRET;
server.post(
  "/webhook",
  express.raw({ type: "application/json" }), // otherr apis ko json-parser chiye aur ise raw-parser chiye..
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event --> payment successfull/unhandled in stripe server...
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        console.log(paymentIntentSucceeded);

        const order = await Order.findById(
          paymentIntentSucceeded.metadata.orderId
        ); // watch the stripe server payment succeded logs if the payment successfully completed..
        order.paymentStatus = "received";
        await order.save();

        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

// JWT options -->
const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY;

// middleware -->
server.use(express.static(path.resolve(__dirname, "build")));
server.use(cookieParser());
server.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false, // don't save session if modified..
    saveUninitialized: false, // don't create session until something stored
  })
);

// passport authentication -->
server.use(passport.authenticate("session"));
server.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
  })
);

server.use(express.json()); // to parse req.body
// routes base paths -->
server.use("/auth", authRouter.router);
server.use("/users", isAuth(), userRouter.router);
server.use("/products", isAuth(), productsRouter.router);
server.use("/brands", isAuth(), brandsRouter.router);
server.use("/categories", isAuth(), categoriesRouter.router);
server.use("/cart", isAuth(), cartRouter.router);
server.use("/orders", isAuth(), ordersRouter.router);


// this line we add to make react router work in case of other routes doesn't match
server.get("*", (req, res) =>
  res.sendFile(path.resolve("build", "index.html"))
);

// Passport Local Strategy
passport.use(
  "local",
  new LocalStrategy({ usernameField: "email" }, async function (
    email,
    password,
    done
  ) {
    // by default passport uses username
    console.log("LocalStrategy called");
    console.log({ email, password });
    try {
      const user = await User.findOne({ email: email });
      console.log(user);
      if (!user) {
        done(null, false, { message: "invalid credentials " }); // for safety
      }
      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        "sha256",
        async function (err, hashedPassword) {
          if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
            done(null, false, { message: "invalid credentials" });
          } else {
            const token = jwt.sign(
              sanitizeUser(user),
              process.env.JWT_SECRET_KEY
            );
            // console.log(token);
            done(null, { id: user.id, role: user.role, token }); // this lines sends to serializer
          }
        }
      );
    } catch (err) {
      console.log("Error occurred during login: ", err.message);
      done(err.message);
    }
  })
);

// JWT strategy
passport.use(
  "jwt",
  new JwtStrategy(opts, async function (jwt_payload, done) {
    console.log("jwt called");
    console.log({ jwt_payload });
    try {
      const user = await User.findById(jwt_payload.id);
      // console.log(user);
      if (user) {
        return done(null, sanitizeUser(user)); // this calls serializer..
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

// this creates session variable req.user on being called from callbacks
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    console.log("serializer called --> ", user);
    return cb(null, { id: user.id, role: user.role });
  });
});

// this changes session variable req.user when called from authorized request
passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    console.log("de-serializer called -->", user);
    return cb(null, user);
  });
});

// Payment Intent
const stripe = require("stripe")(process.env.STRIPE_SERVER_KEY);
server.post("/create-payment-intent", async (req, res) => {
  const { totalAmount, orderId } = req.body;
  console.log(totalAmount);

  // create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount * 100, // its for decimal compensation.. ex--> 1400 paise = 14.00 rupee
    currency: "inr",
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      orderId,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

main()
  .then(() => {
    console.log("successfully connected to mongoDB.");
  })
  .catch((err) => {
    console.log("Error occured while connecting mongoDB : ", err.message);
  });

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
}

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server is on and listening on PORT ${PORT}.`);
});
