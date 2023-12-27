const { User } = require("../model/User.model");

exports.fetchUserById = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(id);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      addresses: user.addresses,
      name: user.name,
      orders: user.orders,
    };

    // console.log(newUser);
    res.status(200).json(newUser);

  } catch (err) {
    console.log("Error during fetching user by id : ", err.message);
    res.status(400).json(err.message);
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  // console.log(id);
  if (!id) {
    console.log("id is not found.");
    return;
  }
  // console.log(req.body);
  try {
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedUser) {
      console.log("id is not found.");
    }
    // console.log(updatedUser);
    res.status(200).json(updatedUser);
  } catch (err) {
    console.log("Error connecting while update the user : ", err.message);
    res.status(400).json(err.message);
  }
};
