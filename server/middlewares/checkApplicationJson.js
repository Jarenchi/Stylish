function checkApplicationJson(req, res, next) {
  if (req.headers["content-type"] !== "application/json") {
    return res.status(400).send("Invalid Content-Type. Only accept application/json.");
  }
  next();
}

module.exports = {
  checkApplicationJson,
};
