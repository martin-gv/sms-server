const express = require("express");
const router = express.Router();

const User = require("../../models/User");

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res) => {
  console.log("post login");
  console.log(req.body);
});

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
