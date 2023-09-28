const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./factoryHandler")

const filterObj = (obj, ...allowed) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
      if(allowed.includes(el)) newObj[el] =  obj[el];
  });

  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    data: { users },
  });
});


exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. body contains passwords then return error with 'using route /updatePassword'
  if(req.body.password || req.body.passwordConfirm) {
    return next(new AppError("For updating your password, please use route /updateMyPassword", 400))
  }
  // 2. Allowed updates => [name, photo]
  const filteredBody = filterObj(req.body, 'name', 'email', 'photo');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });

  res.status(200).json({
    status: "success",
    data: { user: updatedUser },
  });
});

// Delete users options
//  1. Deactivate user account - 30 days then deleted
//  2. Remove user permantaly - admin access
// Reactivate user account

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.activateMyAccount = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: true });

  res.status(200).json({
    status: "success",
    message: "Your account is successfully activated.",
  });
});

exports.deleteAllUser = catchAsync(async (req, res, next) => {
  await User.deleteMany();

  res.status(200).json({
    status: "success",
    message: "All users are deleted!",
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({ 
    status: "error",
    message: "This route is not defined. Please use /signUp instead."
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({ 
    status: "error",
    message: "This route is not defined. Please use /updateMe or /updateMyPassword instead."
  });
};

exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);
