const express = require("express");
const {
  createProduct,
  fetchAllProducts,
  fetchProductById,
  updateProduct,
} = require("../controller/Product.controller");
const router = express.Router();

// iska base path index.js me defined hai ki ye '/products' ke path per hi ye file run hogi.
router.post("/", createProduct);
router.get("/", fetchAllProducts);
router.get("/:id", fetchProductById);
router.patch("/:id", updateProduct);

module.exports = router;
