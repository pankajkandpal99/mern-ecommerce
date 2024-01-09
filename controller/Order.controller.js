const { Order } = require("../model/Order.model");
const { Product } = require("../model/Product.model");
const { User } = require("../model/User.model");
const { sendMail, invoiceTemplate } = require("../services/common");

exports.createOrder = async (req, res) => {
  const order = new Order(req.body);
  // console.log(order);

  // here we have to update stocks
  for (let item of order.items) {     // because order.items is an array.
    await Product.findByIdAndUpdate(item.product.id, {
      $inc: { stock: -1 * item.quantity }, // stock decrement by negative increment
    });
  }

  try {
    const doc = await order.save();
    const user = await User.findById(order.user);
    sendMail({
      to: user.email,
      html: invoiceTemplate(order),
      subject: "Order Received",
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.log("Error occures while creating order: ", err.message);
    return res.status(400).json(err.message);
  }
};

exports.fetchOrdersByUser = async (req, res) => {
  try {
    const { id } = req.user;
    const orders = await Order.find({ user: id, deleted: { $ne: true } });
    console.log(orders);

    res.status(200).json(orders);
  } catch (err) {
    console.log("Error occures while fetching order by user: ", err.message);
    return res.status(400).json(err.message);
  }
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedOrder = await Order.findByIdAndDelete(id);
    // console.log(deletedOrder);
    return res.status(200).json(deletedOrder);
  } catch (err) {
    console.log("Error occures while deleting order by user: ", err.message);
    return res.status(400).json(err.message);
  }
};

exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const updatedOrder = await Order.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    // console.log(updatedOrder);
    return res.status(200).json(updatedOrder);
  } catch (err) {
    console.log("Error occures while updating order by user: ", err.message);
    return res.status(400).json(err.message);
  }
};

// This handler is only for admin -->
exports.fetchAllOrders = async (req, res) => {
  // sort = { _sort: "price", _order="desc"}
  // pagination = {_page: 1, _limit=10}

  console.log(req.query);

  let query = Order.find({ deleted: { $ne: true } });
  let totalOrdersQuery = Order.find({ deleted: { $ne: true } });

  if (req.query._sort && req.query._order) {
    query = query.sort({ [req.query._sort]: req.query._order });
    totalOrdersQuery = totalOrdersQuery.sort({
      [req.query._sort]: req.query._order,
    });
  }

  const totalDocs = await totalOrdersQuery.count().exec();
  console.log(totalDocs);

  if (req.query._page && req.query._limit) {
    const page = req.query._page;
    const pageSize = req.query._limit;
    query = query.skip(pageSize * (page - 1)).limit(pageSize);
  }

  try {
    const orders = await query.exec();
    // console.log(orders);
    res.set("X-Total-Count", totalDocs);
    res.status(200).json(orders);
  } catch (err) {
    console.log(
      "Error occures while fetching all order by Admin : ",
      err.message
    );
    return res.status(400).json(err.message);
  }
};
