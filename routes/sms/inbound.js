const jwt = require("jsonwebtoken");
const querystring = require("querystring");
const db = require("../../config/database");
const mailgun = require("../../config/mailgun");

const User = db.models.User;

const secret = process.env.JWT_SECRET_KEY;

// Nexmo webhook POSTS to this route:

async function inboundSms(req, res) {
  const fromNumber = req.body.msisdn;
  const textMessage = req.body.text;

  //
  // ─── INBOUND TEXT MESSAGE ───────────────────────────────────────────────────────
  //

  // const sender = req.body.msisdn;
  const recipient = req.body.to;
  // const content = req.body.text;

  //
  // ─── LOOK UP ACCOUNT ────────────────────────────────────────────────────────────
  //

  const user = await User.findOne({
    where: { smsNumber: recipient },
  });

  const emailRecipients = user.emailNotificationRecipients;
  // .split(",")
  // .map((email) => email.trim());

  const payload = { fromNumber, textMessage };
  const token = jwt.sign(payload, secret);

  const queryParams = querystring.encode({ token: token });

  const email = {
    to: emailRecipients,
    from: "SMS Notifier <sms-notifier@mail.sms.martin-gv.com>",
    subject: `SMS from ${fromNumber}`,
    html: `
      <h3>New SMS Message</h3>
      <strong>From:</strong> ${fromNumber}<br/>
      <strong>Message:</strong> ${textMessage}<br/>
      <br/>
      <a href="${process.env.APP_DOMAIN_URL}/reply?${queryParams}">
        Click here to reply
      </a>
    `,
  };

  mailgun.messages().send(email, (error, body) => {
    if (error) {
      console.log(error);
    } else {
      console.log("email sent!");
      console.log(body);
    }
  });

  res.status(204).end();
}

module.exports = { inboundSms };
