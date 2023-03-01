const joi = require("joi");
joi.objectId = require("joi-objectid")(joi);

const addInventory = joi.object({
  title: joi.string().trim().required(),
  stock: joi.number().min(1).required(),
  rentPerDay: joi.number().min(100).required(),
});

module.exports = {
  addInventory,
};
