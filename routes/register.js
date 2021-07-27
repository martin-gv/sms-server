const express = require("express");
const router = express.Router();

const controller = require("../controllers/register");
const { isUnauthenticated } = require("../middleware/auth");
const registrationIsEnabled = require("../middleware/registrationIsEnabled");

// The registration routes are only available to non-logged in users
router.use(isUnauthenticated);

// Check environment variable to see if registration is enabled
router.use(registrationIsEnabled);

router.get("/", controller.getRegistrationPage);
router.post("/", controller.handleRegistrationForm);

module.exports = router;
