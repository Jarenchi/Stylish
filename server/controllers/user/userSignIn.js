const { authenticateUser, getUserByEmail, getUserPassword } = require("../../models/userModel");
const { generateAccessToken, checkValidPassword } = require("../../utils/utils");
const userSignIn = async (req, res) => {
  try {
    if (req.body.provider === "native") {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).send("Please fill in all required fields (provider, email, password).");
      }
      const existingUser = await getUserByEmail(email);
      if (!existingUser) {
        return res.status(404).send("User not found");
      }
      const hashedPassword = await getUserPassword(email);
      const isPasswordValid = checkValidPassword(password, hashedPassword);
      if (!isPasswordValid) {
        return res.status(401).send("Authentication failed");
      }
      const userData = await authenticateUser(email);
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
    }
  } catch (error) {
    console.log("User SignIn Error", error);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = {
  userSignIn,
};
