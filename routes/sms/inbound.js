const sendgrid = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET_KEY;

function inboundSms(req, res, next) {
  const fromNumber = req.body.msisdn;
  const textMessage = req.body.text;

  const emailRecipients = process.env.SMS_TO_EMAIL_RECIPIENTS.split(",");

  const payload = { fromNumber };
  const token = jwt.sign(payload, secret);

  const email = {
    to: emailRecipients,
    from: {
      name: "SMS Notifier",
      email: `sms-notifier@${process.env.SENDGRID_VERIFIED_DOMAIN}`,
    },
    subject: `SMS from ${fromNumber}`,
    html: `
      <h3>New SMS Message</h3>
      <strong>From:</strong> ${fromNumber}<br/>
      <strong>Message:</strong> ${textMessage}<br/>
      <br/>
      <a href="${process.env.APP_DOMAIN_URL}/?token=${token}">Click here to reply</a>
    `,
  };

  sendgrid
    .send(email)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.log(error.response.body);
    });

  res.status(204).end();
}

module.exports = { inboundSms };
