const jwt = require("jsonwebtoken");
const {
  refreshTokenModel,
} = require("../../../../models/common/auth/refreshToken.model");
const httpErrors = require("http-errors");

const generateAccessToken = (seller) => {
  return jwt.sign(
    { sellerId: seller._id },
    process.env.SELLER_ACCESS_TOKEN_SECRET,
    {
      expiresIn: 1800,
    }
  );
};

const generateRefreshToken = async (seller) => {
  const token = jwt.sign(
    { sellerId: seller._id },
    process.env.SELLER_REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );
  await refreshTokenModel
    .create({
      userId: seller._id,
      refreshToken: token,
      userType: "SELLER",
    })
    .catch((error) => {
      throw httpErrors.InternalServerError(
        "An error occured while saving refresh token to MongoDB Server"
      );
    });
  return token;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
