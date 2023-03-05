const joi = require("joi");
joi.objectId = require("joi-objectid")(joi);

const productDetailsSchema = joi.object({
  productId: joi.objectId().required(),
  quantity: joi.number().min(1).required(),
  rentStartDate: joi
    .date()
    // .greater(Date.now() + 48 * 60 * 60 * 1000)
    .required(),
  rentEndDate: joi
    .date()
    // .greater(Date.now() * 72 * 60 * 60 * 1000)
    .required(),
});

const rentClothesSchema = joi.object({
  productDetails: productDetailsSchema.required(),
  renterId: joi.objectId().required(),
  totalPrice: joi.number().min(100).required(),
  orderDate: joi.date().default(Date.now()),
  returnDate: joi.date(),
  status: joi.string().trim().valid("PLACED").default("PLACED"),
});

module.exports = {
  rentClothesSchema,
};
