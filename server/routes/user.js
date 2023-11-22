const express = require("express");
const { userSignUp } = require("../controllers/user/userSignUp");
const { userSignIn } = require("../controllers/user/userSignIn");
const { userProfile } = require("../controllers/user/userProfile");
const { checkApplicationJson } = require("../middlewares/checkApplicationJson");
const { validateSignUp } = require("../middlewares/validateSignUp");
const verifyAccessToken = require("../middlewares/verifyAccessToken");
const router = express.Router();
router.post("/signup", checkApplicationJson, validateSignUp, userSignUp);
router.post("/signin", checkApplicationJson, userSignIn);
router.get("/profile", verifyAccessToken, userProfile);

module.exports = router;
