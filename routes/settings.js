const express = require("express");
const router = express.Router();
const db = require("../config/database");
const PNF = require("google-libphonenumber").PhoneNumberFormat;
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();

const User = db.models.User;
const { isAuthenticated } = require("../middleware/auth");

//
// ─── USE AUTHENTICATION ─────────────────────────────────────────────────────────
//

router.use("/settings", isAuthenticated);

//
// ─── SETTINGS PAGE ──────────────────────────────────────────────────────────────
//

router.get("/settings", (req, res) => {
  const { email, emailNotificationRecipients, smsNumber } = req.user;

  const number = phoneUtil.parseAndKeepRawInput(smsNumber, "CA");
  const formattedNumber = phoneUtil.format(number, PNF.NATIONAL);

  const message = req.flash();
  res.render("settings", {
    message: message,
    email: email,
    emailNotificationRecipients: emailNotificationRecipients,
    formattedNumber: formattedNumber,
  });
});

//
// ─── SETTINGS UPDATE HANDLER ────────────────────────────────────────────────────
//

router.post("/settings", async (req, res) => {
  const { emailNotificationRecipients } = req.body;

  await User.update(
    { emailNotificationRecipients },
    { where: { id: req.user.id } }
  );

  req.flash("success", "Settings updated successfully!");
  res.redirect("/settings");
});

module.exports = router;
