const express = require("express");
const router = express.Router();
const db = require("../config/database");

const User = db.models.User;

//
// ─── SETTINGS PAGE ──────────────────────────────────────────────────────────────
//

router.get("/settings", (req, res) => {
  res.render("settings");
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

  res.redirect("/settings");
});

module.exports = router;
