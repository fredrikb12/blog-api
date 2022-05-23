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
        return res.status(200).json({ status: 200, message: "Post submitted" });
      });
    }
  },
];

exports.posts_GET = (req, res, next) => {
  Post.find({ published: true }, "title text updatedAt createdAt")
    .sort({ createdAt: "desc" })
    .populate("comments")
    .populate("author", "first_name last_name")
    .exec(function (err, results) {
      if (err) {
        return next(err);
      } else {
        return res.status(200).json(results);
      }
    });
};

exports.posts_postId_GET = (req, res, next) => {
  Post.findById(req.params.postId, "title text updatedAt createdAt", {
    published: true,
  })
    .populate("author", "first_name last_name")
    .populate("comments")
    .exec(function (err, post) {
      if (err) return next(err);
      else {
        console.log("returning", post);
        return res.status(200).json(post);
      }
    });
};

exports.posts_postId_PUT = (req, res, next) => {
  res.send(`NOT IMPLEMENTED: /posts/${req.params.postId} PUT`);
};

exports.posts_postId_DELETE = (req, res, next) => {
  res.send(`NOT IMPLEMENTED: /posts/${req.params.postId} DELETE`);
};

exports.posts_postId_comments_POST = [
  body("author").escape(),
  body("text").escape(),
  (req, res, next) => {
    const text = req.body.text.replace(/&#x27;/g, "'");
    const author = req.body.author.replace(/&#x27;/g, "'");

    const comment = new Comment({
      author,
      text,
    });
    console.log("comment:", comment);
    async.waterfall(
      [
        function (callback) {
          comment.save((err) => {
            if (err) return next(err);
            else callback(null, comment._id);
          });
        },
        function (id, callback) {
          Post.findByIdAndUpdate(req.params.postId, {
            $push: { comments: id },
          }).exec(function (err, post) {
            if (err) return next(err);
            callback(null, post);
          });
        },
      ],
      function (err, result) {
        if (err) return next(err);
        return res
          .status(200)
          .json({
            post: result,
            message: "Comments updated",
            status: 200,
            id: comment._id,
          });
      }
    );
  },
];

exports.posts_postId_comments_GET = (req, res, next) => {
  res.send(`NOT IMPLEMENTED: /posts/${req.params.postId}/comments GET`);
};
