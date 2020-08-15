const express = require("express");
const router = express.Router();

const controller = require("../controllers/login");

router.get("/", controller.getLoginPage);
router.post("/", controller.handleLoginForm);

module.exports = router;
