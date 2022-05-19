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
        errors: ["Incorrect username or password"],
      });
    } else {
      req.login(user, { session: false }, (err) => {
        if (err) {
          return next(err);
        }
        return res
          .status(200)
          .cookie("token", genToken(user), { httpOnly: true })
          .json(
            jwtRes.updated(user, {
              message: "Login successful!",
              user: user._id,
              code: 200,
            })
          );
      });
    }
  })(req, res, next);
};

exports.posts_POST = [
  body("title").escape(),
  body("text").escape(),
  body("published").escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors });
    }
    const post = new Post({
      title: req.body.title.replace(/&#x27;/g, "'"),
      text: req.body.text.replace(/&#x27;/g, "'"),
      author: req._id,
      published: req.body.published || false,
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
            .json(jwtRes.updated(req._id, { posts, status: 200 }));
        } else {
          res.json(jwtRes.notUpdated(req._id, { posts, status: 200 }));
        }
      }
    });
};

exports.posts_postId_GET = function (req, res, next) {
  Post.findById(req.params.postId)
    .populate("author", "first_name last_name")
    .populate("comments")
    .exec(function (err, post) {
      if (err) return next(err);
      else {
        if (jwtAuth.tokenNeedsUpdate(req, res, next)) {
          res
            .cookie("token", genToken({ _id: req._id }), { httpOnly: true })
            .json(jwtRes.updated(req._id, { post, status: 200 }));
        } else {
          res.json(jwtRes.notUpdated(req._id, { post, status: 200 }));
        }
      }
    });
};

exports.posts_postId_PUT = [
  body("text").escape(),
  body("title").escape(),
  body("published").escape(),
  body("comments").escape(),
  body("author").escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors });
    }
    const { title, text, published, comments, author } = req.body;
    const fields = {
      title: title ? title.replace(/&#x27;/g, "'") : "",
      text: text ? text.replace(/&#x27;/g, "'") : "",
      published,
      comments,
    };

    fields.published = fields.published === "true" ? true : false;

    const definedFields = Object.keys(fields).filter(
      (field) => fields[field] !== "" && fields[field] !== undefined
    );

    const valuesToUpdate = definedFields.reduce((obj, field) => {
      return { ...obj, [field]: fields[field] };
    }, {});

    Post.findByIdAndUpdate(
      req.params.postId,
      { ...valuesToUpdate },
      {},
      function (err, post) {
        if (err) return next(err);
        return res.status(200).json(
          jwtRes.notUpdated(req._id, {
            message: "Post updated",
            post: { ...post["_doc"] },
            code: 200,
          })
        );
      }
    );
  },
];

exports.posts_postId_DELETE = function (req, res, next) {
  Post.findById(req.body.postId).exec(function (err, results) {
    if (err) return next(err);
    if (results == null) {
      res.redirect("/auth/posts");
      return;
    } else {
      Post.findByIdAndRemove(req.body.postId, function deletePost(err) {
        if (err) return next(err);
        res.status(200).json(
          jwtRes.notUpdated(req._id, {
            message: "Post deleted",
            code: 200,
          })
        );
      });
    }
  });
};

exports.comments_commentId_PUT = function(req, res, next) {

}

exports.comments_commentId_DELETE = function(req, res, next) {

}

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
