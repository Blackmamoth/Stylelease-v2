const authValidation = require("../../../helpers/joi_validation/renter/auth/auth.validation_schema");
const asyncHandler = require("express-async-handler");
const httpErrors = require("http-errors");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const jwt = require("jsonwebtoken");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../../helpers/helper_functions/renter/auth/auth.helper");
const { renterModel } = require("../../../models/renter/auth/auth.model");
const {
  refreshTokenModel,
} = require("../../../models/common/auth/refreshToken.model");

const registerRenter = asyncHandler(async (req, res) => {
  const renterDetails =
    await authValidation.renterRegisterationSchema.validateAsync(req.body);
  const renterExists = await renterModel.find({
    email: renterDetails.email,
  });
  if (renterExists?.length) {
    throw httpErrors.Conflict(`Email ${renterDetails.email} is already in use`);
  }
  const renter = new renterModel({
    username: renterDetails.username,
    email: renterDetails.email,
    password: renterDetails.password,
    phoneNumber: renterDetails.phoneNumber,
  });
  const storeRenterDetails = await renter.save().catch((error) => {
    throw httpErrors.InternalServerError(error);
  });
  if (!res.headersSent) {
    res.status(201).send({
      error: false,
      data: {
        renterDetails: {
          _id: storeRenterDetails._id,
          username: storeRenterDetails.username,
          email: storeRenterDetails.email,
          phoneNumber: storeRenterDetails.phoneNumber,
        },
        message: "You are successfully registered",
      },
    });
  }
});

const loginRenter = asyncHandler(async (req, res) => {
  const renterDetails = await authValidation.renterLoginSchema.validateAsync(
    req.body
  );
  const renter = await renterModel.findOne({ email: renterDetails.email });
  if (!renter) {
    throw httpErrors.NotFound(
      "Renter not found, Please check your Email and try again"
    );
  }
  if (await bcrypt.compare(renterDetails.password, renter.password)) {
    const renterRefreshTokens = await refreshTokenModel.find({
      userId: renter._id,
      userType: "RENTER",
    });
    if (renterRefreshTokens?.length) {
      renterRefreshTokens.forEach(async (token) => token.delete());
    }
    const access_token = generateAccessToken(renter);
    const refresh_token = await generateRefreshToken(renter);
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
          renterDetails: {
            _id: renter._id,
            username: renter.username,
            email: renter.email,
            phoneNumber: renter.phoneNumber,
          },
          message: "Logged In successfully",
        },
      });
  } else {
    throw httpErrors.Unauthorized("Incorrect password");
  }
});

const refreshRenterToken = asyncHandler(async (req, res) => {
  const refreshToken = req?.signedCookies?.refresh_token?.toString();
  const token = await refreshTokenModel.findOne({ refreshToken: refreshToken });
  if (!token) {
    throw httpErrors.UnprocessableEntity("Cannot process JWT");
  }
  const verifyToken = jwt.verify(
    refreshToken,
    process.env.RENTER_REFRESH_TOKEN_SECRET
  );
  const renterId = verifyToken.renterId;
  const renter = await renterModel.findById(renterId);
  if (!renter) {
    throw httpErrors.NotFound("Renter not found");
  }
  const access_token = generateAccessToken(renter);
  const refresh_token = await generateRefreshToken(renter);
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
        renterDetails: {
          _id: renter._id,
          username: renter.username,
          email: renter.email,
          phoneNumber: renter.phoneNumber,
        },
      },
    });
});

module.exports = {
  registerRenter,
  loginRenter,
  refreshRenterToken,
};
