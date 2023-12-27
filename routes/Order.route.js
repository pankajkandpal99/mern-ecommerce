const router = require("express").Router();
const {
  createOrder,
  fetchOrdersByUser,
  updateOrder,
  deleteOrder,
} = require("../controller/Order.controller");

// Order is already added in base path
router.post("/", createOrder);
router.get("/", fetchOrdersByUser);
router.get("/:id", updateOrder);
router.get("/:id", deleteOrder);

exports.router = router;
