const multer = require("multer");
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    cb(new Error("Please upload an image"));
  }
  cb(null, true);
};
const limits = { fileSize: 1000000 }; // 1MB
const uploadImages = multer({ storage, fileFilter, limits }).fields([
  { name: "main_image", maxCount: 1 },
  { name: "images", maxCount: 10 },
]);

module.exports = { uploadImages };
