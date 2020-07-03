const nexmo = require("../config/nexmo");

// This handler function allows external apps to send text messages
// by sending in a POST request. This allows external apps to easily
// integrate with this application.

function externalApp(req, res) {
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
}

module.exports = externalApp;
