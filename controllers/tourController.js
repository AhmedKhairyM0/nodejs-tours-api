const Tour = require("./../models/tourModel");
const APIFeatures = require("./../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync");

exports.aliasTopCheapestTour = (req, res, next) => {
  req.query = {
    ...req.query,
    sort: "-ratingsAvgerage,price",
    page: 1,
    limit: 5,
  };
  next();
};

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  // const tour = tours.find((el) => el.id === id);
  try {
    const tour = await Tour.findById(req.params.id);
    // await Tour.findOne({ _id: req.params.id });
    res.status(200).json({
      status: "success",
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }
};

exports.createTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);
  res.status(201).json({
    status: "success",
    data: { tour },
  });
});

// try {
//   const tour = await Tour.create(req.body);
//   res.status(201).json({
//     status: "success",
//     data: { tour },
//   });
// } catch (err) {
//   res.status(400).json({
//     status: "fail",
//     message: err,
//   });
// }

exports.updateTour = async (req, res) => {
  try {
    // by default partial update [patch]
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // to return updated document
      runValidators: true,
      // overwrite: true, // for PUT http method behavour
    });

    res.status(200).json({
      status: "success",
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const deleted = await Tour.findByIdAndRemove(req.params.id, {
      new: true,
      runValidators: true,
    });

    if (!deleted) {
      return res.status(404).json({
        status: "fail",
        message: "Invalid ID!",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Invalid ID!",
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.toString(),
    });
  }
};
