const express = require("express");
const router = express.Router();

const controller = require("../controllers/conversations");

router.get("/", controller.getConversation);
router.post("/", controller.addConversation);

router.get('/:conversationId', controller.getSingleConversation);

module.exports = router;
