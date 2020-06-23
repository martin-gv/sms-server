const querystring = require("querystring");
const bcrypt = require("bcrypt");

//
// ─── IS AUTHENTICATED ───────────────────────────────────────────────────────────
//

exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    // Incoming SMS messages trigger an email notification. The email
    // includes a link with a URL param 'token'. The token contains
    // data about the SMS message and is used after the user logs in to
    // show the correct message.
    const query = querystring.encode(req.query);
    res.redirect("/login?" + query);
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
