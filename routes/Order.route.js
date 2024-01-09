const router = require("express").Router();
const {
  createOrder,
  fetchOrdersByUser,
  updateOrder,
  deleteOrder,
  fetchAllOrders,
} = require("../controller/Order.controller");

router.post("/", createOrder);
router.get("/own", fetchOrdersByUser);
router.patch("/:id", updateOrder);
router.delete("/:id", deleteOrder);
router.get('/', fetchAllOrders);    // its only for admin, which have all orders accessing facility..

exports.router = router;
