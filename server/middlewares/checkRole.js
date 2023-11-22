const checkRole = (role) => {
  return (req, res, next) => {
    console.log(req.user.role);
    if (req.user.role === role) {
      next();
    } else {
      res.status(403).send("Access denied");
    }
  };
};

module.exports = checkRole;
