const { Product } = require("../model/Product.model");

exports.createProduct = async (req, res) => {
  const product = new Product(req.body);
  product.discountPrice = Math.round(
    product.price * (1 - product.discountPercentage / 100)
  );

  try {
    const response = await product.save();
    if (response) {
      // console.log(response);
      res.json(response);
    }
  } catch (err) {
    console.log("Error creating new product -> ", err.message);
    res.status(400).json(err.message);
  }
};

exports.fetchAllProducts = async (req, res) => {
  // here we need all query string
  // filter = {"category" : ["smartphone", "laptop"]}
  // sort = { _sort: "price", _order="desc"}
  // pagination = {_page: 1, _limit=10}

  let condition = {};

  if (!req.query.admin) {
    condition.deleted = { $ne: true };
  }

  let query = Product.find(condition);
  let totalProductsQuery = Product.find(condition);

  if (req.query.category) {
    query = query.find({ category: { $in: req.query.category.split(",") } });
    totalProductsQuery = totalProductsQuery.find({
      category: { $in: req.query.category.split(",") },
    });
  }

  if (req.query.brand) {
    query = query.find({ brand: { $in: req.query.brand.split(",") } });
    totalProductsQuery = totalProductsQuery.find({
      brand: { $in: req.query.brand.split(",") },
    });
  }

  if (req.query._sort && req.query._order) {
    query = query.sort({ [req.query._sort]: req.query._order });  // The square brackets notation ({ [req.query._sort]: req.query._order }) is used when the property name is dynamic or determined at runtime. It allows you to use the value of req.query._sort as the property name in the resulting object.
  }

  const totalDocs = await totalProductsQuery.count().exec(); // The totalDocs value is used for pagination. It helps in providing information to the client about the total number of documents available based on the applied filters.
  // console.log({ totalDocs });

  if (req.query._page && req.query._limit) {
    // for pagination
    const pageSize = req.query._limit;
    const page = req.query._page;
    query = query.skip(pageSize * (page - 1)).limit(pageSize); // The skip method is used to skip a certain number of documents in the result set, and limit is used to limit the number of documents returned. The formula pageSize * (page - 1) calculates how many documents to skip based on the page number and page size. For example, if pageSize is 10 and page is 2, it means you want to skip the first 10 documents (page 1) and retrieve the next 10 documents (page 2).
  }

  try {
    const docs = await query.exec();
    res.set("X-Total-Count", totalDocs);
    res.status(200).json(docs);
  } catch (err) {
    console.log("Error fetching products ", err.message);
    res.status(400).json(err.message);
  }
};

exports.fetchProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const productById = await Product.findById(id);
    res.status(200).json(productById);
  } catch (err) {
    console.log("Error creating while fetching product by id : ", err.message);
    res.status(400).json(err.message);
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    product.discountPrice = Math.round(
      product.price * (1 - product.discountPercentage / 100)
    );

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (err) {
    console.log("Error creating while updating the product : ", err.message);
    res.status(400).json(err.message);
  }
};
