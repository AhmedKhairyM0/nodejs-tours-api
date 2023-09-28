const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
<<<<<<< HEAD
const reviewRouter = require("./routes/reviewRoutes");
=======
>>>>>>> cdd3cff3df3b8a456f524b376b96248a125fd9f6
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// Logging must run only at development phase
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json()); // body parser
app.use(express.static(`${__dirname}/public`)); // static files

// Routes
// Resources => tour, user

<<<<<<< HEAD
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/reviews", reviewRouter);
=======
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
>>>>>>> cdd3cff3df3b8a456f524b376b96248a125fd9f6

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
