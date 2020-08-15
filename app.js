require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const flash = require("connect-flash");

const settingsRoutes = require("./routes/settings");
const newNumberRoutes = require("./routes/new-number");
const externalApp = require("./routes/externalApp");

const { isAuthenticated } = require("./middleware/auth");

const app = express();
const port = process.env.PORT || 8080;

//
// ─── PUBLIC FOLDER CONFIG ───────────────────────────────────────────────────────
//

app.use(express.static("public"));

//
// ─── BODY PARSER CONFIG ─────────────────────────────────────────────────────────
//

// Both are required for delivery receipts according to Nexmo documentation.
// JSON support is also required for requests coming from Axios on the front end
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//
// ─── USE FLASH MESSAGES ─────────────────────────────────────────────────────────
//

app.use(flash());

//
// ─── TEMPLATE ENGINE CONFIG ─────────────────────────────────────────────────────
//

app.set("views", "./views");
app.set("view engine", "ejs");

//
// ─── SESSION CONFIG ─────────────────────────────────────────────────────────────
//

const sessionConfig = require("./config/session");
app.use(sessionConfig);

//
// ─── PASSPORT CONFIG ────────────────────────────────────────────────────────────
//

require("./config/passport");
app.use(passport.initialize());
app.use(passport.session()); // must run after app.use(session())

//
// ─── DEFAULT ROUTE ──────────────────────────────────────────────────────────────
//

app.get("/", (req, res) => {
  res.redirect("/conversations");
});

//
// ─── ROUTES ─────────────────────────────────────────────────────────────────────
//

app.use(settingsRoutes);
app.use(newNumberRoutes);

//
// ─── EXTERNAL APP INTEGRATION ───────────────────────────────────────────────────
//

app.post("/sms", externalApp);

//
// ─── WEBHOOKS ───────────────────────────────────────────────────────────────────
//

const webhookRoutes = require("./routes/webhooks");
app.use("/webhooks", webhookRoutes);

//
// ─── USER LOGIN AND REGISTRATION ────────────────────────────────────────────────
//

const loginRoutes = require("./routes/login");
const registerRoutes = require("./routes/register");

app.use("/login", loginRoutes);
app.use("/register", registerRoutes);

//
// ─── LOGOUT ─────────────────────────────────────────────────────────────────────
//

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

//
// ─── AUTHENTICATION REQUIRED FOR ROUTES BELOW THIS POINT ────────────────────────
//

app.use(isAuthenticated);

//
// ─── CONVERSATIONS AND MESSAGES ─────────────────────────────────────────────────
//

const conversationRoutes = require("./routes/conversations");
const messageRoutes = require("./routes/messages");

app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);

//
// ─── TEMP CATCH-ALL ─────────────────────────────────────────────────────────────
//

app.use("*", (req, res) => {
  const error = { status: 404, message: "invalid endpoint" };
  res.status(404).json({ error });
});

//
// ─── ERROR HANDLER ──────────────────────────────────────────────────────────────
//

const errorHandler = require("./controllers/errorHandler");
app.use(errorHandler);

//
// ─── START UP APP ───────────────────────────────────────────────────────────────
//

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
