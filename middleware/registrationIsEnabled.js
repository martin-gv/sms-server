module.exports = function (req, res, next) {
  if (process.env.NEW_ACCOUNT_REGISTRATION === "ENABLED") {
    next();
    return;
  }

  req.flash("error", "Sorry, site registration is currently closed");
  req.session.save(function () {
    res.redirect("/");
  });
};
