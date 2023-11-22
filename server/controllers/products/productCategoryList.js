const { getProductsByCategory } = require("../../models/productModel");
const productCategoryList = (category) => {
  return async (req, res) => {
    try {
      const page = parseInt(req.query.paging) || 0;
      const pageSize = 6;
      const [products, nextPaging] = await getProductsByCategory(category, page, pageSize);
      const response = {
        data: products,
      };
      if (nextPaging) {
        response.next_paging = nextPaging;
      }
      res.status(200).json(response);
    } catch (error) {
      console.log(`Get ${category} Product Error`, error);
      res.status(500).send("Internal Server Error");
    }
  };
};
module.exports = {
  productCategoryList,
};
