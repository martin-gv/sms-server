const errorHandler = (err, req, res, next) => {
  const message = { error: "Sorry. There was an error" };
  const loggedIn = Boolean(req.user);
  res.render("error", { message: message, loggedIn: loggedIn });
};

module.exports = errorHandler;
