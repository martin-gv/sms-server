const express = require("express");
const router = express.Router();

const controller = require("../controllers/conversations");
const hasValidSubscription = require("../middleware/hasValidSubscription");

router.get("/", controller.getConversation);

router.get(
  "/:conversationId",
  controller.findConversationAndMessages,
  controller.checkOwner,
  controller.getSingleConversation
);

router.post(
  "/",
  hasValidSubscription, // creating new chats requires an active subscription
  controller.validateNumber,
  controller.addConversation
);

router.post(
  "/:conversationId/edit",
  controller.findConversation,
  controller.checkOwner,
  controller.editConversation
);

router.post(
  "/:conversationId/delete",
  controller.findConversation,
  controller.checkOwner,
  controller.deleteConversation
);

router.post(
  "/:conversationId/mark-read",
  controller.findConversation,
  controller.checkOwner,
  controller.markConversationAsRead
);

module.exports = router;
