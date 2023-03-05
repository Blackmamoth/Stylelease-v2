const router = require("express").Router();
const rentController = require("../../../controllers/renter/rents/rents.controller");
const authMiddleware = require("../../../middleware/renter/auth/auth.middleware");

router.post(
  "/rent-product",
  authMiddleware.renterProtectedRoute,
  rentController.rentCloth
);

module.exports = router;
