const mongoose = require("mongoose");
const slugify = require("slugify");
<<<<<<< HEAD
// const validator = require("validator");
=======
const validator = require("validator");
>>>>>>> cdd3cff3df3b8a456f524b376b96248a125fd9f6

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "A tour must have a name"],
      minLength: [10, "A tour name must have more or equal than 10 characters"], // built-in validation
      maxLength: [50, "A tour name must have less or equal than 50 characters"],
      // validate: [validator.isAlpha, "A tour name must only be characters"], // 3-party validation
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "Tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Tour must have a group number"],
    },
    difficulty: {
      type: String,
      required: [true, "Tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
<<<<<<< HEAD
      ////// 'this' can use only in case create new Document but in case updating, deleting can't
=======
      ////// this can use only in case create new Document but in case updating, deleting can't
>>>>>>> cdd3cff3df3b8a456f524b376b96248a125fd9f6
      ////// so that the update validaion can be executed by middleware
      // validate: {
      //   // custom validation
      //   validator: function (val) {
      //     console.log(val, this.price);
      //     return val < this.price;
      //   },
      //   message: "Discount price ({VALUE}) should be less than regular price",
      // },
    },
    summary: {
      type: String,
      required: [true, "A tour must have a summary"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "A tour must have a description"],
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      // TODO: How to respect the timezone
      default: Date.now(),
      // For hidding permanently this field
      // select: false,
    },
    startDates: [Date],
    secretTour: Boolean,
    role: {
      type: String,
      enum: ["free", "vip"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    // timestamps: true,  // => To add automaticaly createdAt, updatedAt fields
  }
);

// Virtual Properity: is not saved at database
tourSchema.virtual("durationsWeek").get(function () {
  return this.duration / 7;
});

<<<<<<< HEAD
// Virtual populate
tourSchema.virtual("reviews", { 
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

=======
>>>>>>> cdd3cff3df3b8a456f524b376b96248a125fd9f6
// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, {
    lower: true,
    trim: true,
  });

  next();
});

// QUERY MIDDLEWARE
// tourSchema.pre("find", function (next) {
// this version works only for find but not findById, findOne, findOneAndDelete, ...
// fix it by using regular expersion /^find/
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

// CRUD Middlewares
// pre() > save, find, ...
module.exports = Tour;

// Validation (entered data is right format for each field and required fields) & Sanitization (entered data is clean from injected code)
