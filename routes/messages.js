const express = require("express");
const router = express.Router();

const controller = require("../controllers/messages");
const hasValidSubscription = require("../middleware/hasValidSubscription");

router.post(
  "/",
  hasValidSubscription, // sending chat messages requires an active subscription
  controller.sendMessage,
  controller.saveMessage
);

module.exports = router;
