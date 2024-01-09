const express = require("express");
const router = express.Router();
// const { Product } = require("../model/Product.model");
const {
  createProduct,
  fetchAllProducts,
  fetchProductById,
  updateProduct,
} = require("../controller/Product.controller");

router.post("/", createProduct);
router.get("/", fetchAllProducts);
router.get("/:id", fetchProductById);
router.patch("/:id", updateProduct);
// router.get("/update/test", async (req, res) => {
//   const products = await Product.find({});
//   for (let product of products) {
//     product.discountPrice = Math.round(
//       product.price * (1 - product.discountPercentage / 100)
//     );
//     await product.save();
//     console.log(product.title + " updated");
//   }
//   res.send("ok");
// });

exports.router = router;