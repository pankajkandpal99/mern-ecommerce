const passport = require("passport");
const {
  createUser,
  loginUser,
  checkAuth,
} = require("../controller/Auth.controller");
const router = require("express").Router();

router.post("/signup", createUser);
router.post("/login", passport.authenticate("local"), loginUser); // login function jo ki Auth.controller me available hai usper jane se pehle 'passport.authenticate('local')' se successfully authentication hoga fir jakar login function per jayega..
router.get("/check", passport.authenticate("jwt"), checkAuth);

exports.router = router;