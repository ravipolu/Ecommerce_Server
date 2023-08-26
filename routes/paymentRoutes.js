const express = require("express");
const router = express.Router();
const { isAuthenticatedUser } = require("../middleWare/auth");
const { processPayment, sendStripeApiKey } = require("../controllers/paymentController");

// isAuthenticatedUser

router.route("/payment/process").post( isAuthenticatedUser, processPayment )
router.route("/stripeapikey").get( sendStripeApiKey )



module.exports = router;


