const Nexmo = require("nexmo");
const jwt = require("jsonwebtoken");

const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_API_KEY,
  apiSecret: process.env.NEXMO_API_SECRET,
});

const secret = process.env.JWT_SECRET_KEY;
const from = process.env.NEXMO_PHONE_NUMBER;

function smsReply(req, res) {
  const payload = jwt.verify(req.body.token, secret);
  const to = payload.fromNumber;

  const sms = req.body.sms;

  nexmo.message.sendSms(from, to, sms, (err, nexmoRes) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.status(200).json(nexmoRes);
    }
  });
}

module.exports = { smsReply };
