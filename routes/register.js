const express = require("express");
const router = express.Router();

const controller = require("../controllers/register");
const { isUnauthenticated } = require("../middleware/auth");

// The registration routes are only available to non-logged in users
router.use(isUnauthenticated);

router.get("/", controller.getRegistrationPage);
router.post("/", controller.handleRegistrationForm);

module.exports = router;
