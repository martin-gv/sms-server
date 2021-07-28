module.exports = function (statuses = []) {
  return function (req, res, next) {
    for (const status of statuses) {
      if (req.user.subscriptionStatus === status) {
        next();
        return;
      }
    }

    // The user's subscription status didn't match any of the statuses
    req.flash("error", "Sorry, there was an error");
    req.session.save(() => res.redirect("/"));
  };
};
