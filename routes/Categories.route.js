const router = require("express").Router();
const {
  fetchAllCategories,
  createCatgory,
} = require("../controller/Category.controller");

router.get("/", fetchAllCategories);
router.post("/", createCatgory);

exports.router = router;
