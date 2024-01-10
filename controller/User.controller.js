const { User } = require("../model/User.model");

exports.fetchUserById = async (req, res) => {
  try {
    const { id } = req.user;     // req.user se deserialize ke through id extract ho ri hai...
    const user = await User.findById(id);
    // console.log(user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userObj = {
      id: user.id,
      addresses: user.addresses,
      email: user.email,
      role: user.role,
    };
    
    res.status(200).json(userObj);
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
