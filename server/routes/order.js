const express = require("express");
const { checkApplicationJson } = require("../middlewares/checkApplicationJson");
const checkout = require("../controllers/order/checkout");
const orderHistory = require("../controllers/order/orderHistory");
const verifyAccessToken = require("../middlewares/verifyAccessToken");
const router = express.Router();
router.post("/checkout", checkApplicationJson, verifyAccessToken, checkout);
router.get("/history", verifyAccessToken, orderHistory);
module.exports = router;
