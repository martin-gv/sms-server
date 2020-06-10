const express = require("express");
const router = express.Router();
const passport = require("passport");
const querystring = require("querystring");

router.get("/login", (req, res) => {
  const message = req.flash();
  const tokenParam = req.query.token;
  res.render("login", { message: message, token: tokenParam });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    const tokenParam = querystring.encode({ token: req.body.token });

    // Passport will return the 'info' object with a 'message' key if no
    // credentials are supplied. The verify callback in config/passport.js
    // will also use this 'message' key for errors. For this reason, the
    // key 'message' should be used instead of a custom key.

    if (!user) {
      req.flash("error", info.message);
      res.redirect("/login?" + tokenParam);
      return;
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      res.redirect("/?" + tokenParam);
    });
  })(req, res, next);
});

module.exports = router;
