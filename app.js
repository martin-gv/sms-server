require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const Nexmo = require("nexmo");
const sendgrid = require("@sendgrid/mail");
const multer = require("multer");
const addrs = require("email-addresses");
const emailReplyParser = require("node-email-reply-parser");
const passport = require("passport");
const flash = require("connect-flash");

const { inboundSms } = require("./routes/sms/inbound");
const { smsReply } = require("./routes/sms/reply");
const authRoutes = require("./routes/auth/auth");
const registerRoutes = require("./routes/auth/register");
const { isAuthenticated } = require("./middleware/auth");

const upload = multer();

const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_API_KEY,
  apiSecret: process.env.NEXMO_API_SECRET,
});

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
const port = process.env.PORT || 8080;

// For serving the SMS reply HTML file at the server root
app.use(express.static("public"));

// Both required for delivery receipts
// JSON support also required for Axios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

app.set("views", "./views");
app.set("view engine", "ejs");

//
// ─── SESSION CONFIG ─────────────────────────────────────────────────────────────
//

const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const db = require("./config/database");

const sessionStore = new SequelizeStore({ db: db });

app.use(
  session({
    secret: process.env.SESSIONS_SECRET_KEY,
    store: sessionStore,
    // connect-session-sequelize implements the touch method
    // so, per the Express docs, resave should be set to false
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 12, // 12 hours
    },
  })
);

// Creates/syncs the session table
sessionStore.sync();

//
// ─── PASSPORT CONFIG ────────────────────────────────────────────────────────────
//

require("./config/passport");
app.use(passport.initialize());
app.use(passport.session()); // must run after app.use(session())

//
// ─── DEBUG ──────────────────────────────────────────────────────────────────────
//

app.use((req, res, next) => {
  console.log("----------- debug ------------");
  console.log("location", req.originalUrl);
  console.log("session", req.session);
  console.log("user", !!req.user);
  next();
});

//
// ─── ROUTES ─────────────────────────────────────────────────────────────────────
//

app.get("/", isAuthenticated, (req, res) => {
  res.render("index");
});

app.use(authRoutes);
app.use(registerRoutes);

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
app.post("/inbound-sms", inboundSms);

// SMS reply from
app.post("/sms-reply", smsReply);

// Email to SMS
// SendGrid webook -> Nexmo API
app.post("/email-to-sms", upload.any(), (req, res) => {
  console.log("EMAIL TO SMS");

  const fromNum = process.env.NEXMO_PHONE_NUMBER; // Nexmo number

  const to = req.body.to; // email to address
  const toNum = addrs.parseOneAddress(to).local; // get phone # from email address

  const emailText = req.body.text; // email reply body text
  const sms = emailReplyParser(emailText, true);

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
