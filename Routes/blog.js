const express = require("express");

const route = express.Router();

const blogControllers = require("../Controllers/blog");

const isAuth = require("../Middleware/Is_Auth");

const multer = require("multer");

const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "images");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

route.post(
  "/add-new-blog",
  isAuth,
  upload.single("file"),
  blogControllers.addNewBlog
);

route.get("/get-all-blogs", blogControllers.getAllBlogs);

route.get("/blog/:blogId", blogControllers.getAsingleBlog);

route.post("/delete-blog/:blogId", isAuth, blogControllers.deleteBlog);

route.post(
  "/edit-blog/:blogId",
  isAuth,
  upload.single("file"),
  blogControllers.editBlog
);

route.get("/user-blogs", isAuth, blogControllers.getBlogByUser);

route.post("/like/:blogId", isAuth, blogControllers.like);

route.post("/dis-like/:blogId", isAuth, blogControllers.disLike);

route.get(
  "/is-user-liked-theBlog/:blogId",
  isAuth,
  blogControllers.getIsTheUserLikedTheBlog
);

route.get("/trending-blogs", blogControllers.trendingBlogs);

route.get("/blog-by-search/:search", blogControllers.search);

route.post("/add-comment/:blogId", isAuth, blogControllers.addComment);

route.get("/all-comments/:blogId", blogControllers.getComments);

route.post("/add-replay/:blogId/:commentId", isAuth, blogControllers.addReplay);

route.post(
  "/delete-replay/:blogId/:commentId/:replayId",
  isAuth,
  blogControllers.deleteReplay
);

route.get("/blogs-by-topic/:topic", blogControllers.getBlogByTopic);

module.exports = route;
