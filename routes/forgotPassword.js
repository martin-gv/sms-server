const express = require("express");
const router = express.Router();

const controller = require("../controllers/forgotPassword");

// Forgot password request
router.get("/", controller.renderForgotPasswordPage);
router.post(
  "/",
  controller.handleForgotPasswordForm,
  controller.renderForgotPasswordSuccessPage
);

// Password reset
router.get("/reset", controller.renderPasswordResetPage);
router.post("/reset", controller.handlePasswordResetForm);

module.exports = router;
