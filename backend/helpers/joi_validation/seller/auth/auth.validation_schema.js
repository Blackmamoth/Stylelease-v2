const joi = require("joi");
const { joiPasswordExtendCore } = require("joi-password");
const joiPassword = joi.extend(joiPasswordExtendCore);
joi.objectId = require("joi-objectid")(joi);

const sellerRegisterationSchema = joi.object({
  username: joi.string().trim().required(),
  email: joi.string().email().trim().required(),
  storeName: joi.string().trim().required(),
  phoneNumber: joi
    .string()
    .trim()
    .pattern(/^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/)
    .required(),
  password: joiPassword
    .string()
    .trim()
    .min(8)
    .max(16)
    .minOfSpecialCharacters(1)
    .minOfLowercase(1)
    .minOfUppercase(1)
    .minOfNumeric(1)
    .noWhiteSpaces()
    .required(),
});

const sellerLoginSchema = joi.object({
  email: joi.string().email().trim().required(),
  password: joiPassword
    .string()
    .trim()
    .min(8)
    .max(16)
    .minOfSpecialCharacters(1)
    .minOfLowercase(1)
    .minOfUppercase(1)
    .minOfNumeric(1)
    .noWhiteSpaces()
    .required(),
});

module.exports = {
  sellerRegisterationSchema,
  sellerLoginSchema,
};
