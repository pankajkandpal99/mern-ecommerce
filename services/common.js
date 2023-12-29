const passport = require("passport");

// route middleware -->
exports.isAuth = (req, res, done) => {
  return passport.authenticate("jwt"); // jwt ke successfully verification ke baad hi kisi bhi route ko aage jane diya jayega jo ki index.js me route me mention hai...
};

// ye sanitizeUser function ka kaam ye hai ki ye kewal limited details hi server ke response me bhejega aur extra details hata dega like --> password, salt, etc... in sabko ye function hata dega.
exports.sanitizeUser = (user) => {
  return { id: user.id, role: user.role };
};
