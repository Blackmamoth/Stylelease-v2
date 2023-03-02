const inventoryValidation = require("../../../helpers/joi_validation/seller/inventory/inventory.validation_schema");
const asyncHandler = require("express-async-handler");
const httpErrors = require("http-errors");
const {
  sellerInventoryModel,
} = require("../../../models/seller/inventory/inventory.model");
const {
  saveFilesToDisk,
  removeFilesFromDisk,
} = require("../../../helpers/helper_functions/common/fileUpload/fileUpload.helper");

const addProduct = asyncHandler(async (req, res) => {
  const productDetails =
    await inventoryValidation.addProductSchema.validateAsync(req.body);
  productDetails.images = req.files.images;
  const productExists = await sellerInventoryModel.find({
    title: productDetails.title,
    sellerId: req.seller._id,
  });
  if (productExists?.length) {
    res.status(409);
    throw httpErrors.Conflict(
      `Product with title ${productDetails.title} already exists in your inventory`
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

const getProducts = asyncHandler(async (req, res) => {
  const querySchema = await inventoryValidation.getProductsSchema.validateAsync(
    req.body
  );
  let query = {};
  if (querySchema.productId) query._id = querySchema.productId;
  if (querySchema.title) query.title = querySchema.title;
  if (querySchema.stock) query.stock = { $gte: querySchema.stock };
  if (querySchema.rentPerDay)
    query.rentPerDay = { $gte: querySchema.rentPerDay };
  const products = await sellerInventoryModel
    .find(query)
    .lean()
    .catch((error) => {
      throw httpErrors.UnprocessableEntity(
        "Unable to retrieve products from the database"
      );
    });
  if (!res.headersSent) {
    res.status(200).send({
      error: false,
      productDetails: products,
    });
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const productDetails =
    await inventoryValidation.updateProductSchema.validateAsync(req.body);
  const isTitleTaken = await sellerInventoryModel.find({
    _id: { $ne: [productDetails.productId] },
    title: productDetails.title,
    sellerId: req.seller._id,
  });
  if (isTitleTaken?.length) {
    res.status(409);
    throw httpErrors.Conflict(
      `Product with title ${productDetails.title} already exists in your inventory`
    );
  }
  const product = await sellerInventoryModel
    .findById(productDetails.productId)
    .catch((error) => {
      httpErrors.UnprocessableEntity(
        `Cannot find product with id ${productDetails.productId}`
      );
    });
  productDetails.images = product.images;
  let productImageNames = [];
  let newImages;
  let imagesToRemove = [];
  if (req.files) {
    newImages = req.files.images;
    if (newImages?.length)
      productImageNames = newImages?.map((image) => image.name);
    else productImageNames = [newImages?.name];
    productDetails.images = product.images.concat(productImageNames);
  }
  if (productDetails.imagesToRemove) {
    imagesToRemove = JSON.parse(productDetails.imagesToRemove);
    if (imagesToRemove?.length) {
      imagesToRemove.forEach((image) => {
        const index = productDetails.images.findIndex(
          (productImage) => productImage === image
        );
        productDetails.images.includes(image)
          ? productDetails.images.splice(index, 1)
          : null;
      });
    }
  }
  product.updateOne(productDetails, { new: true }).catch((error) => {
    throw httpErrors.UnprocessableEntity(
      `An error occured while updating product: ${product.title}`
    );
  });
  if (newImages) saveFilesToDisk(newImages);
  if (imagesToRemove) removeFilesFromDisk(imagesToRemove);
  if (!res.headersSent) {
    res.status(202).send({
      error: false,
      data: {
        message: "Product updated successfully",
      },
    });
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const productDetails =
    await inventoryValidation.deleteProductSchema.validateAsync(req.body);
  const product = await sellerInventoryModel
    .findById(productDetails.productId)
    .catch((error) => {
      throw httpErrors.UnprocessableEntity(
        `Cannot find product with id ${productDetails.productId}`
      );
    });
  const productImageNames = product.images;
  await product.delete();
  removeFilesFromDisk(productImageNames);
  if (!res.headersSent) {
    res.status(202).send({
      error: false,
      data: {
        message: "Product successfully deleted",
      },
    });
  }
});

module.exports = {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};
