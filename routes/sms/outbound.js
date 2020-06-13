const express = require("express");
const router = express.Router();

const { isAuthenticated } = require("../../middleware/auth");

//
// ─── USE AUTHENTICATION ─────────────────────────────────────────────────────────
//

router.use("/send", isAuthenticated);

//
// ─── PAGE ───────────────────────────────────────────────────────────────────────
//

router.get("/send", (req, res) => {
  res.render("send");
});

//
// ─── HANDLER ────────────────────────────────────────────────────────────────────
//

router.post("/send", (req, res) => {
  res.end();
});

//
// ─── DEFAULT EXPORT ─────────────────────────────────────────────────────────────
//

module.exports = router;
