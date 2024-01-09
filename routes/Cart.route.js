const {
  addToCart,
  fetchCartByUser,
  updateCart,
  deleteFromCart,
} = require("../controller/Cart.controller");

const router = require("express").Router();

router.post("/", addToCart);
router.get("/", fetchCartByUser); 
router.patch("/:id", updateCart);
router.delete("/:id", deleteFromCart);

exports.router = router;
