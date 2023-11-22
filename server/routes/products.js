const express = require("express");
const { productAllList } = require("../controllers/products/productAllList.js");
const { productCreate } = require("../controllers/products/productCreate.js");
const { productCategoryList } = require("../controllers/products/productCategoryList.js");
const { productDetails } = require("../controllers/products/productDetails.js");
const { productSearch } = require("../controllers/products/productSearch.js");
const { checkContentType } = require("../middlewares/checkFormData.js");
const { uploadImages } = require("../middlewares/uploadImages.js");
const router = express.Router();
router.post("/", checkContentType, uploadImages, productCreate);
router.get("/all", productAllList);
router.get("/women", productCategoryList("women"));
router.get("/men", productCategoryList("men"));
router.get("/accessories", productCategoryList("accessories"));
router.get("/details", productDetails);
router.get("/search", productSearch);

module.exports = router;
