const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const db = require("../config/database");

const User = db.models.User;

const customFields = {
  usernameField: "email",
};

const verifyCallback = async (username, password, done) => {
  const user = await User.findOne({ where: { email: username } });

  if (!user) return done(null, false, { message: "Incorrect username" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return done(null, false, { message: "Incorrect password" });
  }

  return done(null, user);
};

const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  const user = await User.findByPk(id);
  done(null, user);
});
