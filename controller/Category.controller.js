const { Category } = require("../model/Category.model");

exports.fetchAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).exec();
    // console.log(categories);
    res.status(200).json(categories);
  } catch (err) {
    console.log("Error creating while fetching categories : ", err.message);
    res.status(400).json(err.message);
  }
};

// for create new Brand controller
exports.createCatgory = async (req, res) => {
  const category = new Category(req.body);
  try {
    const doc = await category.save();
    res.status(201).json(doc);
  } catch (err) {
    console.log("Error creating while fetching Brands : ", err.message);
    res.status(400).json(err.message);
  }
};
