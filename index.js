const express = require("express");
const mongoose = require("mongoose");
const server = express();
const cors = require("cors");

const authRouter = require("./routes/Auth.route"); // defualt exports ko hum kuchh bhi naam de sakte hain access karte time...
const userRouter = require("./routes/User.route"); // defualt exports ko hum kuchh bhi naam de sakte hain access karte time...
const productsRouter = require("./routes/Products.route"); // defualt exports ko hum kuchh bhi naam de sakte hain access karte time...
const brandsRouter = require("./routes/Brands.route"); // defualt exports ko hum kuchh bhi naam de sakte hain access karte time...
const categoriesRouter = require("./routes/Categories.route"); // defualt exports ko hum kuchh bhi naam de sakte hain access karte time...
const cartRouter = require("./routes/Cart.route");
const ordersRouter = require("./routes/Order.route");

// middleware -->
server.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
  })
);

server.use(express.json()); // to parse req.body
// routes base paths -->
server.use("/auth", authRouter.router);
server.use("/users", userRouter.router);
server.use("/products", productsRouter.router);
server.use("/brands", brandsRouter.router);
server.use("/categories", categoriesRouter.router);
server.use("/cart", cartRouter.router);
server.use("/orders", ordersRouter.router);

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

server.get("/", (req, res) => {
  res.json({ status: "success" });
});

server.listen(8080, () => {
  console.log("Server is on and listening on PORT 8080.");
});
