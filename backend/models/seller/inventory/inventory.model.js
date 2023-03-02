const mongoose = require("mongoose");

const SellerInventorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 1,
    },
    rentPerDay: {
      type: Number,
      required: true,
      min: 100,
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (imgArray) => {
          return imgArray.length > 0;
        },
        message: "At least one image of the product is required",
      },
    },
    sellerId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "seller",
    },
  },
  {
    timestamps: true,
  }
);

const sellerInventoryModel = mongoose.model(
  "seller_inventory",
  SellerInventorySchema
);

module.exports = {
  sellerInventoryModel,
};
