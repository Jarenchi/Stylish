function checkContentType(req, res, next) {
  const contentType = req.get("Content-Type");
  if (!contentType || !contentType.startsWith("multipart/form-data")) {
    return res.status(400).send("Invalid Content-Type. Only multipart/form-data is accepted.");
  }
  next();
}

module.exports = {
  checkContentType,
};
