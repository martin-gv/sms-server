const express = require("express");
const router = express.Router();

const controller = require("../controllers/conversations");

router.get("/", controller.getConversation);
router.post("/", controller.validateNumber, controller.addConversation);

router.get(
  "/:conversationId",
  controller.findAndCheckOwner,
  controller.getSingleConversation
);

module.exports = router;
