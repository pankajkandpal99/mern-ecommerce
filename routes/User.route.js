const { updateUser, fetchUserById } = require("../controller/User.controller");

const router = require("express").Router();
// users is already added in base path
router.get("/own", fetchUserById); // /:id dene ko jaruat nahi hai kyuki client side se koi id nahi aa ri hai iss route per, client side se id nahi aane ka reason ye hai ki server ko already pata hai ki kon sa user avi loggedIn hai isliye client ki koi v information front-end per store nahi karni hai... iss route se jab request aayegi server ko tab server iss route me apne aap deserialize ke through id req.user se le lega... jo ki iss route ka controller handle kar raha hai....
router.patch("/:id", updateUser);

exports.router = router;
