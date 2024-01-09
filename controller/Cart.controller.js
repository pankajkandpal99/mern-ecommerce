const { Cart } = require("../model/Cart.model");

exports.addToCart = async (req, res) => {
  const { id } = req.user;
  // console.log(req.body);
  const cart = new Cart({ ...req.body, user: id }); 
  try {
    const doc = await cart.save(); 
    const result = await doc.populate("product"); 
    res.status(201).json(result);
  } catch (err) {
    console.log("Error during adding Cart in database: ", err.message);
    return res.status(400).json(err.message);
  }
};

exports.fetchCartByUser = async (req, res) => {
  try {
    const { id } = req.user;
    // console.log(req.user);
    const cartItems = await Cart.find({ user: id }).populate("product");
    // console.log(cartItems);
    res.status(200).json(cartItems);
  } catch (err) {
    console.log("Error during fetching Cart by user: ", err.message);
    return res.status(400).json(err.message);
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(req.body);
    const updatedCart = await Cart.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    // console.log(updatedCart);

    const result = await updatedCart.populate("product");
    // console.log(result);
    res.status(200).json(result);
  } catch (err) {
    console.log("Error during update item in Cart: ", err.message);
    return res.status(400).json(err.message);
  }
};

exports.deleteFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Cart.findByIdAndDelete(id);
    // console.log(deletedItem);
    res.status(200).json(deletedItem);
  } catch (err) {
    console.log("Error during deleting item in Cart: ", err.message);
    return res.status(400).json(err.message);
  }
};
