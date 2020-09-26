require("dotenv").config();

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
// ─── SOCKET.IO CONFIG ───────────────────────────────────────────────────────────
//

// Configure socket.io with the server
const io = require("socket.io")(server);

// Set up socket.io event listeners and other application features
// require("./config/socket.io")(io)

io.use((socket, next) => {
  // socket.io  middleware takes two arguments, so Express middleware can't be passed to
  // io.use directly since it requires three arguments. Instead, the socket.io middleware
  // arguments are passed in to the Express middleware function (sessionConfig, in this case):
  // * socket.handshake, like the req object, has a headers.cookie property
  // * sessionConfig normally checks req.headers.cookie and populates req.session
  // * in this case, sessionConfig checks socket.handshake.headers.cookie and populates socket.handshake.session
  sessionConfig(socket.handshake, {}, next);
});

const db = require("./config/database");
const Conversation = db.models.Conversation;

// socket.io connections are established when the client visit the single conversation page.
io.on("connect", (socket) => {
  // This event will subscribe the client to a room using the conversation id as the name of the room
  socket.on("conversation subscribe", async (data) => {
    // The session property is established by socket.io middleware. If the user is already
    // logged in, the session saved in the database will include a passport.user property
    const session = socket.handshake.session;

    // Check the session. If the user isn't logged in, send and error.
    if (!session.passport || !session.passport.user) {
      socket.emit("conversation error", {
        message: "Error: not authenticated",
      });
      return;
    }

    // Find the conversation in the database
    const conversation = await Conversation.findByPk(data.conversationId);

    // Check the owner of the conversation. If it isn't the current user, send an error.
    // passport.user includes the serialized user, which in this case is an id
    if (session.passport.user !== conversation.userId) {
      socket.emit("conversation error", {
        message: "Error: not authorized for requested conversation",
      });
      return;
    }

    // Join the room if none of the error checks above were triggered
    socket.join(data.conversationId);
  });
});

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

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
