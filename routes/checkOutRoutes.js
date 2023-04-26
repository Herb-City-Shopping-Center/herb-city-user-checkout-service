const express = require("express");
const router = express.Router();
const { checkOut } = require("../controllers/checkOutControllers");

router.route("/create-checkout-session").post(checkOut);

module.exports = router;
