const { User } = require("../model/User.model");
const crypto = require("crypto");
const { sanitizeUser, sendMail } = require("../services/common");
const jwt = require("jsonwebtoken");
const { use } = require("passport");

// signup
exports.createUser = async (req, res) => {
  try {
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
      req.body.password,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        const user = new User({
          ...req.body,
          password: hashedPassword,
          salt: salt,
        });
        const doc = await user.save();
        // console.log(doc);

        // signup ke baad ek login session create nahi hota hai, iska ye matlab hua ki jab user signup karega to ya to passport usse login karne ko kahega kyuki passport kewal login functionality hi provide karta hain jisse signup ke baad session me data store nahi ho payega, isi functionality ko provide karane ke liye ye 'req.login()' use kiya ja raha hai...jisme req.login ke andar sanitizeUser(doc) me user ka data hai jo session create karega uss doc me kewal id aur role hi session me jakar store hoga kyuki sanitizeUser kewal id aur role hi session ko bhejega.
        req.login(sanitizeUser(doc), (err) => {
          // this also calls serializeer...
          if (err) {
            res.status(400).json(err.message);
          } else {
            const token = jwt.sign(
              sanitizeUser(doc),
              process.env.JWT_SECRET_KEY
            );
            res
              .cookie("jwt", token, {
                expires: new Date(Date.now() + 3600000),
                httpOnly: true,
              })
              .status(201)
              .json({ id: doc.id, role: doc.role });
          }
        });
      }
    ); // crypto.pbkdf2 ek Node.js module crypto ka method hai jo Password-Based Key Derivation Function 2 (PBKDF2) ka istemal karta hai. Iska upayog password se kriptografik key nikalne ke liye hota hai. PBKDF2 ek surakshit tarika hai jo password ke hash ko banane me ek computational cost jodta hai, jisse brute-force attacks ke khilaf adhik suraksha milti hai.
  } catch (err) {
    console.log("Error occured while creating new user : ", err.message);
    res.status(400).json(err.message);
  }
};

// login
exports.loginUser = async (req, res) => {
  const user = req.user;
  console.log("login successfull");
  res
    .cookie("jwt", user.token, {
      // passport se authentication successfully complete ho jane ke baad client se header me cookie set kar di gayi hai jiske andar jwt jayega, aur har request per server use cookieExtractor se extract bhi kar lega...
      expires: new Date(Date.now() + 3600000), // 1 day
      httpOnly: true,
    })
    .status(200)
    .json({ id: user.id, role: user.role });

  console.log("cookie sent to client.");
};

// ye function server based function hai jo frontend se call karne per pata lagata hai ki ye request authenticated hai ya nahi ...
exports.checkAuth = async (req, res) => {
  console.log("checking user..");

  if (req.user) {
    console.log("req.user -> ", req.user);
    res.json(req.user);
  } else {
    console.log("req.user is not available..");
    res.sendStatus(401);
  }
};

exports.resetPasswordRequest = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email }); // req.body ka mail pehle check kiya jayega ki ye mail available hai ya nahi database me ....
  if (user) {
    const token = crypto.randomBytes(48).toString("hex"); // ye token user ko email ke saath jayega jo ki uski identification v hogi ki ye token jab password reset ke saath dobara server tak aayega fir ye check karega ki ye token jiss user ko email ke through gaya tha ky ye wahi token hai ya fir koi dusra token hai.. ye token ek random string hai jo ki kaafi secure hai...
    user.resetPasswordToken = token;
    await user.save();

    // Also set token in email
    const resetPageLink = `http://localhost:3000/reset-password?token=${token}&email=${email}`;
    const subject = "reset password for e-commerce";
    const html = `<p>Click <a href='${resetPageLink}'> here </a> to reset your password.</p>`;

    // send mail and a token in the mail body so we can verify thet user has clicked right link

    if (email) {
      console.log(email);
      const response = await sendMail({ to: email, subject, html });

      res.json(response);
    } else {
      res.sendStatus(400);
    }
  } else {
    res.sendStatus(400);
  }
};

exports.resetPassword = async (req, res) => {
  const { email, token, password } = req.body;
  // console.log(email, password, token);

  const user = await User.findOne({ email, resetPasswordToken: token }); // database me available email aur resetPasswordToken agar req.body se aaye data se match kiye to hi server req ko aage jane dega nahi to error throw kar dega...
  if (user) {
    // then saved new password in database and remove previous..
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
      password,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        user.password = hashedPassword;
        user.salt = salt;
        await user.save();

        // sent email to successfully reset password.
        const subject = "password successfully reset for e-commerce";
        const html = `<p>Successfully able to Reset Password</p>`;

        if (email) {
          const response = await sendMail({ to: email, subject, html });
          res.json(response);
        } else {
          res.sendStatus(400);
        }
      }
    );
  } else {
    res.sendStatus(400);
  }
};

// logout controller
exports.logoutUser = async (req, res) => {
  res
    .cookie("jwt", null, {
      expires: new Date(Date.now()), // cookie user ko null bhejkar usi time expire bhi ho jayegi.
      httpOnly: true,
    })
    .sendStatus(200);

  console.log("logout successfull");
};
