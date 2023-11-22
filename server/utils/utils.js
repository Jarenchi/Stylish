const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}
const options = {
  expiresIn: "1h",
};
function generateAccessToken(user) {
  return jwt.sign(user, process.env.HIDDEN_SECRET, options);
}
function checkValidPassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}
module.exports = {
  generateAccessToken,
  hashPassword,
  checkValidPassword,
};
