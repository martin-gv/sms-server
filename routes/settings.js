const express = require("express");
const router = express.Router();
const db = require("../config/database");

const User = db.models.User;

//
// ─── SETTINGS PAGE ──────────────────────────────────────────────────────────────
//

router.get("/settings", (req, res) => {
  const { email, emailNotificationRecipients } = req.user;
  const message = req.flash();
  res.render("settings", {
    message: message,
    email: email,
    emailNotificationRecipients: emailNotificationRecipients,
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
