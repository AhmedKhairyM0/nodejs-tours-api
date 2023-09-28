const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty!'],
        trim: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour'
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
});

reviewSchema.pre(/^find/, function(next) { 
    this.populate({
        path: "user",
        select: "name photo"
     });
    next();
});

module.exports = mongoose.model('Review', reviewSchema);