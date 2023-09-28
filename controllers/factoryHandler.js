const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

exports.createOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.create(req.body);

  res.status(201).send({
      status: "success",
      data: { data: doc },
  });
});

exports.getAll = (Model) => catchAsync(async (req, res, next) => {
  let filter = {};
  if(req.params.tourId) filter = { tour: req.params.tourId };

  const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
    
  const doc = await features.query;

  res.status(200).send({
    status: "success",
    results: doc.length,
    data: { data: doc },
  });
});

exports.getOne = (Model, popOption) => catchAsync(async (req, res, next) => {
  let query = Model.findById(req.params.id);
  if(popOption) query = query.populate(popOption);
  const doc = await query;

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { data: doc },
  });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    // by default partial update [patch]
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // to return updated document
      runValidators: true,
      // overwrite: true, // for PUT http method behavour
    });
  
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
  
    res.status(200).json({
      status: "success",
      data: { data: doc },
    });
  });

  
exports.deleteOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.findByIdAndRemove(req.params.id, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
