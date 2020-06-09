const sendgrid = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");
const querystring = require("querystring");

const secret = process.env.JWT_SECRET_KEY;

function inboundSms(req, res, next) {
  const fromNumber = req.body.msisdn;
  const textMessage = req.body.text;

  const emailRecipients = process.env.SMS_TO_EMAIL_RECIPIENTS.split(",");

  const payload = { fromNumber, textMessage };
  const token = jwt.sign(payload, secret);

  const queryParams = querystring.encode({ token: token });

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
      <a href="${process.env.APP_DOMAIN_URL}/?${queryParams}">
        Click here to reply
      </a>
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
