const express = require("express");

const router = express.Router();

router.post("/sign-up", (req, res, next) => {
  res.send("NOT IMPLEMENTED: /sign-up POST");
});

router.post("/sign-in", (req, res, next) => {
  res.send("NOT IMPLEMENTED: /sign-in POST");
});

module.exports = router;
