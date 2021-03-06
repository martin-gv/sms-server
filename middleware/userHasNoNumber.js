const userHasNoNumber = (req, res, next) => {
  if (req.user.smsNumber === null) {
    next();
    return;
  }

  req.flash("warning", "This account already has a numbered registered");
  res.redirect("/settings");
};

module.exports = userHasNoNumber;
