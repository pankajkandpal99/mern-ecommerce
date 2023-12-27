const { User } = require("../model/User.model");
const bcrypt = require("bcrypt");

// signup
exports.createUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("This email has already been taken.");
      return res.status(404).json({ message: "This email is already in use." });
    }

    if (!existingUser) {
      const hashedPass = await bcrypt.hashSync(password, 10);
      const newUser = new User({ email, password: hashedPass });
      const user = await newUser.save();
      console.log(user);
      res.status(201).json({ message: "User created successfully" });
    }
  } catch (err) {
    console.log("Error occured while creating new user : ", err.message);
    res.status(400).json(err.message);
  }
};

// login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).exec();
    // This is just temporary, we will use strong password auth..
    // email check..
    if (!user) {
      console.log("wrong email or password.");
      return res.status(401).json({ message: "wrong email or password." });
    }

    // if email is right and compare user's entered password(password) and stored password(user.password)..
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("wrong email or password.");
      return res.status(401).json({ message: "wrong email or password." });
    }
    // TODO: We will make addresses independent 
    // Remove sensitive information (password) before sending the user object to the client..
    const userWithoutPassword = {
      id: user._id,
      email: user.email,
      role: user.role,
      addresses: user.addresses,
      name: user.name,
      orders: user.orders,
    };

    // console.log(userWithoutPassword);
    return res.status(200).json(userWithoutPassword);
  } catch (err) {
    console.log("Error occurred during login: ", err.message);
    res.status(400).json(err.message);
  }
};
