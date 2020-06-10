const express = require("express");
const router = express.Router();
const db = require("../../config/database");
const { hashPassword } = require("../../middleware/auth");

const User = db.models.User;

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", hashPassword, async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  await User.create({ email: email, password: password });

  res.status(201).end();
});

module.exports = router;
