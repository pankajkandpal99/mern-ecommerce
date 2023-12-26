const express = require("express");
const mongoose = require("mongoose");
const server = express();
const productsRouter = require("./routes/Products.route"); // defualt exports ko hum kuchh bhi naam de sakte hain access karte time...
const brandsRouter = require("./routes/Brands.route"); // defualt exports ko hum kuchh bhi naam de sakte hain access karte time...
const categoriesRouter = require("./routes/Categories.route"); // defualt exports ko hum kuchh bhi naam de sakte hain access karte time...
const cors = require("cors");

// middleware -->
server.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
  })
);
server.use(express.json()); // to parse req.body
server.use("/products", productsRouter);
server.use("/brands", brandsRouter);
server.use("/categories", categoriesRouter);

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

server.listen("8080", () => {
  console.log("Server is on and listening on PORT 8080.");
});
