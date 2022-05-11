const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const jwtAuth = require("./middlewares/jwtAuth");

const indexRouter = require("./routes/index");
const postsRouter = require("./routes/posts");
const authRouter = require("./routes/auth");

const mongoose = require("mongoose");
require("dotenv").config();
require("./middlewares/passport");

mongoose.connect(process.env.MONGODB_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const origins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://guarded-mesa-79248.herokuapp.com/",
];

const app = express();
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (origins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/posts", postsRouter);
app.use("/auth/posts", jwtAuth.jwtAuth, authRouter);
app.use("/auth", authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
