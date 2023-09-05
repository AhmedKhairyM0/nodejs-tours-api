const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  const duplicateField = Object.keys(err.keyPattern);
  const message = `Duplicate ${duplicateField} with value: ${err.keyValue.name}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJwtError = () =>
  new AppError("Invalid token, please log in again", 401);

const handleJwtExipredError = () =>
  new AppError("Expired token, please log in again", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted errors: send readable message to the client
  if (err.operational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming, other unknown errors, [error in one package or in deployment]: don't send error details to the client
  else {
    // 1) Log Error: that is enough for now but there is npm package for professionally | larger project
    console.log("Error99 💥:", err);

    // 2) Send readable message to the client
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // 1) Invalid ID
    // 2) Valid but Not Found Document with that ID ✅
    // 3) Validation Error
    // 4) Unqiue Field

    let error = JSON.parse(JSON.stringify(err)); // deep copy
    error = {
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
      name: err.name,
      code: err.code,
      ...error,
    };
    // shallow  copy
    // Object.create(err);
    // { ...err }

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJwtError();
    if (error.name === "TokenExpiredError") error = handleJwtExipredError();

    sendErrorProd(error, res);
  }
};

// handle error type
