const twilio = require("../config/twilio");

//
// ─── HANDLE EXTERNAL APP REQUEST ────────────────────────────────────────────────
//

exports.handleExternalAppRequest = (req, res, next) => {
  // This handler function allows external apps to send text messages
  // by sending in a POST request. This allows external apps to easily
  // integrate with this application (e.g. a CRM can send text messages to contacts)

  const from = req.body.from;
  const to = req.body.to;
  const sms = req.body.sms;

  twilio.messages
    .create({
      body: sms,
      from: from,
      to: to,
    })
    .then((message) => {
      res.status(200).json(message);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
};
