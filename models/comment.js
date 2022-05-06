const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    author: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: Number,
    updatedAt: Number,
  },
  {
    timestamps: { currentTime: () => Date.now() },
  }
);

module.exports = mongoose.model("Comment", CommentSchema);
