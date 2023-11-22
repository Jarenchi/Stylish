const { getOrderHistory } = require("../../models/orderModel");

const orderHistory = async (req, res) => {
  try {
    const user = req.user;
    console.log(user);
    const orderData = await getOrderHistory(user.id);
    const response = {
      data: orderData,
    };
    res.status(200).json(response);
  } catch (error) {
    console.log("Get Order History Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = orderHistory;
