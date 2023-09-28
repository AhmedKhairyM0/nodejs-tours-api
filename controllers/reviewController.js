const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Review = require('./../models/reviewModel');
const factory = require("./factoryHandler")

exports.setTourAndUserId = (req, res, next) => {
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id; 

    next();
};

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    if(req.params.tourId) filter = { tour: req.params.tourId };

    const reviews = await Review.find(filter)

    res.status(200).send({
        status: "success",
        results: reviews.length,
        data: { reviews },
    });
});

exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review);
