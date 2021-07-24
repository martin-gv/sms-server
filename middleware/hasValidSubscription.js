module.exports = (req, res, next) => {
  if (
    req.user.subscriptionStatus === "ACTIVE" ||
    req.user.subscriptionStatus === "PAST DUE"
  ) {
    next();
    return;
  }

  req.flash("error", "Error: subscription is not active");
  req.session.save(function () {
    res.redirect("/settings");
  });
};
