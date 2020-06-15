const express = require("express");
const router = express.Router();
const nexmo = require("../../config/nexmo");

const { isAuthenticated } = require("../../middleware/auth");

//
// ─── USE AUTHENTICATION ─────────────────────────────────────────────────────────
//

router.use("/send", isAuthenticated);

//
// ─── PAGE ───────────────────────────────────────────────────────────────────────
//

router.get("/send", (req, res) => {
  const message = req.flash();
  res.render("send", { message: message });
});

//
// ─── HANDLER ────────────────────────────────────────────────────────────────────
//

router.post("/send", (req, res) => {
  const from = req.user.smsNumber;
  const to = req.body.recipientNumber;
  const sms = req.body.messageContent;

  nexmo.message.sendSms(from, to, sms, (err, nexmoRes) => {
    if (err) {
      req.flash("error", "Something went wrong");
      res.redirect("/send");
    } else {
      req.flash("success", "Message sent successfully!");
      res.redirect("/send");
    }
  });
});

//
// ─── DEFAULT EXPORT ─────────────────────────────────────────────────────────────
//

module.exports = router;
