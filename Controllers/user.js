const User = require("../Model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Blog = require("../Model/blog");

const { validationResult } = require("express-validator");
const blog = require("../Model/blog");

exports.signup = async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const errors = await validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(401).json({ errorMessage: errors.array()[0].msg });
    }

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

    await User.findOne({ email: email })
      .then((user) => {
        if (user) {
          return res
            .status(401)
            .json({ errorMessage: "Please try another email" });
        }

        bcrypt
          .hash(password, 12)
          .then((hashedPassword) => {
            const newUser = new User({
              name: name,
              email: email,
              password: hashedPassword,
              profileImage: "../images/default.jpg",
              blogs: [],
              joinedAt: formattedDate,
              userName: email.split("@")[0],
            });

            newUser.save();

            res.status(200).json({ message: "New user Signup" });
          })
          .catch((err) => {
            console.log(
              "Error hashing the password in the signup function",
              err
            );
          });
      })
      .catch((err) => {
        console.log(
          "Error from the user finding by email in the signup function pn the user controllers",
          err
        );
      });
  } catch (err) {
    console.log("Error from signup function in the controller", err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    await User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          return res.status(401).json({ errorMessage: "User Not Found" });
        }

        bcrypt
          .compare(password, user.password)
          .then((doPasswordMatch) => {
            if (!doPasswordMatch) {
              return res.status(401).json({ errorMessage: "Wrong Password" });
            }

            const token = jwt.sign({ userId: user._id }, "mysecret", {
              expiresIn: "1h",
            });

            res.status(200).json({
              message: "User logged In",
              token: token,
              userId: user._id,
            });
          })
          .catch((err) => {
            console.log(
              "Error in the compare function in the login controller",
              err
            );
          });
      })
      .catch((err) => {
        console.log(
          "Error from the finding user function on the login function",
          err
        );
      });
  } catch (err) {
    console.log("Error from the login function in the user controllers");
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.userData.userId;

    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    await User.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ errorMessage: "User Not Found" });
        }

        const doOldPasswordMatch = bcrypt.compare(oldPassword, user.password);

        if (!doOldPasswordMatch) {
          return res.status(401).json({ errorMessage: "Wrong Password" });
        }

        bcrypt.hash(newPassword, 12).then((hashedPassword) => {
          user.password = hashedPassword;

          user.save();
        });

        res.status(200).json({ message: "Password Updated" });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log("error changing the password in the user controller", err);
  }
};

exports.editProfile = async (req, res, next) => {
  try {
    const userId = req.userData.userId;

    const {
      userName,
      bio,
      youtube,
      instagram,
      facebook,
      twitter,
      github,
      website,
    } = req.body;

    let imageUrl = req.file;

    let profile = "";

    if (imageUrl !== undefined) {
      profile = imageUrl.path;
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ errorMessage: "User Not Found" });
    }

    if (userName !== "undefined") {
      user.userName = userName;
    }

    if (bio !== "undefined") {
      user.bio = bio;
    }

    if (youtube !== "undefined") {
      user.youtube = youtube;
    }

    if (instagram !== "undefined") {
      user.instagram = instagram;
    }

    if (facebook !== "undefined") {
      user.facebook = facebook;
    }

    if (twitter !== "undefined") {
      user.twitter = twitter;
    }

    if (github !== "undefined") {
      user.github = github;
    }

    if (website !== "undefined") {
      user.website = website;
    }

    if (profile !== "") {
      user.profileImage = profile;
    }

    user.blogs.forEach((blog) => {
      blog.userImage = profile;
    });

    const blogs = await Blog.find({}); // Use async/await for better readability and error handling

    const blogsByTheUser = blogs.filter((blog) => blog.createdBy == user._id);

    blogsByTheUser.forEach((blog) => {
      blog.userImage = profile; // Assign profile to blog.userImage
      blog.save(); // Save each modified blog individually
    });

    await user.save();

    res.status(200).json({ message: "Profile updated" });
  } catch (err) {
    console.error("Error from edit profile controller:", err);
    res.status(500).json({ errorMessage: "Internal Server Error" });
  }
};

exports.getUserInfo = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    User.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ errorMessage: "User Not Found" });
        }

        res.status(200).json({ user: user });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};

exports.getUserBlogs = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    User.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ errorMessage: "User Not Found" });
        }

        const userBlogs = user.blogs;

        res.status(200).json({ blogs: userBlogs });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log("error geting the user blogs from the user controllers");
  }
};

exports.saveDraft = async (req, res, next) => {
  try {
    const userId = req.userData.userId;

    const title = req.body.title;
    const content = req.body.content;

    await User.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ errorMessage: "User Not Found" });
        }

        user.draftBlogs.push({ title: title, content: content });

        user.save();

        res.status(200).json({ message: "Draft saved" });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};

exports.getAllDraft = async (req, res, next) => {
  try {
    const userId = req.userData.userId;

    await User.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ errorMessage: "User Not Found" });
        }

        const userDraft = user.draftBlogs;

        res.status(200).json({ blogs: userDraft });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};

exports.getDraft = async (req, res, next) => {
  try {
    const userId = req.userData.userId;
    const draftId = req.params.draftId;

    await User.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ errorMessage: "User Not Found" });
        }

        const draft = user.draftBlogs.filter((draft) => draft._id == draftId);

        res.status(200).json({ draft: draft });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};

exports.deleteDraft = async (req, res, next) => {
  try {
    const userId = req.userData.userId;
    const draftId = req.params.draftId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ errorMessage: "User Not Found" });
    }

    user.draftBlogs = user.draftBlogs.filter((draft) => draft._id != draftId);

    await user.save();

    res.status(200).json({ message: "Draft deleted!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMessage: "Internal Server Error" });
  }
};
