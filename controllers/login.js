const passport = require("passport");

//
// ─── RENDER LOGIN PAGE ──────────────────────────────────────────────────────────
//

exports.getLoginPage = (req, res) => {
  const message = req.flash();
  res.render("login", {
    message: message,
    email: req.query.email,
    css: ["login"],
  });
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
      req.session.save(function () {
        res.redirect("/login");
      });
      return;
    }

    // From the Passport docs regarding using a custom callback in passport.authenticate:
    // Note that when using a custom callback, it becomes the application's responsibility
    // to establish a session (by calling req.login()) and send a response.

    req.logIn(user, (err) => {
      if (err) return next(err);
      req.session.save(function () {
        res.redirect("/");
      });
    });
  })(req, res, next);
};
