const db = require("../config/database");
const nexmo = require("../config/nexmo");
const PNF = require("google-libphonenumber").PhoneNumberFormat;
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();

const User = db.models.User;

//
// ─── RENDER NEW NUMBER PAGE ─────────────────────────────────────────────────────
//

exports.getNewNumberPage = (req, res) => {
  const searchOptions = {
    pattern: "1",
    search_pattern: 0, // start with the pattern
    features: "SMS",
    size: 5,
  };

  if (req.query.areaCode) {
    searchOptions.pattern = "1" + req.query.areaCode;
  }

  nexmo.number.search("CA", searchOptions, (error, response) => {
    if (error) {
      req.flash("error", error.message);
      res.redirect("/new-number");
      return;
    }

    const availableNumbers = [];

    if (response.numbers === undefined && req.query.areaCode) {
      req.flash(
        "areaCodeWarning",
        `No numbers available for area code <strong>${req.query.areaCode}</strong>`
      );
    }

    if (response.numbers !== undefined) {
      response.numbers.forEach((number) => {
        const parsed = phoneUtil.parseAndKeepRawInput(number.msisdn, "CA");
        const formatted = phoneUtil.format(parsed, PNF.NATIONAL);

        const data = { msisdn: number.msisdn, formatted: formatted };
        availableNumbers.push(data);
      });
    }

    res.render("new-number", {
      message: req.flash(),
      availableNumbers: availableNumbers,
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

  nexmo.number.buy("CA", selectedNumber, async (error, response) => {
    if (error) {
      req.flash("error", error.message);
      res.redirect("/new-number");
      return;
    }

    const currentUser = req.user;

    await User.update(
      { smsNumber: selectedNumber },
      { where: { id: currentUser.id } }
    );

    req.flash(
      "primary",
      "Your new number is now registered. Start sending text messages below!"
    );
    res.redirect("/");
  });
};
