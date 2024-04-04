const express = require("express");

const { check } = require("express-validator");

const route = express.Router();

const userControllers = require("../Controllers/user");

const isAuth = require("../Middleware/Is_Auth");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "images");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage }).single("newUserImage");

route.post("/edit-profile", isAuth, upload, userControllers.editProfile);

route.post(
  "/signup",
  [
    check("email").isEmail().withMessage("Please Enter A valid Email!"),
    check("password")
      .isAlphanumeric()
      .isLength({ min: 8 })
      .withMessage("Password should be at least 8 characters"),
  ],
  userControllers.signup
);

route.post("/login", userControllers.login);

route.post("/change-password", isAuth, userControllers.changePassword);

route.get("/user-information/:userId", userControllers.getUserInfo);

route.get("/user-blogs/:userId", userControllers.getUserBlogs);

route.post("/save-draft", isAuth, userControllers.saveDraft);

route.get("/all-draft", isAuth, userControllers.getAllDraft);

route.get("/draft/:draftId", isAuth, userControllers.getDraft);

route.post("/delete-draft/:draftId", isAuth, userControllers.deleteDraft);

module.exports = route;
