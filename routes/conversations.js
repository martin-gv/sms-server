const express = require("express");
const router = express.Router();

const controller = require("../controllers/conversations");

router.get(controller.getConversation);
router.post(controller.addConversation);

module.exports = router;
