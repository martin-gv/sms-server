const express = require("express");
const router = express.Router();

const controller = require("../controllers/conversations");

// All conversation routes require an SMS number linked to the user's account
router.use(controller.numberRequired);

router.get("/", controller.getConversation);
router.post("/", controller.validateNumber, controller.addConversation);

router.get(
  "/:conversationId",
  controller.findConversationAndMessages,
  controller.checkOwner,
  controller.getSingleConversation
);

router.post(
  "/:conversationId/edit",
  controller.findConversation,
  controller.checkOwner,
  controller.editConversation
);

module.exports = router;
