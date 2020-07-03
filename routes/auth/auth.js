const express = require("express");
const router = express.Router();
const passport = require("passport");
const querystring = require("querystring");

//
// ─── LOGIN PAGE ─────────────────────────────────────────────────────────────────
//

router.get("/login", (req, res) => {
  const message = req.flash();
  res.render("login", {
    message: message,
    token: req.query.token,
    email: req.query.email,
  });
});

//
// ─── LOGIN HANDLER ──────────────────────────────────────────────────────────────
//

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    const queryParams = querystring.encode({
      token: req.body.token,
      email: req.body.email,
    });

    // Passport will return the 'info' object with a 'message' key if no
    // credentials are supplied. The verify callback in config/passport.js
    // will also use this 'message' key for errors. For this reason, the
    // key 'message' should be used instead of a custom key.

    if (!user) {
      req.flash("error", info.message);
      res.redirect("/login?" + queryParams);
      return;
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      // Check if user has a number assigned or not
      if (user.smsNumber === null) {
        req.flash("warning", "Get a new number to complete your account");
        res.redirect("/new-number");
        return;
      }

      // Redirect to 'reply' page if necessary
      if (req.body.token) {
        res.redirect("/reply?token=" + req.body.token);
      } else {
        res.redirect("/");
      }
    });
  })(req, res, next);
});

//
// ─── LOGOUT HANDLER ─────────────────────────────────────────────────────────────
//

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

module.exports = router;
