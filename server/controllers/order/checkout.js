const axios = require("axios");
// const Redis = require("ioredis");
// const redis = new Redis({
//   host: "redis",
//   port: 6379,
// });
const { updateProductVariants, saveCheckoutDetail, checkProductStock } = require("../../models/orderModel");
const pool = require("../../database.js");
const checkout = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { prime, order } = req.body;
    await connection.beginTransaction();
    for (const item of order.list) {
      const isStockAvailable = await checkProductStock(connection, item.id, item.color.code, item.size, item.qty);
      if (!isStockAvailable) {
        return res.status(400).send("Out of stock");
      }
    }
    const paymentData = {
      prime: prime,
      partner_key: process.env.TAPPAY_PARTNER_KEY,
      merchant_id: process.env.TAPPAY_MERCHANT_ID,
      details: "TapPay Test",
      amount: order.total,
      cardholder: {
        phone_number: order.recipient.phone,
        name: order.recipient.name,
        email: order.recipient.email,
        zip_code: "123",
        address: order.recipient.address,
        national_id: "A123456789",
      },
      remember: true,
    };
    const response = await axios.post("https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime", paymentData, {
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.TAPPAY_PARTNER_KEY,
      },
    });
    console.log(response.data);
    if (response.data.status !== 0) {
      return res.status(400).send("Payment Error");
    }
    const [orderNumber, createdAt] = await saveCheckoutDetail(connection, order);
    order.list.forEach(async (item) => {
      const productId = item.id;
      const colorCode = item.color.code;
      const size = item.size;
      const qty = item.qty;
      await updateProductVariants(connection, productId, colorCode, size, qty);
      // redis.del(`productId:${productId}`);
    });
    await connection.commit();
    const data = {
      data: { number: orderNumber, time: createdAt },
    };
    res.status(200).json(data);
  } catch (error) {
    console.log("Payment Error", error);
    await connection.rollback();
    res.status(500).send("Internal Server Error");
  } finally {
    connection.release();
  }
};
module.exports = checkout;
