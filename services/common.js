const passport = require("passport");
const nodemailer = require("nodemailer");

// Email Section -->
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for others
  auth: {
    user: "pankajkandpal99@gmail.com",
    pass: process.env.MAIL_PASS,
  },
});

// Email endpoint ->

exports.sendMail = async function ({ to, subject, text, html }) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"E-Commerce 👻" <pankajkandpal99@gmail.com>', // sender address
    to, // list of receivers, multiple receivers can be there..
    subject, // Subject line
    text, // plain text body
    html, // html body
  });

  return info;
};

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
  // token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1OGYxMjU3NTA4YjZhOGFjMDMwMTkwNCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzA0MjczOTIzfQ.F32xpPVftuqd7wZO7WEu45NqxCRF-T8T7PRtbo3u9fk'
  return token;
};
