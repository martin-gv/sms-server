//
// ─── LIBRARIES ──────────────────────────────────────────────────────────────────
//

const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const handlebars = require("handlebars");
const bcrypt = require("bcrypt");

//
// ─── CONFIGS AND DATABASE ───────────────────────────────────────────────────────
//

const mailgun = require("../config/mailgun");
const db = require("../config/database");
const User = db.models.User;

//
// ─── RENDER PAGE: FORGOT PASSWORD ───────────────────────────────────────────────
//

exports.renderForgotPasswordPage = (req, res) => {
  const message = req.flash();
  res.render("forgotPassword/forgotPassword", {
    message: message,
    css: ["forgotPassword"],
  });
};

//
// ─── HANDLE FORGOT PASSWORD FORM SUBMISSION ─────────────────────────────────────
//

const source = fs.readFileSync(
  path.join(__dirname, "../emails/templates/forgotPassword.hbs"),
  "utf8"
);
const template = handlebars.compile(source);
const domain = process.env.DOMAIN;

exports.handleForgotPasswordForm = async (req, res, next) => {
  const submittedEmail = req.body.email;

  const userResult = await User.findOne({ where: { email: submittedEmail } });

  // If no account matches, do nothing
  if (userResult === null) {
    next();
    return;
  }

  // Create a new token and sign it with the user's hashed password.
  // This creates a 1-time use token that becomes invalid after the password is successfully changed.
  const token = jwt.sign({ userId: userResult.id }, userResult.password, {
    expiresIn: "1h",
  });

  // The JWT token is included in a link in the email as a query string. JWTs are composed of URL-safe characters
  const htmlEmail = template({ domain: domain, token: token });

  const email = {
    to: submittedEmail,
    from: "InfusionText <sms-notifier@mail.sms.martin-gv.com>",
    subject: "Reset your password",
    html: htmlEmail,
  };

  mailgun.messages().send(email, (error, body) => {
    if (error) {
      console.log(error);
    } else {
      console.log("password reset - email sent!");
      console.log(body);
    }
  });

  next();
};

//
// ─── RENDER FORGOT PASSWORD SUCCESS PAGE ────────────────────────────────────────
//

exports.renderForgotPasswordSuccessPage = (req, res) => {
  res.render("forgotPassword/forgotPasswordSuccess", {
    css: ["forgotPassword"],
  });
};

//
// ─── RENDER PAGE: PASSWORD RESET ────────────────────────────────────────────────
//

exports.renderPasswordResetPage = async (req, res, next) => {
  try {
    const token = req.query.token;

    // Check if token exists
    if (token === undefined) {
      const message = { error: "This reset link is invalid" };
      const loggedIn = Boolean(req.user);
      res.render("error", { message: message, loggedIn: loggedIn });
      return;
    }

    // Find the user associated with the token
    const payload = jwt.decode(token);
    const user = await User.findOne({ where: { id: payload.userId } });

    // Verify the token (this will check if it's expired)
    jwt.verify(token, user.password);

    const message = req.flash();

    res.render("forgotPassword/passwordReset", {
      message: message,
      css: ["forgotPassword"],
      token: token,
    });
  } catch (err) {
    // Check if the error is caused by an expired token
    if (err.name === "TokenExpiredError") {
      const message = { error: "This password reset link has expired" };
      const loggedIn = Boolean(req.user);
      res.render("error", { message: message, loggedIn: loggedIn });
      return;
    }

    // Check if the error is caused by an invalid signature, which could mean the link has already been used
    if (err.message === "invalid signature") {
      const message = {
        error: "This password reset link is not valid anymore. Try requesting a new one",
      };
      const loggedIn = Boolean(req.user);
      res.render("error", { message: message, loggedIn: loggedIn });
      return;
    }

    next(err);
  }
};

//
// ─── HANDLE PASSWORD RESET FORM SUBMISSION ──────────────────────────────────────
//

exports.handlePasswordResetForm = async (req, res, next) => {
  try {
    const newPassword = req.body.newPassword;

    // Find the user associated with the token
    const token = req.body.token;
    const payload = jwt.decode(token);
    const user = await User.findOne({ where: { id: payload.userId } });

    // Verify the token
    jwt.verify(token, user.password);

    // Check if the new password and password confirmation match
    if (newPassword !== req.body.confirmPassword) {
      req.flash("error", "Passwords don't match");
      res.redirect("/forgot-password/reset?token=" + token);
      return;
    }

    // Check if the new password is the same as the currently stored one
    const isMatch = await bcrypt.compare(newPassword, user.password);
    if (isMatch) {
      req.flash(
        "error",
        "Please use a password different from your current one"
      );
      res.redirect("/forgot-password/reset?token=" + token);
      return;
    }

    // Hash the new password and save it to the database
    const saltRounds = 12;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password
    await User.update(
      { password: newHashedPassword },
      { where: { id: user.id } }
    );

    // Redirect to the login page
    req.flash("success", "Your password was reset successfully");
    res.redirect("/login");
  } catch (err) {
    // Check if the error is caused by an expired token
    if (err.name === "TokenExpiredError") {
      const message = { error: "This password reset link has expired" };
      const loggedIn = Boolean(req.user);

      res.render("error", { message: message, loggedIn: loggedIn });
      return;
    }

    next(err);
  }
};
