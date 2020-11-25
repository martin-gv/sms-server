const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const db = require("./database");

const sessionStore = new SequelizeStore({ db: db });

// Creates/syncs the session table
sessionStore.sync();

const sessionConfig = session({
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  // connect-session-sequelize implements the touch method
  // so, per the Express docs, resave should be set to false
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 12, // 12 hours
  },
});

module.exports = sessionConfig;
