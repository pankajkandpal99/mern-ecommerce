const { createUser, loginUser } = require("../controller/Auth.controller");

const router = require("express").Router();

router.post("/signup", createUser);
router.post("/login", loginUser);

exports.router = router;
