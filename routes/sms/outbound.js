const express = require("express");
const router = express.Router();
const nexmo = require("../../config/nexmo");
const PNF = require("google-libphonenumber").PhoneNumberFormat;
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();

const { isAuthenticated } = require("../../middleware/auth");

//
// ─── ROUTE MIDDLEWARE ───────────────────────────────────────────────────────────
//

router.use("/send", isAuthenticated, userHasNumber);

//
// ─── USER HAS NUMBER MIDDLEWARE ─────────────────────────────────────────────────
//

function userHasNumber(req, res, next) {
  if (req.user.smsNumber === null) {
    req.flash("warning", "Get a number to start sending messages");
    res.redirect("/new-number");
  } else {
    next();
  }
}

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
  try {
    // Get outbound # from current user
    const from = req.user.smsNumber;

    // Get message recipient and content from form submission
    const to = req.body.recipientNumber;
    const sms = req.body.messageContent;

    // Check for international format
    if (to.charAt(0) === "+") {
      req.flash("error", `International texting not supported`);
      res.redirect("/send");
      return;
    }

    const toNumber = phoneUtil.parseAndKeepRawInput(to, "CA");
    const isValidNumber = phoneUtil.isValidNumber(toNumber);

    // Check if it's a valid number for the region
    if (isValidNumber === false) {
      req.flash(
        "error",
        `<strong>${to}</strong> is not a valid Canadian phone number`
      );
      res.redirect("/send");
      return;
    }

    // The leading + is removed because Nexmo documentation shows examples without
    // it, and also states that numbers in E.164 format 'omit ... a leading +'
    const formattedNumber = phoneUtil.format(toNumber, PNF.E164).substring(1);

    // Send text message
    nexmo.message.sendSms(from, formattedNumber, sms, (err, nexmoRes) => {
      if (err) {
        req.flash("error", "Something went wrong");
        res.redirect("/send");
      } else {
        req.flash("success", "Message sent successfully!");
        res.redirect("/send");
      }
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/send");
  }
});

//
// ─── DEFAULT EXPORT ─────────────────────────────────────────────────────────────
//

module.exports = router;
