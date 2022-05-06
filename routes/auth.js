const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup_POST);

router.post("/signin", authController.signin_POST);

router.post("/posts", authController.posts_POST);

module.exports = router;
