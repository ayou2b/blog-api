const User = require("../Model/user");
const Blog = require("../Model/blog");
const { v4: uuidv4 } = require("uuid");

exports.addNewBlog = async (req, res, next) => {
  try {
    const userId = req.userData.userId;

    const blogTitle = req.body.title;
    const blogContent = req.body.content;
    const topic = req.body.topic;

    const imageUrl = req.file.path;

    // Create a new Date object
    const currentDate = new Date();

    // Define an array of month names
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Get the current month, day, and year
    const month = monthNames[currentDate.getMonth()];
    const day = currentDate.getDate();
    const year = currentDate.getFullYear();

    // Format the date as a string
    const formattedDate = `${month} ${day}, ${year}`;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ errorMessage: "User Not Found" });
    }

    const userProfile = user.profileImage;

    const newBlog = new Blog({
      title: blogTitle,
      content: blogContent,
      topic: topic,
      image: imageUrl,
      likes: 0,
      createdBy: userId,
      createdAt: formattedDate,
      userImage: userProfile,
      userName: user.userName,
      creatorName: user.name,
    });

    await newBlog.save().then((result) => {
      user.blogs.push({
        title: blogTitle,
        content: blogContent,
        topic: topic,
        image: imageUrl,
        userImage: userProfile,
        likes: 0,
        id: result._id,
        createdAt: formattedDate,
        userName: user.userName,
        creatorName: user.name,
      });

      user.save();
    });

    res.status(200).json({ message: "New Blog Added" });
  } catch (err) {
    console.log("Error adding a new blog in the blog controllers", err);
    res.status(500).json({ errorMessage: "Internal Server Error" });
  }
};

exports.getAllBlogs = async (req, res, next) => {
  try {
    await Blog.find({})
      .then((blogs) => {
        res.status(200).json({ blogs: blogs });
      })
      .catch((err) => {
        console.log("error geting the blogs from the blog controllers", err);
      });
  } catch (err) {
    console.log("error from geting all blogs controler");
  }
};

exports.getAsingleBlog = async (req, res, next) => {
  try {
    const { blogId } = req.params;

    Blog.findById(blogId)
      .then((blog) => {
        console.log(blog);

        res.status(200).json({ blog: blog });
      })
      .catch((err) => {
        console.log(
          "error finding the blog in the get a single blog handler",
          err
        );
      });
  } catch (err) {
    console.log("error geting a single blog in the blogs controllers", err);
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const userId = req.userData.userId;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ errorMessage: "Blog Not Found" });
    }

    if (blog.createdBy !== userId) {
      return res.status(401).json({
        errorMessage: "You are not the user who created the blog",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ errorMessage: "User Not Found" });
    }

    user.blogs = user.blogs.filter((blog) => blog.id !== blogId);

    await Blog.findByIdAndDelete(blogId);
    await user.save();

    res.status(200).json({ message: "Blog deleted" });
  } catch (err) {
    console.log("Error deleting the blog from the delete blog controller", err);
    res.status(500).json({ errorMessage: "Internal Server Error" });
  }
};

exports.editBlog = async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const userId = req.userData.userId;

    let newTitle = req.body.title || "";
    let newContent = req.body.content || "";
    let newImage = req.file ? req.file.path : "";

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ errorMessage: "Blog Not Found" });
    }

    if (blog.createdBy !== userId) {
      return res
        .status(401)
        .json({ errorMessage: "You Are Not Allowed to update this blog" });
    }

    if (newTitle !== "") {
      blog.title = newTitle;
    }

    if (newContent !== "") {
      blog.content = newContent;
    }

    if (newImage !== "") {
      blog.image = newImage;
    }

    await blog.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ errorMessage: "User Not Found" });
    }

    const userBlog = user.blogs.find((blog) => blog.id === blogId);
    if (!userBlog) {
      return res.status(404).json({ errorMessage: "User Blog Not Found" });
    }

    if (newTitle !== "") {
      userBlog.title = newTitle;
    }

    if (newContent !== "") {
      userBlog.content = newContent;
    }

    if (newImage !== "") {
      userBlog.image = newImage;
    }

    await user.save();

    res.status(200).json({ message: "Blog updated" });
  } catch (err) {
    console.error("Error editing the blog from the blog controllers", err);
    res.status(500).json({ errorMessage: "Internal Server Error" });
  }
};

exports.getBlogByUser = async (req, res, next) => {
  try {
    const userId = req.userData.userId;

    Blog.find({})
      .then((blogs) => {
        const userBlogs = blogs.filter((blog) => blog.createdBy === userId);

        res.status(200).json({ blogs: userBlogs });
      })
      .catch((err) => {
        console.log("error finding the blogs", err);
      });
  } catch (err) {
    console.log("error geting all the user blogs", err);
  }
};

exports.like = async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const userId = req.userData.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ errorMessage: "User Not Found" });
    }

    const blog = user.blogs.find((blog) => blog.id === blogId);

    user.blogsThatIliked.push({ id: blogId });

    if (!blog) {
      return res.status(404).json({ errorMessage: "Blog Not Found" });
    }

    blog.likes++;

    await user.save();

    const foundBlog = await Blog.findById(blogId);

    if (!foundBlog) {
      return res.status(404).json({ errorMessage: "Blog Not Found" });
    }

    foundBlog.likes++;

    await foundBlog.save();

    res.status(200).json({ message: "Like added" });
  } catch (err) {
    console.error("Error from the like controller", err);
    res.status(500).json({ errorMessage: "Internal Server Error" });
  }
};

exports.disLike = async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const userId = req.userData.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ errorMessage: "User Not Found" });
    }

    const blogIndex = user.blogs.findIndex((blog) => blog.id === blogId);

    if (blogIndex === -1) {
      return res.status(404).json({ errorMessage: "Blog Not Found" });
    }

    user.blogsThatIliked = user.blogsThatIliked.filter(
      (likedBlog) => likedBlog.id !== blogId
    );
    user.blogs[blogIndex].likes--;

    await user.save();

    const foundBlog = await Blog.findById(blogId);

    if (!foundBlog) {
      return res.status(404).json({ errorMessage: "Blog Not Found" });
    }

    foundBlog.likes--;

    await foundBlog.save();

    res.status(200).json({ message: "Like Deleted" });
  } catch (err) {
    console.error("Error from the like controller", err);
    res.status(500).json({ errorMessage: "Internal Server Error" });
  }
};

exports.getIsTheUserLikedTheBlog = async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const userId = req.userData.userId;

    User.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ errorMessage: "User Not Found" });
        }

        const likedBlog = user.blogsThatIliked.find(
          (blog) => blog.id == blogId
        );

        res.status(200).json({ like: likedBlog });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};

exports.trendingBlogs = async (req, res, next) => {
  try {
    await Blog.find({})
      .then((blogs) => {
        const trendingBlogs = blogs.sort((a, b) => b.likes - a.likes);

        res.status(200).json({ blogs: trendingBlogs.slice(0, 5) });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log("error from geting the trending blogs in blog controller", err);
  }
};

exports.search = async (req, res, next) => {
  try {
    const search = req.params.search;

    Blog.find({ title: { $regex: search, $options: "i" } })
      .then((blogs) => {
        res.status(200).json({ blogs });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
      });
  } catch (err) {
    console.error("Error from search in the blog controller", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const userId = req.userData.userId;
    const blogId = req.params.blogId;
    const commentText = req.body.comment;

    const uuid = uuidv4();

    // Find the blog by ID
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ errorMessage: "Blog Not Found" });
    }

    blog.comments.push({
      comment: commentText,
      commentedBy: userId,
      id: uuid,
    });

    await blog.save();

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ errorMessage: "User Not Found" });
    }

    // Find the corresponding blog in the user's blogs array
    const userBlog = user.blogs.find((userBlog) => userBlog.id === blogId);

    if (!userBlog) {
      return res.status(404).json({ errorMessage: "User Blog Not Found" });
    }

    userBlog.comments.push({
      comment: commentText,
      commentedBy: userId,
      id: uuid,
    });

    // Save the user
    await user.save();

    res.status(200).json({ message: "Comment added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMessage: "Internal Server Error" });
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const blogId = req.params.blogId;

    Blog.findById(blogId)
      .then((blog) => {
        res.status(200).json({ comments: blog.comments });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};

exports.addReplay = async (req, res, next) => {
  try {
    const userId = req.userData.userId;
    const blogId = req.params.blogId;
    const commentId = req.params.commentId;
    const replay = req.body.replay;

    const uuid = uuidv4();

    // Update blog's comment with replay
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ errorMessage: "Blog Not Found" });
    }

    const comment = blog.comments.find((comment) => comment.id === commentId);
    if (!comment) {
      return res.status(404).json({ errorMessage: "Comment Not Found" });
    }

    comment.replays.push({ replay: replay, replayBy: userId, id: uuid });
    await blog.save();

    // Update user's blog's comment with replay
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ errorMessage: "User Not Found" });
    }

    const userBlog = user.blogs.find((blog) => blog.id === blogId);
    if (!userBlog) {
      return res.status(404).json({ errorMessage: "User Blog Not Found" });
    }

    const userComment = userBlog.comments.find(
      (comment) => comment.id === commentId
    );
    if (!userComment) {
      return res.status(404).json({ errorMessage: "User Comment Not Found" });
    }

    userComment.replays.push({ replay: replay, replayBy: userId, id: uuid });
    await user.save();

    res.status(200).json({ message: "Replay added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMessage: "Internal Server Error" });
  }
};

exports.deleteReplay = async (req, res, next) => {
  try {
    const userId = req.userData.userId;
    const blogId = req.params.blogId;
    const commentId = req.params.commentId;
    const replayId = req.params.replayId;

    // Update blog's comment to remove replay
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ errorMessage: "Blog Not Found" });
    }

    const comment = blog.comments.find((comment) => comment.id === commentId);
    if (!comment) {
      return res.status(404).json({ errorMessage: "Comment Not Found" });
    }

    const theReplay = comment.replays.find((replay) => replay.id == replayId);
    if (!theReplay) {
      return res.status(404).json({ errorMessage: "Replay Not Found" });
    }

    if (theReplay.replayBy != userId && comment.commentedBy != userId) {
      return res.status(401).json({
        errorMessage: "You are not authorized to delete this replay",
      });
    }

    comment.replays = comment.replays.filter(
      (replay) => replay.id !== replayId
    );
    await blog.save();

    // Update user's blog's comment to remove replay
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ errorMessage: "User Not Found" });
    }

    const userBlog = user.blogs.find((blog) => blog.id === blogId);
    if (!userBlog) {
      return res.status(404).json({ errorMessage: "User Blog Not Found" });
    }

    const userComment = userBlog.comments.find(
      (comment) => comment.id === commentId
    );
    if (!userComment) {
      return res.status(404).json({ errorMessage: "User Comment Not Found" });
    }

    userComment.replays = userComment.replays.filter(
      (replay) => replay.id !== replayId
    );
    await user.save();

    res.status(200).json({ message: "Replay Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMessage: "Internal Server Error" });
  }
};

exports.getBlogByTopic = async (req, res, next) => {
  try {
    const topic = req.params.topic;

    await Blog.find({})
      .then((blogs) => {
        const blogsByTopic = blogs.filter((blog) => blog.topic == topic);

        res.status(200).json({ blogs: blogsByTopic });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};
