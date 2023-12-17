const { getProductDetails } = require("../../models/productModel");
// const Redis = require("ioredis");
// const redis = new Redis({
//   host: "redis",
//   port: 6379,
// });
const productDetails = async (req, res) => {
  try {
    const productId = req.query.id;
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }
    // const cachedProductDetails = await redis.get(`productId:${productId}`);
    // if (cachedProductDetails) {
    //   const productDetails = JSON.parse(cachedProductDetails);
    //   console.log("get data from redis");
    //   return res.status(200).json({ data: productDetails });
    // }
    const productDetails = await getProductDetails(productId);
    console.log(productDetails);
    if (!productDetails) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    // await redis.set(`productId:${productId}`, JSON.stringify(productDetails));
    const response = {
      data: productDetails,
    };
    res.status(200).json(response);
  } catch (error) {
    console.log("Product Detail Error", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  productDetails,
};
