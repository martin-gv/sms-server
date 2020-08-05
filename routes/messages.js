const express = require("express");
const router = express.Router();

const controller = require("../controllers/messages");

router.post("/", controller.sendMessage, controller.saveMessage);

module.exports = router;
