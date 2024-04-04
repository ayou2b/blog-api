const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  joinedAt: { type: String },
  profileImage: { type: String },
  draftBlogs: [
    {
      title: { type: String, required: true },
      content: { type: String, required: true },
    },
  ],
  blogsThatIliked: [{ id: { type: String } }],
  blogs: [
    {
      title: { type: String, required: true },
      content: { type: String, required: true },
      topic: { type: String, required: true },
      image: { type: String, required: true },
      createdAt: { type: String, required: true },
      userImage: { type: String },
      userName: { type: String },
      creatorName: { type: String },
      likes: {
        type: Number,
      },
      id: { type: String },
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
    },
  ],

  userName: { type: String },
  bio: { type: String },
  youtube: { type: String },
  instagram: { type: String },
  facebook: { type: String },
  twitter: { type: String },
  github: { type: String },
  website: { type: String },
});

module.exports = mongoose.model("user", userSchema);
