const orderValidation = require("../../../helpers/joi_validation/seller/orders/order.validation_schema");
const asyncHandler = require("express-async-handler");
const httpErrors = require("http-errors");
const { orderModel } = require("../../../models/common/orders/orders.model");

const validateStatus = (order, newStatus, res) => {
  const ORDER_STATUS = [
    "PLACED",
    "SHIPPED",
    "DELIVERED",
    "RETURNED",
    "CANCELLED",
  ];
  const currentStatus = order.status;
  if (newStatus === "CANCELLED") return true;
  const currentIndex = ORDER_STATUS.indexOf(currentStatus);
  const newIndex = ORDER_STATUS.indexOf(newStatus);
  if (newIndex !== currentIndex + 1) {
    throw httpErrors.UnprocessableEntity(
      `The order status can only be updated sequentially and cannot be reversed. The order in which status can be updated is PLACED -> SHIPPED -> DELIVERED -> RETURNED`
    );
  }
  return true;
};

const getSellersOrders = asyncHandler(async (req, res) => {
  const querySchema = await orderValidation.getOrdersSchema.validateAsync(
    req.body
  );
  let query = { "productDetails.sellerId": req.seller._id };
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

const updateOrderStatus = asyncHandler(async (req, res) => {
  const orderDetails =
    await orderValidation.updateOrderStatusSchema.validateAsync(req.body);
  const order = await orderModel.findOne({
    _id: orderDetails.orderId,
    status: { $ne: "CANCELLED" },
  });
  if (!order) {
    throw httpErrors.BadRequest(
      `Order with id ${orderDetails.orderId} not found.`
    );
  }
  if (!order.productDetails.sellerId.equals(req.seller._id)) {
    throw httpErrors.Forbidden(
      "You are not allowed to make changes to this product"
    );
  }

  const isValidStatus = validateStatus(order, orderDetails.status);
  if (isValidStatus) {
    const updatedStatus = await orderModel.findOneAndUpdate(
      { _id: order._id },
      { status: orderDetails.status },
      { new: true }
    );
    res.status(200).send({
      error: false,
      data: {
        orderDetails: updatedStatus,
        message: `Order status successfully updated to ${orderDetails.status}`,
      },
    });
  }
});

module.exports = {
  updateOrderStatus,
  getSellersOrders,
};
