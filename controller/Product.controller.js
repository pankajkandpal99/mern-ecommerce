// controller me crud operations hote hain....
const { Product } = require("../model/Product.model");

exports.createProduct = async (req, res) => {
  // this product we have to get from API body...
  const product = new Product(req.body);
  try {
    const response = await product.save();
    if (response) {
      //   console.log(response);
      res.json(response);
    }
  } catch (err) {
    console.log("Error creating new product -> ", err.message);
    res.status(400).json(err.message);
  }
};

// iss controller me filteration -> brand filter aur category filter hokar bhi data aayega, aur isi me sorting, pagination ka v logic hai ....
exports.fetchAllProducts = async (req, res) => {
  // here we need all query string
  // filter = {"category" : ["smartphone", "laptop"]}        // aane wala data kuchh iss tarah ka hoga..
  // sort = { _sort: "price", _order="desc"}
  // pagination = {_page: 1, _limit=10}
  // TODO : we have to try with multiple category and brands after change in front-end...

  let query = Product.find({}); // The Product.find({}) creates a Query object, but the actual database query is not executed at this point. The modifications to the query object happen immediately, but the database query is only executed when you call exec(). So, the Product.find({}) part will be executed when you call await query.exec()...
  let totalProductsQuery = Product.find({}); // query is intended for handling pagination, sorting, and filtering, while totalProductsQuery is for calculating the total count.

  // for category filteration
  if (req.query.category) {
    query = query.find({ category: req.query.category });
    totalProductsQuery = totalProductsQuery.find({
      category: req.query.category,
    });
  }

  // for brand filteration
  if (req.query.brand) {
    query = query.find({ brand: req.query.brand });
    totalProductsQuery = totalProductsQuery.find({ brand: req.query.brand });
  }

  // for sorting --> TODO: How to get sorting on discounted price not on actual price...
  if (req.query._sort && req.query._order) {
    query = query.sort({ [req.query._sort]: req.query._order }); // { [req.query._sort]: req.query._order } --> mein [req.query._sort] ek dynamic key banane ka tarika hai. Yeh kuch is tarah ka code hota hai ki, agar req.query._sort ki value, maan lo "name" hai, toh yeh wala expression effectively { name: req.query._order } ban jaayega.
  }

  const totalDocs = await totalProductsQuery.count().exec(); // The totalDocs value is used for pagination. It helps in providing information to the client about the total number of documents available based on the applied filters. This is commonly used in pagination scenarios where the client may need to display the total number of pages or items available. When handling pagination, the totalDocs value is set in the response header X-Total-Count. The client can use this information to calculate the total number of pages and make decisions on how to display the pagination controls. ye kewal brand aur category me hi find kar raha hai kyuki wahi se count ki value upper neeche ho sakta hai.
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
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    }); // new: true se hame front-end per latest product milega updated.
    res.status(200).json(updatedProduct);
  } catch (err) {
    console.log("Error creating while updating the product : ", err.message);
    res.status(400).json(err.message);
  }
};
