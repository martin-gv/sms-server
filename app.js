// @todo emoji support

require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const Nexmo = require("nexmo");
const sendgrid = require("@sendgrid/mail");
const multer = require("multer");
const addrs = require("email-addresses");
const replyParser = require("node-email-reply-parser");

const upload = multer();

const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_API_KEY,
  apiSecret: process.env.NEXMO_API_SECRET,
});

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
const port = process.env.PORT || 8080;

// Both required for delivery receipts
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Receive external POST request -> Send SMS
app.post("/sms", (req, res) => {
  const from = process.env.NEXMO_PHONE_NUMBER; // Nexmo number
  const to = req.body.to;
  const sms = req.body.sms;

  nexmo.message.sendSms(from, to, sms, (err, nexmoRes) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.status(200).json(nexmoRes);
    }
  });
});

// SMS to Email
// Nexmo webhook -> SendGrid API
app.post("/inbound-sms", (req, res) => {
  const fromNumber = req.body.msisdn;
  const textMessage = req.body.text;

  const recipients = process.env.SMS_TO_EMAIL_RECIPIENTS.split(",");

  const email = {
    to: recipients,
    from: {
      name: "SMS Notifier",
      email: `${fromNumber}@${process.env.SENDGRID_VERIFIED_DOMAIN}`,
    },
    subject: `SMS from ${fromNumber}`,
    text: textMessage,
    // html: "<strong>and easy to do anywhere, even with Node.js</strong>",
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
});

// Email to SMS
// SendGrid webook -> Nexmo API
app.post("/email-to-sms", upload.any(), (req, res) => {
  console.log("EMAIL TO SMS");

  const fromNum = process.env.NEXMO_PHONE_NUMBER; // Nexmo number

  const to = req.body.to; // email to address
  const toNum = addrs.parseOneAddress(to).local; // get phone # from email address

  const emailText = req.body.text; // email reply body text
  const sms = replyParser(emailText, true);

  nexmo.message.sendSms(fromNum, toNum, sms, (err, nexmoRes) => {
    if (err) {
      console.log(err);
      res.status(500).end();
    } else {
      console.log("SMS sent ✔️");
      res.status(204).end(); // send response to SendGrid
    }
  });
});

// Delivery receipts (Nexmo webhook)
app.post("/delivery-receipt", (req, res) => {
  console.log("DELIVERY RECEIPT");
  console.log("body:", req.body);
  res.status(204).end();
});

app.use("*", (req, res) => {
  const error = { status: 404, message: "invalid endpoint" };
  res.status(404).json({ error });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
