const Post = require("../models/post");
const Comment = require("../models/comment");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.posts_POST = [
  body("title"),
  body("text"),
  body("published"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors });
    } else {
      const post = new Post({
        title: req.body.title,
        text: req.body.text,
        published: req.body.published,
        comments: [],
      }).save((err) => {
        if (err) return next(err);
        return res.json({ status: 200, message: "Post submitted" });
      });
    }
  },
];

exports.posts_GET = (req, res, next) => {
  Post.find()
    .sort({ createdAt: "desc" })
    .populate("comments")
    .exec(function (err, results) {
      if (err) {
        return next(err);
      } else {
        return res.json(results);
      }
    });
};

exports.posts_postId_GET = (req, res, next) => {
  res.send(`NOT IMPLEMENTED: /posts/${req.params.postId} GET`);
};

exports.posts_postId_PUT = (req, res, next) => {
  res.send(`NOT IMPLEMENTED: /posts/${req.params.postId} PUT`);
};

exports.posts_postId_DELETE = (req, res, next) => {
  res.send(`NOT IMPLEMENTED: /posts/${req.params.postId} DELETE`);
};

exports.posts_postId_comments_POST = (req, res, next) => {
  res.send(`NOT IMPLEMENTED: /posts/${req.params.postId}/comments POST`);
};

exports.posts_postId_comments_GET = (req, res, next) => {
  res.send(`NOT IMPLEMENTED: /posts/${req.params.postId}/comments GET`);
};
