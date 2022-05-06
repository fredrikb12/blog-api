const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup_POST);

router.post("/signin", (req, res, next) => {
  res.send("NOT IMPLEMENTED: /sign-in POST");
});

module.exports = router;
