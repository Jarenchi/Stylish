const { getSearchProducts } = require("../../models/productModel");
const productSearch = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const page = parseInt(req.query.paging) || 0;
    const pageSize = 6;
    const [products, nextPaging] = await getSearchProducts(keyword, page, pageSize);
    const response = {
      data: products,
    };
    if (nextPaging) {
      response.next_paging = nextPaging;
    }
    res.status(200).json(response);
  } catch (error) {
    console.log("Error creating product:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  productSearch,
};
