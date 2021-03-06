const db = require("../config/database");
const validator = require("email-validator");
const bcrypt = require("bcrypt");

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

    if (password !== confirmPassword) {
      req.flash("error", "Passwords don't match");
      res.redirect("/register" + "?email=" + email);
      return;
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const newUser = await User.create({
      email: email,
      password: hashedPassword,
    });

    req.login(newUser, function (err) {
      if (err) {
        next(err);
        return;
      }

      req.flash("success", "Successfully registered!");
      res.redirect("/new-number");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/register");
  }
};
