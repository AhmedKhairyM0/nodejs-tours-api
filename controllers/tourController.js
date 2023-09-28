const { Mongoose } = require("mongoose");
const AppError = require("../utils/appError");
const Tour = require("./../models/tourModel");
const APIFeatures = require("./../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync");
<<<<<<< HEAD
const factory = require("./factoryHandler");
=======
>>>>>>> cdd3cff3df3b8a456f524b376b96248a125fd9f6

exports.aliasTopCheapestTour = (req, res, next) => {
  req.query = {
    ...req.query,
    sort: "-ratingsAvgerage,price",
    page: 1,
    limit: 5,
  };
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  res.status(200).send({
    status: "success",
    results: tours.length,
    data: { tours },
  });
});

<<<<<<< HEAD
exports.createTour = factory.createOne(Tour);
exports.getTour = factory.getOne(Tour, { path: "reviews" });
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
=======
exports.getTour = catchAsync(async (req, res, next) => {
  const _id = req.params.id;
  // const tour = tours.find((el) => el.id === id);
  const tour = await Tour.findById(_id);
  // await Tour.findOne({ _id: req.params.id });
  if (!tour) {
    return next(new AppError("No tour found with that ID", 404));
  }

  console.log("Mongoose.Types.ObjectId.isValid(_id)", Mongoose.Types.ObjectId);

  // if (!Mongoose.Types.ObjectId.isValid(_id)) {
  //   return next(new AppError("Invalid ID", 400));
  // }

  res.status(200).json({
    status: "success",
    data: { tour },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);
  res.status(201).json({
    status: "success",
    data: { tour },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  // by default partial update [patch]
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // to return updated document
    runValidators: true,
    // overwrite: true, // for PUT http method behavour
  });

  if (!tour) {
    return next(new AppError("No tour found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { tour },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndRemove(req.params.id, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError("No tour found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
>>>>>>> cdd3cff3df3b8a456f524b376b96248a125fd9f6

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $group: {
        _id: null,
        numTours: { $sum: 1 },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year;
  // stages
  //// match
  //// group
  //// sort
  //// unwind
  //// addFields
  //// project
  //// limit

  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTours: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTours: -1 },
    },
    {
      $limit: 1,
    },
  ]);
  res.status(200).json({
    status: "success",
    results: plan.length,
    data: { plan },
  });
});
