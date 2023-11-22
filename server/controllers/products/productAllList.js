const { getAllProducts } = require("../../models/productModel");
const productAllList = async (req, res) => {
  try {
    const page = parseInt(req.query.paging) || 0;
    const pageSize = 6;
    const [products, nextPaging] = await getAllProducts(page, pageSize);
    const response = {
      data: products,
    };
    if (nextPaging) {
      response.next_paging = nextPaging;
    }
    res.status(200).json(response);
  } catch (error) {
    console.log("Get All Product Error:", error);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = {
  productAllList,
};
