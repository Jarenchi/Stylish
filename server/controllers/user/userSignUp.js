const { createUser, getUserByEmail } = require("../../models/userModel");
const { generateAccessToken, hashPassword } = require("../../utils/utils");
const userSignUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).send("Email Already Exists");
    }
    const hashedPassword = hashPassword(password);
    const userData = await createUser(name, email, hashedPassword);
    const accessToken = generateAccessToken(userData);
    const accessExpired = 3600; // 1hr
    const response = {
      data: {
        access_token: accessToken,
        access_expired: accessExpired,
        user: userData,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    console.log("User SignUp Error", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  userSignUp,
};
