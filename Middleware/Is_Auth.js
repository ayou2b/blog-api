const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorisation.split(" ")[1];

    if (!token) {
      return res.status(401).json({ errorMessage: "Token Not Found" });
    }

    const decodedToken = jwt.verify(token, "mysecret");

    req.userData = { userId: decodedToken.userId };

    next();
  } catch (err) {
    console.log(err);
  }
};
