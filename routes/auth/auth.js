const express = require("express");
const router = express.Router();

const db = require("../../config/database");
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

router.post("/register", (req, res) => {
  console.log("post register");
  console.log(req.body);
});

module.exports = router;
