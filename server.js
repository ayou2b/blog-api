const express = require("express");
const mongoose = require("mongoose");
const body_Parser = require("body-parser");
const cors = require("cors");

const path = require("path");

const MongoDB_URI = "your mongodb uri here";

const app = express();

app.use(express.json());
app.use(cors());
app.use(body_Parser.urlencoded({ extended: false }));

app.use("/images", express.static(path.join("images")));

// user routes

const userRoutes = require("./Routes/user");
app.use(userRoutes);

// blog routes

const blogRoutes = require("./Routes/blog");
app.use(blogRoutes);

mongoose
  .connect(MongoDB_URI)
  .then((result) => {
    console.log("Database is connected");

    app.listen(9000, (err) => {
      if (err) {
        console.log("Error runing the server", err);
      }

      console.log("Server is Up");
    });
  })
  .catch((err) => {
    console.log("Error connecting to the database", err);
  });
