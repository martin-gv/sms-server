const nexmo = require("../config/nexmo");

//
// ─── HANDLE EXTERNAL APP REQUEST ────────────────────────────────────────────────
//

exports.handleExternalAppRequest = (req, res) => {
  // This handler function allows external apps to send text messages
  // by sending in a POST request. This allows external apps to easily
  // integrate with this application (e.g. a CRM can send text messages to contacts)

  const from = req.body.from;
  const to = req.body.to;
  const sms = req.body.sms;

  nexmo.message.sendSms(from, to, sms, (err, nexmoRes) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.status(200).json(nexmoRes);
    }
  });
};
