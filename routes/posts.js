const express = require("express");
const postsController = require("../controllers/postController");

const router = express.Router();

router.post("/", postsController.posts_POST);

router.get("/", postsController.posts_GET);

router.get("/:postId", postsController.posts_postId_GET);

router.put("/:postId", postsController.posts_postId_PUT);

router.delete("/:postId", postsController.posts_postId_DELETE);

router.post("/:postId/comments", postsController.posts_postId_comments_POST);

router.get("/:postId/comments", postsController.posts_postId_comments_GET);

module.exports = router;
