const { Cart } = require("../model/Cart.model");

exports.addToCart = async (req, res) => {
  const cart = new Cart(req.body);
  try {
    const doc = await cart.save(); // isme naya cart document MongoDB database mein save kiya ja raha hai.
    const result = await doc.populate("product"); // Agar save karna successful hota hai, to populate method se product field populate kiya ja raha hai, jo ki shayad product field ek reference hai aur aap uske actual details ko populate karna chahte hain.
    res.status(201).json(result);
  } catch (err) {
    console.log("Error during adding Cart in database: ", err.message);
    return res.status(400).json(err.message);
  }
};

// ye function tab call hota hai jab user login karta hai to ye function usi time call hokar client ko response bhejta hai aur user ke cart me items ko show kar deta hai jo usne order kiye the.
exports.fetchCartByUser = async (req, res) => {
  // route me jo query aa ri hai use ye function handle karke sahi response de raha hai.
  try {
    const { user } = req.query;
    console.log(req.query);
    const cartItems = await Cart.find({ user: user }).populate("product");
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
    }).populate("product");
    
    // console.log(updatedCart);
    res.status(200).json(updatedCart);
  } catch (err) {
    console.log("Error during update item in Cart: ", err.message);
    return res.status(400).json(err.message);
  }
};

exports.deleteFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Cart.findByIdAndDelete(id);
    console.log(deletedItem);
    res.status(200).json(deletedItem);
  } catch (err) {
    console.log("Error during deleting item in Cart: ", err.message);
    return res.status(400).json(err.message);
  }
};