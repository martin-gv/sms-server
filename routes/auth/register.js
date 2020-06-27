const express = require("express");
const router = express.Router();
const db = require("../../config/database");
const validator = require("email-validator");
const bcrypt = require("bcrypt");

const User = db.models.User;
const { isUnauthenticated } = require("../../middleware/auth");

//
// ─── ROUTE ONLY AVAILABLE TO NON LOGGED IN USERS ────────────────────────────────
//

router.use("/register", isUnauthenticated);

//
// ─── REGISTER PAGE ──────────────────────────────────────────────────────────────
//

router.get("/register", (req, res) => {
  // Re-add email to form after error
  const email = req.query.email;

  const message = req.flash();
  res.render("register", { message: message, email: email });
});

//
// ─── REGISTER HANDLER ───────────────────────────────────────────────────────────
//

router.post("/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // Check if email format is valid
  if (!validator.validate(email)) {
    req.flash("error", "Email is invalid");
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
  const newUser = await User.create({ email: email, password: hashedPassword });

  req.login(newUser, function (err) {
    if (err) {
      next(err);
      return;
    }

    req.flash("success", "Successfully registered!");
    res.redirect("/new-number");
  });
});

module.exports = router;
