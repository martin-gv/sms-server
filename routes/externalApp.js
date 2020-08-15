const express = require("express");
const router = express.Router();

const controller = require("../controllers/externalApp");

router.post("/send-sms", controller.handleExternalAppRequest);

module.exports = router;
