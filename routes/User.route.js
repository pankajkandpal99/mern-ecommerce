const { updateUser, fetchUserById } = require("../controller/User.controller");

const router = require("express").Router();
// users is already added in base path
router.get("/:id", fetchUserById);
router.patch("/:id", updateUser);

exports.router = router;