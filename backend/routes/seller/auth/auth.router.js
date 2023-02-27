const router = require("express").Router();
const sellerController = require("../../../controllers/seller/auth/auth.controller");

router.post("/register", sellerController.registerSeller);
router.post("/login", sellerController.loginSeller);
router.post("/refresh", sellerController.refreshSellerToken);

module.exports = router;
