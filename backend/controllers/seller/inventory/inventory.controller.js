const inventoryValidation = require("../../../helpers/joi_validation/seller/inventory/inventory.validation_schema");
const asyncHandler = require("express-async-handler");
const httpErrors = require("http-errors");
const {
  sellerInventoryModel,
} = require("../../../models/seller/inventory/inventory.model");
const {
  saveFilesToDisk,
} = require("../../../helpers/helper_functions/common/fileUpload/fileUpload.helper");

const addProduct = asyncHandler(async (req, res) => {
  const productDetails = await inventoryValidation.addInventory.validateAsync(
    req.body
  );
  productDetails.images = req.files.images;
  const productExists = await sellerInventoryModel.find({
    title: productDetails.title,
    sellerId: req.seller._id,
  });
  if (productExists?.length) {
    res.status(409);
    throw httpErrors.Conflict(
      `You already have a product which uses the title "${productDetails.title}"`
    );
  }
  const productImageNames = productDetails.images?.length
    ? productDetails.images.map((image) => image.name)
    : [productDetails.images.name];
  const product = new sellerInventoryModel({
    title: productDetails.title,
    stock: productDetails.stock,
    rentPerDay: productDetails.rentPerDay,
    images: productImageNames,
    sellerId: req.seller._id,
  });
  const storeProductDetail = await product.save().catch((error) => {
    throw httpErrors.InternalServerError(error);
  });

  saveFilesToDisk(productDetails.images);

  if (!res.headersSent) {
    res.status(201).send({
      error: false,
      productDetails: storeProductDetail,
    });
  }
});

module.exports = {
  addProduct,
};
