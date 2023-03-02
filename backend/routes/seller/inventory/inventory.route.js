const router = require("express").Router();
const fileUpload = require("express-fileupload");
const inventoryController = require("../../../controllers/seller/inventory/inventory.controller");
const fileUploadMiddleware = require("../../../middleware/common/fileUpload/fileUpload.middleware");
const authMiddleware = require("../../../middleware/seller/auth/auth.middleware");

router.post(
  "/add-product",
  authMiddleware.sellerProtectedRoute,
  fileUpload({ createParentPath: true }),
  fileUploadMiddleware.filePayloadExists,
  fileUploadMiddleware.fileExtensionLimiter,
  fileUploadMiddleware.filenameMiddleware,
  inventoryController.addProduct
);

router.post(
  "/get-products",
  authMiddleware.sellerProtectedRoute,
  inventoryController.getProducts
);

router.patch(
  "/update-product",
  authMiddleware.sellerProtectedRoute,
  fileUpload({ createParentPath: true }),
  fileUploadMiddleware.fileExtensionLimiter,
  fileUploadMiddleware.filenameMiddleware,
  inventoryController.updateProduct
);

router.delete(
  "/delete-product",
  authMiddleware.sellerProtectedRoute,
  inventoryController.deleteProduct
);

module.exports = router;
