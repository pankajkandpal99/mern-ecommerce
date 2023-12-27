const { Order } = require("../model/Order.model");

exports.createOrder = async (req, res) => {
//   console.log(req.body);
  const order = new Order(req.body);
  try {
    const doc = await order.save();
    // console.log(doc);
    return res.status(201).json(doc);
  } catch (err) {
    console.log("Error occures while creating order: ", err.message);
    return res.status(400).json(err.message);
  }
};

// Ye function ko userAPI me fetchLoggedInUserOrders(userId) function dwara call lagayi ja ri hai jo ki user ke sare orderska tract apne pass rakhta hai, aur MyOrders page per show karta hai....
exports.fetchOrdersByUser = async (req, res) => {
  try {
    const { user } = req.query;       // isme userId query ke roop me aa ri hai jo ki user ke andar hai.
    // console.log(user);

    const orders = await Order.find({ user: user });
    // console.log(orders);

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
