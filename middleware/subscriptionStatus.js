module.exports = (req, res, next) => {
  const { subscriptionStatus } = req.user;

  res.locals.hasValidSubscription =
    subscriptionStatus === "ACTIVE" || subscriptionStatus === "PAST DUE";

  next();
};
