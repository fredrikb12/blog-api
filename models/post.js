const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    title: { type: String, required: true, maxLength: 100 },
    text: { type: String, required: true, maxLength: 2000 },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    published: { type: Boolean, required: true },
    createdAt: Number,
    updatedAt: Number,
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  {
    timestamps: { currentTime: () => Date.now() },
  }
);

module.exports = mongoose.model("Post", PostSchema);
