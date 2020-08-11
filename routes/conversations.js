const express = require("express");
const router = express.Router();

const controller = require("../controllers/conversations");

router.use(controller.numberRequired);

router.get("/", controller.getConversation);
router.post("/", controller.validateNumber, controller.addConversation);

router.get(
  "/:conversationId",
  controller.findConversation,
  controller.checkOwner,
  controller.getSingleConversation
);

module.exports = router;
