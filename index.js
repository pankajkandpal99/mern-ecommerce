const express = require("express");
const mongoose = require("mongoose");
const server = express();
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto"); // this is the core modules of Node.js (in-built module), and usecase of save the hash password in database using salting...
const JwtStrategy = require("passport-jwt").Strategy;
// const ExtractJwt = require("passport-jwt").ExtractJwt; // client ki req se aane wale jwt token ko kaise nakalna hai ye hota hai isme...
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const { isAuth, sanitizeUser, cookieExtractor } = require("./services/common");
const { User } = require("./model/User.model");

const authRouter = require("./routes/Auth.route");
const userRouter = require("./routes/User.route");
const productsRouter = require("./routes/Products.route");
const brandsRouter = require("./routes/Brands.route");
const categoriesRouter = require("./routes/Categories.route");
const cartRouter = require("./routes/Cart.route");
const ordersRouter = require("./routes/Order.route");

// Token secret key with jwt -->
const SECRET_KEY = "SECRET_KEY";

// JWT options -->
const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = SECRET_KEY; // TODO: should not be in code...

// middleware -->
server.use(express.static("build"));
server.use(cookieParser()); // req.cookies me client se aane wali sari cookies ko cookieParser easily padh sakta hai...isko cookieParser isliye use kiya jata hai kyuki wo server per raw data ke form me aati hain aur cookieParser use convert krke easily padh sakta hai...
server.use(
  session({
    secret: "This is secret",
    resave: false, // don't save session if modified..
    saveUninitialized: false, // don't create session until something stored
  })
);
// passport authentication -->
server.use(passport.authenticate("session")); //Ye line of code passport.authenticate("session") passport middleware ko configure karta hai session-based authentication ke liye, jisme deserializeUser function use hota hai session se user details retrieve karne ke liye. ab yeh middleware har request par lagta hai, to session se associated user details deserializeUser function ke through retrieve hote hain, aur fir req.user mein store ho jaate hain. Isme, session ke based pe user ka identity verify hota hai, aur uski details session se li jaati hain
server.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
  })
);

server.use(express.json()); // to parse req.body
// routes base paths -->
server.use("/auth", authRouter.router);
server.use("/users", isAuth(), userRouter.router);
server.use("/products", isAuth(), productsRouter.router); // we can also use JWT token for client-only auth... iska ye fayda hai ki hame server ke session me kucch bhi user se related data store nahi karna padega..
server.use("/brands", isAuth(), brandsRouter.router);
server.use("/categories", isAuth(), categoriesRouter.router);
server.use("/cart", isAuth(), cartRouter.router);
server.use("/orders", isAuth(), ordersRouter.router);

// Passport Local Strategy --> Passport me LocalStrategy ke andar define kiye gaye callback function me typically username, password, aur done teeno req.body ko hi represent karte hain. Yeh parameters authentication process ko control karte hain.
passport.use(
  "local",
  new LocalStrategy({ usernameField: "email" }, async function (
    // passport by-default username aur password hi valid krta hai wo email per kaam nahi karta hai isliye jab req.body se email aur aayega to wo use username ki tarah recognize karega.
    email,
    password,
    done
  ) {
    console.log("LocalStrategy called");
    try {
      const user = await User.findOne({ email: email }).exec();
      // console.log(user.id);
      if (!user) {
        done(null, false, { message: "invalid credentials " });
      }
      crypto.pbkdf2(
        password, // -------------------------> User-provided password - req.body.password
        user.salt, // -------------------------> Salt stored in the user record ... user.salt se req.body.password ko hash kiya jayega fir uske baad jo hashedPassword banega, use user.password se compare kiya jayega..
        310000, // -------------------------> Iterations
        32, // -------------------------> Key length
        "sha256", // -------------------------> Hashing algorithm
        async function (err, hashedPassword) {
          if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
            done(null, false, { message: "invalid credentials" });
          } else {
            const token = jwt.sign(sanitizeUser(user), SECRET_KEY); // first parameter me payload and second me secret key aati hai
            done(null, { id: user.id, role: user.role });
          }
        }
      );
    } catch (err) {
      console.log("Error occurred during login: ", err.message);
      done(err.message);
    }
  })
);

// JWT strategy --> yeh function JWT (JSON Web Token) ko verify karne ke liye hai. Ismein aap JwtStrategy ka use kar rahe hain, jo Passport.js ke ek strategy hai jo JWT authentication ke liye hoti hai. api ke liye generally jwt use kiya jata hai kyuki isse server per koi dependency nahi rehti ki user authorize hai ya nahi ....
passport.use(
  "jwt",
  new JwtStrategy(opts, async function (jwt_payload, done) {
    console.log("jwt called");

    try {
      const user = await User.findById(jwt_payload.id);
      // console.log(user);
      if (user) {
        return done(null, sanitizeUser(user)); // this calls serializer..
      } else {
        return done(null, false); // not err but not also user..
      }
    } catch (err) {
      return done(err, false); // err occur
    }
  })
);

// user ke successfully login hone ke baad user ka data session me store serializer ke dwara hi kiya jata hai...Serialization ka concept tab kaam karta hai jab LocalStrategy se user ka authentication pass ho jata hai..
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    // process.nextTick ek Node.js method hai jo ek callback function ko agle event loop cycle mein daal deta hai. Yani ki, jab aap process.nextTick ka use karte hain, toh aap woh function immediate next event loop mein execute karwa dete hain. Iss context mein, jab serializeUser function mein process.nextTick ka use kiya jata hai, toh yeh ek asynchronous behavior create karta hai. Yeh kaam karta hai jisse aap ek tick ke baad serialize ka kaam karein, aur aapko flexibility milti hai ki aap kaise aur kab serialization karna chahte hain. Overall, process.nextTick ko use karke aap ensure kar sakte hain ki aapka serialization ka kaam ek specific order mein hota hai, especially jab aap dealing karte hain with asynchronous operations.
    // console.log("serializer called --> ", user);
    return cb(null, { id: user.id, role: user.role }); // user ka authentication successfully hone ke baad localStrategy se user object serilizeUser ko bheja ja ra hai, isme ye ho ra hai ki hame server ke session me user ka kon sa data store karna hai jo hame client ke har request karne per check karna hoga, yaha per wahi store kiya jayega.. jaise ki user ke har request per deSerialization se ye check kiya jayega ki iss user ki aane wali id session me store user ki id (jo ki serializeUser store karega) se compare karke user ko redirect karne ka kaam krta hai.
  });
});

// deserilizer ke dwara user ke har req ko check kiya jata hai ki ye sahi user hai ya nahi.. ye session me stored data ko retrieve karta hai...ye session me stored data ko retrieve karega kyuki isme database se data fetch karne ke liye koi v query nahi likhi gyi hai...
passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    // console.log("de-serializer called -->", user);
    return cb(null, user);
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
  await mongoose.connect("mongodb://127.0.0.1:27017/ecommerce");
}

server.listen(8080, () => {
  console.log("Server is on and listening on PORT 8080.");
});
