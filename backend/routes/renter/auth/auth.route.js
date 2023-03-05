const router = require("express").Router();
const renterController = require("../../../controllers/renter/auth/auth.controller");

router.post("/register", renterController.registerRenter);
router.post("/login", renterController.loginRenter);
router.post("/refresh", renterController.refreshRenterToken);

module.exports = router;
