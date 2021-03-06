const db = require("../config/database");
const PNF = require("google-libphonenumber").PhoneNumberFormat;
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();

const User = db.models.User;

//
// ─── RENDER SETTINGS PAGE ───────────────────────────────────────────────────────
//

exports.getSettingsPage = (req, res) => {
  const { email, emailNotificationRecipients } = req.user;

  let smsNumber = req.user.smsNumber;
  const hasNumber = smsNumber ? true : false;

  if (smsNumber !== null) {
    const parsedNumber = phoneUtil.parseAndKeepRawInput(smsNumber, "CA");
    smsNumber = phoneUtil.format(parsedNumber, PNF.NATIONAL);
  } else {
    smsNumber = "This account doesn't have a number";
  }

  const message = req.flash();
  res.render("settings", {
    message: message,
    email: email,
    emailNotificationRecipients: emailNotificationRecipients,
    smsNumber: smsNumber,
    hasNumber: hasNumber,
    css: ["settings"],
  });
};

//
// ─── HANDLE SETTINGS FORM SUBMISSION ────────────────────────────────────────────
//

exports.handleSettingsForm = async (req, res) => {
  const { emailNotificationRecipients } = req.body;

  await User.update(
    { emailNotificationRecipients },
    { where: { id: req.user.id } }
  );

  req.flash("success", "Settings updated successfully!");
  res.redirect("/settings");
};
