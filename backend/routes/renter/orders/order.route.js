const router = require("express").Router();
const orderController = require("../../../controllers/renter/orders/order.controller");
const rentersAuthMiddleware = require("../../../middleware/renter/auth/auth.middleware");

router.post(
  "/order-product",
  rentersAuthMiddleware.renterProtectedRoute,
  orderController.orderClothes
);

router.post(
  "/get-orders",
  rentersAuthMiddleware.renterProtectedRoute,
  orderController.getRentersOrders
);

module.exports = router;
