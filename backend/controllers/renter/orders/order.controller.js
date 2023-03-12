const orderValidation = require("../../../helpers/joi_validation/renter/orders/order.validation_schema");
const asyncHandler = require("express-async-handler");
const httpErrors = require("http-errors");
const { orderModel } = require("../../../models/common/orders/orders.model");
const {
  sellerInventoryModel,
} = require("../../../models/seller/inventory/inventory.model");

const orderClothes = asyncHandler(async (req, res) => {
  const orderDetails = await orderValidation.orderClothesSchema.validateAsync(
    req.body
  );
  const orderExists = await orderModel.find({
    "productDetails.productId": orderDetails.productDetails.productId,
    renterId: req.renter._id,
    $or: [{ status: "PLACED" }, { status: "SHIPPED" }, { status: "DELIVERED" }],
  });
  if (orderExists?.length) {
    throw httpErrors.Conflict(
      "It appears that you already have this item in your possession. If allowed by the thread lord, you may choose to either extend the return date or increase the quantity."
    );
  }
  const product = await sellerInventoryModel.findById(
    orderDetails.productDetails.productId
  );
  if (!product) {
    throw httpErrors.BadRequest(
      "The product you are trying to rent cannot be found."
    );
  }
  if (product.stock < 1) {
    throw httpErrors.BadRequest(
      "The product you are trying to rent seems to be out of stock."
    );
  }
  if (product.stock < orderDetails.productDetails.productId) {
    throw httpErrors.BadRequest(
      `Sorry, only ${product.stock} units of this product available at the moment. Please reduce your quantity or check back later when we have more stock.`
    );
  }
  orderDetails.productDetails.sellerId = product.sellerId;
  const order = new orderModel(orderDetails);
  const orderDetail = await order
    .save({ validateBeforeSave: false })
    .catch((error) => {
      throw httpErrors.InternalServerError(error);
    });
  if (!res.headersSent) {
    res.status(200).send({
      error: false,
      data: {
        orderDetails: orderDetail,
        message: "Successfully placed rent",
      },
    });
  }
});

const getRentersOrders = asyncHandler(async (req, res) => {
  const querySchema = await orderValidation.getOrdersSchema.validateAsync(
    req.body
  );
  let query = { renterId: req.renter._id };
  if (querySchema.orderId) query._id = querySchema.orderId;
  if (querySchema.productId)
    query["productDetails.productId"] = querySchema.productId;
  if (querySchema.rentStartDate) {
    const rentStartDate = new Date(querySchema.rentStartDate);
    rentStartDate.setMonth(rentStartDate.getMonth() + 1);
    query.rentStartDate = { $gte: querySchema.rentStartDate };
  }
  if (querySchema.rentEndDate) {
    const rentEndDate = new Date(querySchema.rentEndDate);
    rentEndDate.setMonth(rentEndDate.getMonth() + 1);
    query.rentEndDate = { $lte: querySchema.rentEndDate };
  }
  if (querySchema.status) query.status = querySchema.status;
  const orders = await orderModel
    .find(query)
    .lean()
    .catch((error) => {
      throw httpErrors.UnprocessableEntity(
        "Unable to retrieve orders from the database. Please try again later."
      );
    });
  if (!res.headersSent) {
    res.status(200).send({
      error: false,
      orderDetails: orders,
    });
  }
});

module.exports = {
  orderClothes,
  getRentersOrders,
};
