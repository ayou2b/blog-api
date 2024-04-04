const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const blogSchema = new Schema({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  likes: { type: Number },
  createdBy: { type: String, required: true },
  createdAt: { type: String, required: true },
  userImage: { type: String },
  userName: { type: String },
  creatorName: { type: String },
  comments: [
    {
      comment: { type: String },
      id: { type: String },
      commentedBy: { type: String },
      replays: [
        {
          replay: { type: String },
          replayBy: { type: String },
          id: { type: String },
        },
      ],
    },
  ],
});

module.exports = mongoose.model("blog", blogSchema);
