const express = require("express");
const router = express.Router();

const controller = require("../controllers/billing");
const subscriptionStatusGate = require("../middleware/subscriptionStatusGate");

router.post(
  "/checkout-session",
  subscriptionStatusGate(["INCOMPLETE", "CANCELED"]),
  controller.createCheckoutSession
);

router.get("/checkout-complete/", controller.checkoutComplete);
router.get("/reactivation-complete/", controller.reactivationComplete);

router.post(
  "/portal-session",
  subscriptionStatusGate(["ACTIVE", "PAST DUE", "CANCELED"]),
  controller.createPortalSession
);

module.exports = router;
