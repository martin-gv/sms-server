const db = require("../config/database");
const validator = require("email-validator");
const bcrypt = require("bcrypt");
const stripe = require("../config/stripe");

const User = db.models.User;

//
// ─── RENDER REGISTRATION PAGE ───────────────────────────────────────────────────
//

exports.getRegistrationPage = (req, res) => {
  // Re-add email to form after error
  const email = req.query.email;
  const message = req.flash();
  res.render("register", { message: message, email: email, css: ["register"] });
};

//
// ─── HANDLE REGISTRATION FORM SUBMISSION ────────────────────────────────────────
//

exports.handleRegistrationForm = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    // Check if email format is valid
    if (!validator.validate(email)) {
      req.flash("error", "Email is invalid");
      res.redirect("/register" + "?email=" + email);
      return;
    }

    // Check if user account already exists
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser !== null) {
      req.flash("error", "An account with that email already exists");
      res.redirect("/register" + "?email=" + email);
      return;
    }

    // Check if the passwords match
    if (password !== confirmPassword) {
      req.flash("error", "Passwords don't match");
      res.redirect("/register" + "?email=" + email);
      return;
    }

    // Create a Stripe customer
    const customer = await stripe.customers.create({
      email: email,
    });

    // Create the new user and save to the database
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const newUser = await User.create({
      email: email,
      password: hashedPassword,
      stripeCustomerId: customer.id,
    });

    // Immediately login the user
    req.login(newUser, function (err) {
      if (err) {
        next(err);
        return;
      }

      res.redirect("/settings");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/register");
  }
};
