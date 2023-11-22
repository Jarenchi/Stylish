const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger.json");
const productsRouter = require("./routes/products.js");
const userRouter = require("./routes/user.js");
const orderRouter = require("./routes/order.js");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/1.0/products", productsRouter);
app.use("/api/1.0/user", userRouter);
app.use("/api/1.0/order", orderRouter);
app.use("/admin", express.static("admin"));
app.listen(port, () => {
  console.log(`the application is running on localhost:${port}`);
});
