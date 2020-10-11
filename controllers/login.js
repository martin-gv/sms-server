const passport = require("passport");

//
// ─── RENDER LOGIN PAGE ──────────────────────────────────────────────────────────
//

exports.getLoginPage = (req, res) => {
  const message = req.flash();
  res.render("login", { message: message, email: req.query.email });
};

//
// ─── HANDLE LOGIN FORM SUBMISSION ───────────────────────────────────────────────
//

exports.handleLoginForm = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    // Passport will return the 'info' object with a 'message' key if no
    // credentials are supplied. The verify callback in config/passport.js
    // will also use this 'message' key for errors. For this reason, the
    // key 'message' should be used instead of a custom key.

    if (!user) {
      req.flash("error", info.message);
      res.redirect("/login");
      return;
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      // Check if user has a number assigned or not
      if (user.smsNumber === null) {
        req.flash("warning", "Get a new number to complete your account");
        res.redirect("/new-number");
      } else {
        res.redirect("/");
      }
    });
  })(req, res, next);
};
