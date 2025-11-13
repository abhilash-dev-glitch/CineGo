const mongoose = require('mongoose');
const Movie = require('./Movie');

const reviewSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },
    comment: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ movie: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAverageRatings = async function (movieId) {
  const stats = await this.aggregate([
    { $match: { movie: movieId } },
    {
      $group: {
        _id: '$movie',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Movie.findByIdAndUpdate(movieId, {
      ratingsCount: stats[0].nRatings,
      ratingsAverage: Math.round((stats[0].avgRating || 0) * 10) / 10,
    });
  } else {
    await Movie.findByIdAndUpdate(movieId, {
      ratingsCount: 0,
      ratingsAverage: 0,
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRatings(this.movie);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this._docToUpdate = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this._docToUpdate) {
    await this._docToUpdate.constructor.calcAverageRatings(this._docToUpdate.movie);
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
