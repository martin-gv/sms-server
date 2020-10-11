const bcrypt = require("bcrypt");

//
// ─── IS AUTHENTICATED ───────────────────────────────────────────────────────────
//

exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
};

//
// ─── IS NOT AUTHENTICATED ───────────────────────────────────────────────────────
//

exports.isUnauthenticated = (req, res, next) => {
  if (req.isUnauthenticated()) {
    next();
  } else {
    res.redirect("/");
  }
};

//
// ─── HASH PASSWORD ──────────────────────────────────────────────────────────────
//

const saltRounds = 12;

exports.hashPassword = async (req, res, next) => {
  // No error on undefined password because the hashPassword() middleware isn't
  // always required in some routes (e.g. when updating fields other than password)
  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, saltRounds);
  }

  next();
};
