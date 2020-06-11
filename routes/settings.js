const express = require("express");
const router = express.Router();

//
// ─── SETTINGS PAGE ──────────────────────────────────────────────────────────────
//

router.get("/settings", (req, res) => {
  res.render("settings");
});

//
// ─── SETTINGS UPDATE HANDLER ────────────────────────────────────────────────────
//

router.post("/settings", (req, res) => {
  res.redirect("/settings");
});

module.exports = router;
