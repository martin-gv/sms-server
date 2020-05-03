require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const Nexmo = require("nexmo");

const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_API_KEY,
  apiSecret: process.env.NEXMO_API_SECRET,
});

const app = express();
const port = process.env.PORT || 8080;

// Both required for delivery receipts
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/sms", (req, res) => {
  const from = "17809000958";
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

app.post("/inbound-sms", (req, res) => {
  console.log("INBOUND SMS");
  console.log("body:", req.body);
  res.status(204).end();
});

app.post("/delivery-receipt", (req, res) => {
  console.log("DELIVERY RECEIPT");
  console.log("body:", req.body);
  res.status(204).end();
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
