const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { createProduct } = require("../../models/productModel");
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
  region: process.env.AWS_BUCKET_REGION,
});

const uploadImageToS3 = async (file) => {
  try {
    const imageKey = `images/${file.fieldname}-${Date.now()}${file.originalname}`;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: imageKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    const command = new PutObjectCommand(params);
    const result = await s3.send(command);
    if (result) {
      return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${params.Key}`;
    }
  } catch (error) {
    throw new Error("Picture upload error");
  }
};

const productCreate = async (req, res) => {
  const productData = JSON.parse(req.body.data);
  console.log(productData);
  try {
    console.log(req.files);
    if (req.files.main_image && req.files.images) {
      productData.main_image = await uploadImageToS3(req.files.main_image[0]);
      const imageUrls = [];
      for (const file of req.files.images) {
        const imageUrl = await uploadImageToS3(file);
        imageUrls.push(imageUrl);
      }
      productData.images = imageUrls;
    }
    const productId = await createProduct(productData);
    res.status(201).json({
      message: "Product created successfully",
      productId: productId,
    });
  } catch (error) {
    console.log("Error creating product:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  productCreate,
};
