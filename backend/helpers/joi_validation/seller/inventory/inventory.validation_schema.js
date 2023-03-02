const joi = require("joi");
joi.objectId = require("joi-objectid")(joi);

const addProductSchema = joi.object({
  title: joi.string().trim().required(),
  stock: joi.number().min(1).required(),
  rentPerDay: joi.number().min(100).required(),
});

const getProductsSchema = joi.object({
  productId: joi.objectId().allow(null).default(null),
  title: joi.string().trim().allow(null).default(null),
  stock: joi.number().min(1).allow(null).default(null),
  rentPerDay: joi.number().min(100).allow(null).default(null),
});

const updateProductSchema = joi.object({
  productId: joi.objectId().required(),
  title: joi.string().trim(),
  stock: joi.number().min(1),
  rentPerDay: joi.number().min(100),
  imagesToRemove: joi.string(),
});

const deleteProductSchema = joi.object({
  productId: joi.objectId().required(),
});

module.exports = {
  addProductSchema,
  getProductsSchema,
  updateProductSchema,
  deleteProductSchema,
};
