const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { renterModel } = require("../../../models/renter/auth/auth.model");
const httpErrors = require("http-errors");

const renterProtectedRoute = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const verifyJWT = jwt.verify(
        token,
        process.env.RENTER_ACCESS_TOKEN_SECRET
      );
      req.seller = await renterModel
        .findById(verifyJWT?.sellerId)
        .select("-password");
      next();
    } catch (error) {
      throw httpErrors.Unauthorized("Request not authorized");
    }
  }
  if (!token) {
    throw httpErrors.Unauthorized("Request not authorized, no token");
  }
});

module.exports = {
  renterProtectedRoute,
};
