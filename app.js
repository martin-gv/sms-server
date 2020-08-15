require("dotenv").config();

const express = require("express");
const passport = require("passport");

const app = express();
const port = process.env.PORT || 8080;

//
// ─── PUBLIC FOLDER CONFIG ───────────────────────────────────────────────────────
//

app.use(express.static("public"));

//
// ─── BODY PARSER CONFIG ─────────────────────────────────────────────────────────
//

const bodyParser = require("body-parser");

// Both json and urlencoded are required for delivery receipts according to Nexmo documentation.
// JSON support is also required for requests coming from Axios on the front end.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//
// ─── USE FLASH MESSAGES ─────────────────────────────────────────────────────────
//

const flash = require("connect-flash");
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
// ─── EXTERNAL APP INTEGRATION - API ─────────────────────────────────────────────
//

const externalAppRoutes = require("./routes/externalApp");
app.use("/api/v1/", externalAppRoutes);

//
// ─── WEBHOOKS ───────────────────────────────────────────────────────────────────
//

const webhookRoutes = require("./routes/webhooks");
app.use("/webhooks", webhookRoutes);

//
// ─── USER LOGIN, LOGOUT, AND REGISTRATION ───────────────────────────────────────
//

const loginRoutes = require("./routes/login");
const logoutRoutes = require("./routes/logout");
const registerRoutes = require("./routes/register");

app.use("/login", loginRoutes);
app.use("/logout", logoutRoutes);
app.use("/register", registerRoutes);

//
// ─── MAIN APP ROUTES ────────────────────────────────────────────────────────────
//

// Include route files
const conversationRoutes = require("./routes/conversations");
const messageRoutes = require("./routes/messages");
const settingsRoutes = require("./routes/settings");
const newNumberRoutes = require("./routes/newNumber");

// Add authentication
const { isAuthenticated } = require("./middleware/auth");
app.use(isAuthenticated); // Authentication required for all routes below this point

// Set up default index route
app.get("/", (req, res) => {
  res.redirect("/conversations");
});

// Use route files
app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);
app.use("/settings", settingsRoutes);
app.use("/new-number", newNumberRoutes);

//
// ─── CATCH ALL ──────────────────────────────────────────────────────────────────
//

app.get("*", (req, res) => {
  res.redirect("/");
});

//
// ─── ERROR HANDLER ──────────────────────────────────────────────────────────────
//

const errorHandler = require("./controllers/errorHandler");
app.use(errorHandler);

//
// ─── START SERVER ───────────────────────────────────────────────────────────────
//

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
