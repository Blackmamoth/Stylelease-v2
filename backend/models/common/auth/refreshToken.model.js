const mongoose = require("mongoose");

const RefreshToken = new mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
    userType: {
      type: String,
      enum: ["SELLER", "RENTER"],
      required: true,
    },
  },
  { timestamps: true }
);

RefreshToken.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const refreshTokenModel = mongoose.model("refresh_token", RefreshToken);

module.exports = { refreshTokenModel };
