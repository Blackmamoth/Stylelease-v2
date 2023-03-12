const joi = require("joi");
joi.objectId = require("joi-objectid")(joi);

const getOrdersSchema = joi.object({
  orderId: joi.objectId().allow(null).default(null),
  productId: joi.objectId().allow(null).default(null),
  rentStartDate: joi.date().allow(null).default(null),
  rentEndDate: joi.date().allow(null).default(null),
  status: joi
    .string()
    .trim()
    .valid("PLACED", "SHIPPED", "DELIVERED", "RETURNED", "CANCELLED")
    .allow(null)
    .default(null),
});

const updateOrderStatusSchema = joi.object({
  orderId: joi.objectId().required(),
  status: joi
    .string()
    .trim()
    .valid("SHIPPED", "DELIVERED", "RETURNED", "CANCELLED")
    .required(),
});

module.exports = {
  getOrdersSchema,
  updateOrderStatusSchema,
};
