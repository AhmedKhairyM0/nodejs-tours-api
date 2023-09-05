const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

/** Create JOSN Web Token for authentication */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const checkToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/** Register user and return Token for Authentication */
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;
  // const newUser = await User.create(req.body); // this is not secure, because user can set role as admin
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: {
        name,
        email,
        role: newUser.role,
      },
    },
  });
});

/** Login User and return Token for Authentication */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email or password is not provided
  if (!email || !password) {
    return next(new AppError("Please provide your email and password", 400));
  }

  // 2) Check if email is exist and password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) create token return it with user info
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token
  console.log(req.headers.authorization);
  if (!req.headers.authorization) {
    return next(
      new AppError("User is not logged in, please log in to get access", 401)
    );
  }

  if (!req.headers.authorization.startsWith("Bearer")) {
    return next(
      new AppError("Invalid format token that should start with 'Bearer'", 401)
    );
  }

  const token = req.headers.authorization.split(" ")[1];
  // 2) Verify it
  let decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if User is exist
  const user = await User.findById(decoded.id);
  console.log(decoded, user)
  if (!user) {
    return next(new AppError("This user is no longer exist", 401));
  }

  // 4) Check if User changed password after token was signed
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again", 401)
    );
  }

  next();
});

exports.restrictedTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    // Token => ID => Get User => check if User Role includes in roles or not
    console.log(req.headers.authorization);

    const token = req.headers.authorization.split(" ")[1];
    // 2) Verify it
    let decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if User is exist
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError("This user is no longer exist", 401));
    }

    console.log(roles, user.role, roles.includes(user.role));

    // if (!roles.includes(user.role)) {
    //   return next(
    //     new AppError("Don't have permission access for this action", 401)
    //   );
    // }

    next();
  });
};
