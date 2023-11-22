function validateSignUp(req, res, next) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).send("Please fill in all required fields (name, email, password).");
  }
  next();
}

module.exports = { validateSignUp };
