require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const flash = require("connect-flash");

const { inboundSms } = require("./routes/sms/inbound");
const { smsReply } = require("./routes/sms/reply");
const authRoutes = require("./routes/auth/auth");
const registerRoutes = require("./routes/auth/register");
const settingsRoutes = require("./routes/settings");
const outboundSmsRoutes = require("./routes/sms/outbound");
const newNumberRoutes = require("./routes/new-number");
const externalApp = require("./routes/externalApp");

const { isAuthenticated } = require("./middleware/auth");

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
// ─── INDEX ROUTE ────────────────────────────────────────────────────────────────
//

app.get("/", (req, res) => {
  res.redirect("/send");
});

//
// ─── ROUTES ─────────────────────────────────────────────────────────────────────
//

app.use(authRoutes); // login and logout
app.use(registerRoutes);
app.use(settingsRoutes);
app.use(outboundSmsRoutes);
app.use(newNumberRoutes);

//
// ─── EXTERNAL APP INTEGRATION ───────────────────────────────────────────────────
//

app.post("/sms", externalApp);

//
// ─── INBOUND SMS -> EMAIL NOTIFICATION ────────────────────────────────────────────
//

// Used by the Nexmo webhook
app.post("/inbound-sms", inboundSms);

//
// ─── OUTBOUND SMS REPLIES ───────────────────────────────────────────────────────
//

app.get("/reply", isAuthenticated, (req, res) => {
  res.render("index", { loggedIn: Boolean(req.user) });
});

app.post("/sms-reply", smsReply);

//
// ─── OTHER ROUTES ───────────────────────────────────────────────────────────────
//

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
