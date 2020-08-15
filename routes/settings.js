const express = require("express");
const router = express.Router();

const controller = require("../controllers/settings");

router.get("/", controller.getSettingsPage);
router.post("/", controller.handleSettingsForm);

module.exports = router;
