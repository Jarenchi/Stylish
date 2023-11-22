const { getUserProfile } = require("../../models/userModel");
const userProfile = async (req, res) => {
  try {
    const user = req.user;
    console.log(user);
    const userProfileData = await getUserProfile(user.id);
    if (!userProfileData) {
      return res.status(404).json({ error: "User profile not found" });
    }
    res.status(200).json({ data: userProfileData });
  } catch (error) {
    console.log("User Profile Error", error);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = {
  userProfile,
};
