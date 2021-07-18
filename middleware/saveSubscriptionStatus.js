module.exports = (req, res, next) => {
  res.locals.hasValidSubscription =
    req.user.subscriptionStatus === "ACTIVE" ||
    req.user.subscriptionStatus === "PAST DUE";

  next();
};
