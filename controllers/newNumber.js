const db = require("../config/database");
const twilio = require("../config/twilio");

const User = db.models.User;

const PROVINCES = {
  AB: "Alberta",
  BC: "British Columbia",
  MB: "Manitoba",
  NB: "New Brunswick",
  NL: "Newfoundland and Labrador",
  NT: "Northwest Territories",
  NS: "Nova Scotia",
  NU: "Nunavut",
  ON: "Ontario",
  PE: "Prince Edward Island",
  QC: "Quebec",
  SK: "Saskatchewan",
  YT: "Yukon",
};

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

  if (req.query.province) {
    twilioSearchOptions.inRegion = req.query.province;
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

      // Show message about results of succesful search
      if (twilioRes.length > 0) {
        if (req.query.areaCode) {
          req.flash(
            "searchSuccess",
            `Showing results for area code <strong>${req.query.areaCode}</strong>`
          );
        }

        if (req.query.province) {
          req.flash(
            "searchSuccess",
            `Showing results for <strong>${
              PROVINCES[req.query.province]
            }</strong>`
          );
        }
      }

      res.render("new-number", {
        message: req.flash(),
        availableNumbers: twilioRes, // Twilio response
        areaCode: req.query.areaCode,
        province: req.query.province,
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
