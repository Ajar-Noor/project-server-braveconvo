const JWT = require("jsonwebtoken");
const userModel = require("../Models/userModel");
const JWT_SECRET = process.env.JWT_SECRET_KEY;

const authentication = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    // If token will not found from request
    if (!token) {
      return res.status(403).json("INVALID USER");
    }

    const decodedToken = JWT.verify(token, JWT_SECRET);

    // If token will not verified
    if (!decodedToken) {
      return res.status(403).json("INVALID USER");
    }

    // Get the user detail to verify the token _id
    const user = await userModel.findById(decodedToken._id);

    // If user will not found
    if (!user) {
      return res.status(403).json("INVALID USER");
    }

    /* All is good, attach the decoded token to
    the request for later use in controllers */
    req.decodedToken = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json("INVALID USER");
  }
};

module.exports = {
  authentication,
};
