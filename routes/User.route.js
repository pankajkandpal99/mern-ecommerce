const { updateUser, fetchUserById } = require("../controller/User.controller");

const router = require("express").Router();
router.get("/own", fetchUserById); 
router.patch("/:id", updateUser);

exports.router = router;
