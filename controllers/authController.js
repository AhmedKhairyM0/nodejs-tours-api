const { promisify } = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");

/** Create JOSN Web Token for authentication */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const checkToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user } 
  });
}

/** Register user and return Token for Authentication */
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, photo } = req.body;
  // const newUser = await User.create(req.body); // this is not secure, because user can set role as admin
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    photo
  });

  createSendToken(newUser, 201, res);
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
  createSendToken(user, 200, res);


});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token
  if (!req.headers.authorization) {
    return next(
      new AppError("You are not logged in, please log in to get access", 401)
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
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("This user is no longer exist", 401));
  }

  // 4) Check if User changed password after token was signed
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("Password is recently changed! Please log in again", 401)
    );
  }
  
  // Grant access to protected routes
  req.user = currentUser;
  next();
});

exports.restrictedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // 401: not authenticated
      // 403: authenticated but not authorized for this action
      return next(
        new AppError("Don't have permission access to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async(req, res, next) => { 
  // 1) Create reset token and save it in user db
  const user = await User.findOne({ email: req.body.email })
  if(!user) {
    return next(new AppError("There is no user with that email", 404))
  }
  
  // 2) Send it in email
  const resetToken = user.createResetPasswordToken();

  const urlToken = `${req.protocal}://${req.host}/api/v1/resetPassword/${resetToken}`;
  const message =  `You forgot password? Submit password and passwordConfirm to: ${urlToken}.\n
  If you didn't forget password, please ignore this email.`;
  
  try{
    await sendEmail({ 
      to: user.email,
      subject: "Reset password (Valid for 10 minutes)",
      message
    });
    // Should I use the following line for saving what user.createResetPasswordToken() was doing?
    // await user.save({
    //   validateBeforeSave: false,
    //   // validateModifiedOnly: true
    // });

    res.status(200).json({ 
      status: "success",
      message: "Token sent to email!"
    });
  } catch(err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ // 3
      validateBeforeSave: false,
      // validateModifiedOnly: true
    });
    return next(new AppError("Wrong is happen when sending email for forgetting password!",500))
  }
  
  
  // await user.save(); // what is happen if it runs?
  // mail with it at route: resetPassword/:token

});

exports.resetPassword = catchAsync(async(req, res, next) => { 
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest("hex");

  // Secure issuse:
    // What if hackers try to send the url bruteforcely to change users password to damage database
  const user = await User.findOne({ 
    resetPasswordToken: hashedToken,
    resetPasswordExpire: {$gt: Date.now()}
    // email: req.query.email,
  });

  if(!user) {
    return next(new AppError("Token is invalid or has expired", 400))
  }
  
  // 1) check if reset token is valid and not expired
  // 2) check equality
  // 3) update password
  const {password, passwordConfirm} = req.body;

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save(); 
  // await user.save({ validateModifiedOnly: true});  // 3

  // Create jwt for Logging in user 
  createSendToken(user, 200, res);
});

exports.updateMyPassword = catchAsync(async(req, res, next) => { 
  // current, new, confirm passwords
  const user = await User.findById(req.user.id).select('+password');

  if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  
  const { password, passwordConfirm } = req.body;
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save({ validateModifiedOnly: true });

  // Create jwt for Logging in user 
  createSendToken(res, 200, user);
});


