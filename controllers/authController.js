const User = require("../models/user");
const async = require("async");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const jwtAuth = require("../middlewares/jwtAuth");
const Post = require("../models/post");
const jwtRes = require("../helpers/jwtResponse");
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
            }).save((err, user) => {
              if (err) return next(err);
              res.cookie("token", genToken(user), { httpOnly: true }).json({
                status: 200,
                message: "User created.",
                user: user._id,
              });
            });
          });
        }
      });
    }
  },
];

exports.signin_POST = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(400).json({
        message: "Something is not right",
        user: user,
      });
    } else {
      req.login(user, { session: false }, (err) => {
        if (err) {
          return next(err);
        }
        return res
          .cookie("token", genToken(user), { httpOnly: true })
          .json({ message: "Login successful!", user: user._id });
      });
    }
  })(req, res, next);
};

exports.posts_POST = [
  body("title").escape(),
  (req, res, next) => {
    const post = new Post({
      title: req.body.title,
      text: req.body.text,
      author: req._id,
      published: req.pulished || false,
      comments: [],
    }).save((err, post) => {
      if (err) return next(err);
      if (jwtAuth.tokenNeedsUpdate(req, res, next)) {
        return res
          .cookie("token", genToken({ _id: req._id }), {
            httpOnly: true,
          })
          .json(jwtRes.updated(req._id, { post }));
      } else {
        return res.json(jwtRes.notUpdated(req._id, { post }));
      }
    });
  },
];

exports.posts_GET = function (req, res, next) {
  const query = req.query;
  Post.find()
    .sort({ createdAt: query.sort || "desc" })
    .populate("author", "first_name last_name")
    .exec(function (err, posts) {
      if (err) return next(err);
      else {
        if (jwtAuth.tokenNeedsUpdate(req, res, next)) {
          res
            .cookie("token", genToken({ _id: req._id }), { httpOnly: true })
            .json(jwtRes.updated(req._id, { posts }));
        } else {
          res.json(jwtRes.notUpdated(req._id, { posts }));
        }
      }
    });
};

exports.posts_postId_GET = function (req, res, next) {
  Post.findById(req.params.postId)
    .populate("author", "first_name last_name")
    .exec(function (err, post) {
      if (err) return next(err);
      else {
        if (jwtAuth.tokenNeedsUpdate(req, res, next)) {
          res
            .cookie("token", genToken({ _id: req._id }), { httpOnly: true })
            .json(jwtRes.updated(req._id, { post }));
        } else {
          res.json(jwtRes.notUpdated(req._id, { post }));
        }
      }
    });
};

exports.posts_postId_PUT = function (req, res, next) {
  res.send("PUT Not Implemented");
};

exports.posts_postId_DELETE = function (req, res, next) {
  res.send("DELETE Not Implemented");
};

const genToken = function (user) {
  return jwt.sign(
    {
      iss: user.first_name,
      _id: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "3600s" }
  );
};

exports.genToken = genToken;
