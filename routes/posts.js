const express = require("express");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.send("NOT IMPLEMENTED: /posts GET");
});

router.get("/:postId", (req, res, next) => {
  res.send(`NOT IMPLEMENTED: /posts/${req.params.postId} GET`);
});

module.exports = router;
