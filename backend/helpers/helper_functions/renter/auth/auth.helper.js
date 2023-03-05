const jwt = require("jsonwebtoken");
const {
  refreshTokenModel,
} = require("../../../../models/common/auth/refreshToken.model");
const httpErrors = require("http-errors");

const generateAccessToken = (renter) => {
  return jwt.sign(
    { renterId: renter._id },
    process.env.RENTER_ACCESS_TOKEN_SECRET,
    {
      expiresIn: 1800,
    }
  );
};

const generateRefreshToken = async (renter) => {
  const token = jwt.sign(
    { renterId: renter._id },
    process.env.RENTER_REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );
  await refreshTokenModel
    .create({
      userId: renter._id,
      refreshToken: token,
      userType: "RENTER",
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
