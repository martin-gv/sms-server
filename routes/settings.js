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
  const { email, emailNotificationRecipients } = req.user;

  let smsNumber = req.user.smsNumber;

  if (smsNumber !== null) {
    const parsedNumber = phoneUtil.parseAndKeepRawInput(smsNumber, "CA");
    smsNumber = phoneUtil.format(parsedNumber, PNF.NATIONAL);
  } else {
    smsNumber = "No number assigned to account";
  }

  const message = req.flash();
  res.render("settings", {
    message: message,
    email: email,
    emailNotificationRecipients: emailNotificationRecipients,
    smsNumber: smsNumber,
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
