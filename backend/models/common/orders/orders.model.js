const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: "seller_inventory",
  },
  quantity: {
    type: Number,
    required: true,
  },
  rentStartDate: {
    type: Date,
    required: true,
  },
  rentEndDate: {
    type: Date,
    required: true,
  },
});

const OrderSchema = new mongoose.Schema({
  productDetails: ProductSchema,
  renterId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: "renter",
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 100,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  returnDate: {
    type: Date,
  },
  status: {
    type: String,
    required: true,
    enum: ["PLACED", "SHIPPED", "DELIVERED", "RETURNED", "CANCELLED"],
    default: "PLACED",
  },
});

const orderModel = mongoose.model("order", OrderSchema);

module.exports = {
  orderModel,
};
