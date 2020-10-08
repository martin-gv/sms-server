const db = require("../config/database");
const twilio = require("../config/twilio");

const User = db.models.User;

//
// ─── RENDER NEW NUMBER PAGE ─────────────────────────────────────────────────────
//

exports.getNewNumberPage = (req, res) => {
  const twilioSearchOptions = {
    smsEnabled: true,
    mmsEnabled: true,
    voiceEnabled: true,
    limit: 5,
  };

  if (req.query.areaCode) {
    twilioSearchOptions.areaCode = req.query.areaCode;
  }

  twilio
    .availablePhoneNumbers("CA")
    .local.list(twilioSearchOptions)
    .then((twilioRes) => {
      // twilioRes is an array of number objects. These are some useful properties:
      // * phoneNumber - E.164 formatted
      // * friendlyName - e.g. (123) 456-7890

      if (twilioRes.length === 0 && req.query.areaCode) {
        req.flash(
          "areaCodeWarning",
          `No numbers available for the area code <strong>${req.query.areaCode}</strong>`
        );
      }

      res.render("new-number", {
        message: req.flash(),
        availableNumbers: twilioRes, // Twilio response
        areaCode: req.query.areaCode,
        js: ["new-number"],
        css: ["new-number"],
      });
    });
};

//
// ─── HANDLE NEW NUMBER FORM SUBMISSION ──────────────────────────────────────────
//

exports.handleNewNumberForm = (req, res) => {
  const selectedNumber = req.body.selectedNumber;

  twilio.incomingPhoneNumbers
    .create({
      phoneNumber: selectedNumber,
      smsUrl: "https://sms.martin-gv.com/webhooks/inbound-sms",
    })
    .then(async (twilioRes) => {
      // Add the new number to the user's account
      const currentUser = req.user;
      await User.update(
        { smsNumber: selectedNumber },
        { where: { id: currentUser.id } }
      );

      // Success message
      req.flash(
        "primary",
        "Your new number is now registered. Start sending text messages below!"
      );

      // Go to homepage
      res.redirect("/");
    });
};
