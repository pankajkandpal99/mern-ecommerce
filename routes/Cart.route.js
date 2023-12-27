const {
  addToCart,
  fetchCartByUser,
  updateCart,
  deleteFromCart,
} = require("../controller/Cart.controller");

const router = require("express").Router();

router.post("/", addToCart);
router.get("/", fetchCartByUser); // req.query me aane wale url ko ye sahi tarah se handle karega aur Cart.controller.js module me se fetchCartByUser function ko call karega.
router.patch("/:id", updateCart);
router.delete("/:id", deleteFromCart);

exports.router = router;
