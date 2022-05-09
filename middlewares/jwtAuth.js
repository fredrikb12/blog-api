const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const genToken = require("../controllers/authController").genToken;

exports.jwtAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(403);
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req._id = data._id;
    req.iss = data.iss;
    req.iat = data.iat;
    req.exp = data.exp;
    return next();
  } catch {
    return res.sendStatus(403);
  }
};

exports.tokenNeedsUpdate = (req, res, next) => {
  if (req.exp - new Date().getTime() / 1000 < 600) {
    return true;
  } else {
    return false;
  }
};
