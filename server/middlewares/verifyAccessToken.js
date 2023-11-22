const jwt = require("jsonwebtoken");

function verifyAccessToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  if (!token.startsWith("Bearer ")) {
    return res.status(403).json({ error: "Invalid token format" });
  }
  const accessToken = token.split(" ")[1];
  jwt.verify(accessToken, process.env.HIDDEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
}

module.exports = verifyAccessToken;
