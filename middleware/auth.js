const querystring = require("querystring");

exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    // Incoming SMS messages trigger an email notification. The email
    // includes a link with a URL param 'token'. The token contains
    // data about the SMS message and is used after the user logs in to
    // show the correct message.
    const query = querystring.encode(req.query);
    res.redirect("/login?" + query);
  }
};
