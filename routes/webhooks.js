const express = require("express");
const router = express.Router();

const controller = require("../controllers/webhooks");

// This route file accepts a socket.io instance for use in the inbound message controller
module.exports = (io) => {
  router.post("/inbound-sms", controller.inboundMessage(io)); // Pass in the socket.io instance

  // These routes do not use the socket.io instance
  router.post("/delivery-receipts", controller.deliveryReceipts);
  router.post("/stripe-events", controller.stripeEvents);

  return router;
};
