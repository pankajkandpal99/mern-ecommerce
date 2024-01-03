const passport = require("passport");

// route middleware -->
exports.isAuth = (req, res, done) => {
  return passport.authenticate("jwt"); // jwt ke successfully verification ke baad hi kisi bhi route ko aage jane diya jayega jo ki index.js me route me mention hai...
};

// ye sanitizeUser function ka kaam ye hai ki ye kewal limited details hi server ke response me bhejega aur extra details hata dega like --> password, salt, etc... in sabko ye function hata dega.
exports.sanitizeUser = (user) => {
  return { id: user.id, role: user.role };
};

exports.cookieExtractor = function (req) {
  console.log("cookie extracting -- ");
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  // TODO: this is temporary token for testing without cookie --> jab cookieExtractor ko jwt call karega (kyuki cookie ke andar hi browser per token store hota hai) to jwt ko ek bana banaya same token hi cookie extrator se return go jayega, ye cheating hai but baad me hum ise fix kar denge..
  // token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1OGYxZTQ2MGFjNjU4MjAzOWM5MjJkMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcwNDI2OTU5MH0.2SqAaRsKvZjPmlWawQ0-wFMNDEioAiS9ZyC8okkspIA'
  // console.log(req.cookies);
  return token;
};
