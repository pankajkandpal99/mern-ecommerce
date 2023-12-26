const router = require("express").Router();
const {
  fetchAllBrands,
  createBrand,
} = require("../controller/Brand.controller");

router.get("/", fetchAllBrands);
router.post("/", createBrand);

module.exports = router;
