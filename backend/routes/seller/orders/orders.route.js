const router = require("express").Router();
const orderController = require("../../../controllers/seller/orders/orders.controller");
const authMiddleware = require("../../../middleware/seller/auth/auth.middleware");

router.post(
  "/get-orders",
  authMiddleware.sellerProtectedRoute,
  orderController.getSellersOrders
);

router.patch(
  "/update-order",
  authMiddleware.sellerProtectedRoute,
  orderController.updateOrderStatus
);

module.exports = router;
