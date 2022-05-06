const User = require("../models/user");
const async = require("async");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("dotenv").config();

exports.signup_POST = [
  body("first_name", "First name must be between 3 and 30 characters long.")
    .trim()
    .isLength({ min: 3, max: 30 })
    .escape(),
  body("last_name", "Last name must be between 3 and 30 characters long.")
    .trim()
    .isLength({ min: 3, max: 30 })
    .escape(),
  body("username", "Email must be valid.")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false }),
  body("password", "Password must be at least 5 characters long.")
    .trim()
    .isLength({ min: 5, max: 50 })
    .escape(),
  body("password_confirm", "Passwords must match")
    .exists()
    .trim()
    .custom((value, { req }) => value === req.body.password),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({
        first_name: req.body.first_name || "",
        last_name: req.body.last_name || "",
        username: req.body.username || "",
        errors: errors,
      });
      return;
    } else {
      User.findOne({ username: req.body.username }).exec(function (
        err,
        results
      ) {
        if (err) {
          return next(err);
        } else if (results !== null) {
          res.json({
            first_name: req.body.first_name || "",
            last_name: req.body.last_name || "",
            username: req.body.username || "",
            errors: ["Email is already in use."],
          });
          return;
        } else {
          bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            if (err) return next(err);
            const user = new User({
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              username: req.body.username,
              password: hashedPassword,
              user_type: "writer",
            }).save((err) => {
              if (err) return next(err);
              res.json({
                status: 200,
                message: "User created.",
              });
            });
          });
        }
      });
    }
  },
];

exports.signin_POST = (req, res, next) => {
  res.send("SIGNIN POST NOT IMPLEMENTED");
};

exports.posts_POST = (req, res, next) => {
  res.send("POSTS POST NOT IMPLEMENTED");
};
