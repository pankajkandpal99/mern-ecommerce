const { Brand } = require("../model/Brand.model");

// isme sare brands fetch karke client-side per show kiye jayenge.exports..
exports.fetchAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find({}).exec();
    // console.log(brands);
    res.status(200).json(brands);
  } catch (err) {
    console.log("Error creating while fetching Brands : ", err.message);
    res.status(400).json(err.message);
  }
};

// for create new Brand controller
exports.createBrand = async (req, res) => {
  const brand = new Brand(req.body);
  try {
    const doc = await brand.save();
    res.status(201).json(doc);
  } catch (err) {
    console.log("Error creating while fetching Brands : ", err.message);
    res.status(400).json(err.message);
  }
};
