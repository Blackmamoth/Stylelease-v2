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
  try {
    const sellerDetails =
      await authValidation.sellerRegisterationSchema.validateAsync(req.body);
    const checkSellerExists = await sellerModel.find({
      email: sellerDetails.email,
    });
    if (checkSellerExists?.length) {
      res.status(400);
      throw httpErrors.Conflict(
        `Email ${sellerDetails.email} is already in use`
      );
    }
    const seller = await sellerModel.create(sellerDetails);
    res.status(201).send({
      error: false,
      data: {
        sellerDetails: {
          _id: seller._id,
          username: seller.username,
          email: seller.email,
          storeName: seller.storeName,
        },
        message: "You are successfully registered",
      },
    });
  } catch (error) {
    if (error?.isJoi) {
      res.status(422);
    }
    res.send({
      error: true,
      data: {
        message: error.message,
      },
    });
  }
});

const loginSeller = asyncHandler(async (req, res) => {
  try {
    const sellerDetails = await authValidation.sellerLoginSchema.validateAsync(
      req.body
    );
    const seller = await sellerModel.findOne({ email: sellerDetails.email });
    if (!seller) {
      res.status(400);
      throw httpErrors.NotFound(
        "Seller not found, Please check your Email and try again"
      );
    }
    if (await bcrypt.compare(sellerDetails.password, seller.password)) {
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
    }
  } catch (error) {
    if (error?.isJoi) {
      res.status(422);
    }
    res.send({
      error: true,
      data: {
        message: error.message,
      },
    });
  }
});

const refreshSellerToken = asyncHandler(async (req, res) => {
  try {
    const refreshToken = req?.signedCookies?.refresh_token.toString();
    const token = await refreshTokenModel.findOne({
      refreshToken: refreshToken,
      userType: "SELLER",
    });
    if (!token) {
      res.status(422);
      throw httpErrors.UnprocessableEntity("Cannot process JWT");
    }
    const verifyToken = jwt.verify(
      refreshToken,
      process.env.SELLER_REFRESH_TOKEN_SECRET
    );
    const sellerId = verifyToken.sellerId;
    const seller = await sellerModel.findById(sellerId);
    if (!seller) {
      res.status(404);
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
  } catch (error) {
    res.send({
      error: true,
      data: {
        message: error.message,
      },
    });
  }
});

module.exports = {
  registerSeller,
  loginSeller,
  refreshSellerToken,
};
