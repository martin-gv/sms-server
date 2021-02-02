const express = require("express");
const router = express.Router();

const controller = require("../controllers/infusionsoft");

router.post("/:accountKey", controller.handleInfusionsoftHttpPost);

module.exports = router;
