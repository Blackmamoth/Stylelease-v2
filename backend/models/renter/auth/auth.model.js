const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const RenterSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
});

RenterSchema.pre("save", async function (next) {
  let renter = this;
  if (!renter.isModified()) return next();
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const renterModel = mongoose.model("renter", RenterSchema);

module.exports = { renterModel };
