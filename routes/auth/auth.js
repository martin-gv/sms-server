const express = require("express");
const router = express.Router();
const passport = require("passport");

const User = require("../../models/User");

router.get("/login", (req, res) => {
  console.log("login route");
  const message = req.flash();
  const token = req.query.token;
  res.render("login", { message: message, token: token });
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    res.redirect("/");
  }
);

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  await User.create({ email: email, password: password });

  res.status(201).end();
});

module.exports = router;
