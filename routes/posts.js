const express = require("express");

const router = express.Router();

router.post("/", (req, res, next) => {
  res.send("NOT IMPLEMENTED: /posts POST");
});

router.get("/", (req, res, next) => {
  res.send("NOT IMPLEMENTED: /posts GET");
});

router.get("/:postId", (req, res, next) => {
  res.send(`NOT IMPLEMENTED: /posts/${req.params.postId} GET`);
});

router.put("/:postId", (req, res, next) => {
  res.send(`NOT IMPLEMENTED: /posts/${req.params.postId} PUT`);
});

router.delete("/:postId", (req, res, next) => {
  res.send(`NOT IMPLEMENTED: /posts/${req.params.postId} DELETE`);
});

router.post("/:postId/comments", (req, res, next) => {
  res.send(`NOT IMPLEMENTED: /posts/${req.params.postId}/comments POST`);
});

router.get("/:postId/comments", (req, res, next) => {
  res.send(`NOT IMPLEMENTED: /posts/${req.params.postId}/comments GET`);
});

module.exports = router;
