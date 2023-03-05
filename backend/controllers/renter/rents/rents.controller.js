const rentValidation = require("../../../helpers/joi_validation/renter/rents/rent.validation_schema");
const asyncHandler = require("express-async-handler");
const httpErrors = require("http-errors");
const { orderModel } = require("../../../models/common/orders/orders.model");

const rentCloth = asyncHandler(async (req, res) => {
  const rentDetails = await rentValidation.rentClothesSchema.validateAsync(
    req.body
  );
  const rentExists = await orderModel.find({
    "productDetails.productId": rentDetails.productDetails.productId,
    renterId: req.renterId,
    $or: [{ status: "PLACED" }, { status: "SHIPPED" }, { status: "DELIVERED" }],
  });
  if (rentExists?.length) {
    res.status(409);
    throw httpErrors.Conflict(
      "You already have this item in your possession, you can either extend the return date or increase the quantity if the thread lord allows it."
    );
  }
  const rent = new orderModel(rentDetails);
  const rentalDetails = await rent.save().catch((error) => {
    res.status(500);
    throw httpErrors.InternalServerError(error);
  });
  if (!res.headersSent) {
    res.status(200).send({
      error: false,
      data: {
        rentDetails: rentalDetails,
        message: "Successfully placed rent",
      },
    });
  }
});

module.exports = {
  rentCloth,
};
