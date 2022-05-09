const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup_POST);

router.post("/signin", authController.signin_POST);

router.post("/posts", authController.posts_POST);

router.get("/posts", authController.posts_GET);

router.get("/posts/postId", authController.posts_postID_GET);

module.exports = router;
