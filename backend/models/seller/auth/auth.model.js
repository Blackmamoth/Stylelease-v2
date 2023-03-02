const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Seller = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

Seller.pre("save", async function (next) {
  let seller = this;
  if (!seller.isModified()) return next();
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const sellerModel = mongoose.model("seller", Seller);

module.exports = { sellerModel };
