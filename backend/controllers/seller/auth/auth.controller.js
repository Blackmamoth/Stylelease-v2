const authValidation = require("../../../helpers/joi_validation/seller/auth/auth.validation_schema");
const asyncHandler = require("express-async-handler");
const httpErrors = require("http-errors");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../../helpers/helper_functions/seller/auth/auth.helper");
const { sellerModel } = require("../../../models/seller/auth/auth.model");
const {
  refreshTokenModel,
} = require("../../../models/common/auth/refreshToken.model");

const registerSeller = asyncHandler(async (req, res) => {
  const sellerDetails =
    await authValidation.sellerRegisterationSchema.validateAsync(req.body);
  const checkSellerExists = await sellerModel.find({
    email: sellerDetails.email,
  });
  if (checkSellerExists?.length) {
    throw httpErrors.Conflict(`Email ${sellerDetails.email} is already in use`);
  }
  const seller = new sellerModel({
    username: sellerDetails.username,
    email: sellerDetails.email,
    phoneNumber: sellerDetails.phoneNumber,
    storeName: sellerDetails.storeName,
    password: sellerDetails.password,
  });
  const storeSellerDetails = await seller.save().catch((err) => {
    throw httpErrors.InternalServerError(err);
  });
  res.status(201).send({
    error: false,
    data: {
      sellerDetails: {
        _id: storeSellerDetails._id,
        username: storeSellerDetails.username,
        email: storeSellerDetails.email,
        storeName: storeSellerDetails.storeName,
      },
      message: "Registration successful",
    },
  });
});

const loginSeller = asyncHandler(async (req, res) => {
  const sellerDetails = await authValidation.sellerLoginSchema.validateAsync(
    req.body
  );
  const seller = await sellerModel.findOne({ email: sellerDetails.email });
  if (!seller) {
    throw httpErrors.NotFound(
      "Seller not found, please check your email and try again."
    );
  }
  if (await bcrypt.compare(sellerDetails.password, seller.password)) {
    const sellerRefreshTokens = await refreshTokenModel.find({
      userId: seller._id,
      userType: "SELLER",
    });
    if (sellerRefreshTokens?.length) {
      sellerRefreshTokens.forEach(async (token) => await token.delete());
    }
    const access_token = generateAccessToken(seller);
    const refresh_token = await generateRefreshToken(seller);
    res
      .status(200)
      .cookie("refresh_token", refresh_token, {
        secure: process.env.NODE_ENV == "production",
        signed: true,
        httpOnly: true,
        sameSite: true,
        expires: new Date(moment().endOf("day")),
      })
      .send({
        error: false,
        data: {
          access_token,
          sellerDetails: {
            _id: seller._id,
            username: seller.username,
            email: seller.email,
            storeName: seller.storeName,
          },
        },
        message: "Logged In successfully",
      });
  } else {
    throw httpErrors.Unauthorized("Incorrect password");
  }
});

const refreshSellerToken = asyncHandler(async (req, res) => {
  const refreshToken = req?.signedCookies?.refresh_token?.toString();
  if (!refreshToken) {
    throw httpErrors.Unauthorized("Request not authorized, no token");
  }
  const token = await refreshTokenModel.findOne({
    refreshToken: refreshToken,
    userType: "SELLER",
  });
  if (!token) {
    throw httpErrors.UnprocessableEntity("Cannot process JWT");
  }
  const verifyToken = jwt.verify(
    refreshToken,
    process.env.SELLER_REFRESH_TOKEN_SECRET
  );
  const sellerId = verifyToken.sellerId;
  const seller = await sellerModel.findById(sellerId);
  if (!seller) {
    throw httpErrors.NotFound("Thread Lord not found");
  }
  const access_token = generateAccessToken(seller);
  const refresh_token = await generateRefreshToken(seller);
  await token.delete();
  res
    .cookie("refresh_token", refresh_token, {
      secure: process.env.NODE_ENV == "production",
      signed: true,
      httpOnly: true,
      sameSite: true,
      expires: new Date(moment().endOf("day")),
    })
    .send({
      error: false,
      data: {
        access_token,
        sellerDetails: {
          _id: seller._id,
          username: seller.username,
          email: seller.email,
          storeName: seller.storeName,
        },
      },
    });
});

module.exports = {
  registerSeller,
  loginSeller,
  refreshSellerToken,
};
