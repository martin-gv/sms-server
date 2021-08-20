const http = require("http");
const express = require("express");
const passport = require("passport");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8080;

//
// ─── PUBLIC FOLDER CONFIG ───────────────────────────────────────────────────────
//

app.use(express.static("public"));

//
// ─── BODY PARSER CONFIG ─────────────────────────────────────────────────────────
//

const bodyParser = require("body-parser");

// JSON parsing is required for requests coming from Axios on the front end
app.use(
  bodyParser.json({
    // The raw body is required to verify Stripe webhook signatures.
    // The code here is based on this example from the Stripe docs: https://github.com/stripe-samples/checkout-single-subscription/blob/master/server/node/server.js
    // The raw body is saved only when requests hit the Stripe webhook
    verify: function (req, res, buf) {
      if (req.originalUrl === "/webhooks/stripe-events") {
        req.rawBody = buf.toString();
      }
    },
  })
);

// URL encoded parsing is required for Twilio webhooks
app.use(bodyParser.urlencoded({ extended: true }));

//
// ─── FLASH MESSAGES CONFIG ──────────────────────────────────────────────────────
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

// This session middleware establishes new sessions, looks up existing sessions
// in the store using req.headers.cookie, and populates req.session
const sessionConfig = require("./config/session");
app.use(sessionConfig);

//
// ─── PASSPORT CONFIG ────────────────────────────────────────────────────────────
//

require("./config/passport");

// passport.initialize() sets up Passport and allows authentication strategies to be used.
// When a user succesfully logs in Passport will serialize the user (in this case, the id only)
// and save it to the session's data under the property passport.user.
app.use(passport.initialize());

// passport.session() deserializes the user found in req.session.passport.user and, if present,
// saves it in req.user. Important: it must run after app.use(sessionConfig). Later in the request's
// lifecycle, a call to req.isAuthenticated() will check if the property req.user exists.
app.use(passport.session());

//
// ─── SOCKET.IO CONFIG ───────────────────────────────────────────────────────────
//

// Configure socket.io with the server
const io = require("socket.io")(server);

// Set up socket.io event listeners and other application features
require("./config/socket.io")(io);

//
// ─── EXTERNAL APP INTEGRATION - API ─────────────────────────────────────────────
//

const externalAppRoutes = require("./routes/externalApp");
app.use("/api/v1/", externalAppRoutes);

//
// ─── WEBHOOKS ───────────────────────────────────────────────────────────────────
//

// The webhook route file accepts a socket.io instance for use in the inbound message controller
const webhookRoutes = require("./routes/webhooks")(io);
app.use("/webhooks", webhookRoutes);

//
// ─── USER LOGIN, LOGOUT, AND REGISTRATION ───────────────────────────────────────
//

const loginRoutes = require("./routes/login");
const logoutRoutes = require("./routes/logout");
const registerRoutes = require("./routes/register");
const forgotPasswordRoutes = require("./routes/forgotPassword");

app.use("/login", loginRoutes);
app.use("/logout", logoutRoutes);
app.use("/register", registerRoutes);
app.use("/forgot-password", forgotPasswordRoutes);

//
// ─── MAIN APP ROUTES ────────────────────────────────────────────────────────────
//

// Include route files
const conversationRoutes = require("./routes/conversations");
const messageRoutes = require("./routes/messages");
const settingsRoutes = require("./routes/settings");
const newNumberRoutes = require("./routes/newNumber");
const billingRoutes = require("./routes/billing");

// Add authentication
const { isAuthenticated } = require("./middleware/auth");
app.use(isAuthenticated); // Authentication required for all routes below this point

// Set up default index route
app.get("/", (req, res) => {
  res.redirect("/conversations");
});

// Save user's subscription status
const saveSubscriptionStatus = require("./middleware/saveSubscriptionStatus");
app.use(saveSubscriptionStatus);

// Use route files
app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);
app.use("/settings", settingsRoutes);
app.use("/new-number", newNumberRoutes);
app.use("/billing", billingRoutes);

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

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
