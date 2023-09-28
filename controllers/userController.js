const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
<<<<<<< HEAD
const factory = require("./factoryHandler")

const filterObj = (obj, ...allowed) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
      if(allowed.includes(el)) newObj[el] =  obj[el];
  });

  return newObj;
};
=======
>>>>>>> cdd3cff3df3b8a456f524b376b96248a125fd9f6

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    data: { users },
  });
});

<<<<<<< HEAD

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
=======
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    next(new AppError("No User found with that ID"));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  res.status(500).json({
    status: "error",
    message: "No implemented yet",
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!user) {
    next(new AppError("No User found with that ID"));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id, {
    new: true,
  });

  if (!user) {
    next(new AppError("No User found with that ID"));
  }

  res.status(204).json({
    status: "success",
    data: null,
>>>>>>> cdd3cff3df3b8a456f524b376b96248a125fd9f6
  });
});

exports.deleteAllUser = catchAsync(async (req, res, next) => {
  await User.deleteMany();

  res.status(200).json({
    status: "success",
    message: "All users are deleted!",
  });
});
<<<<<<< HEAD

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
=======
>>>>>>> cdd3cff3df3b8a456f524b376b96248a125fd9f6
