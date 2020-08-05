const express = require("express");
const router = express.Router();

const controller = require("../controllers/webhooks");

router.post("/inbound-sms", controller.inboundMessage);

module.exports = router;
