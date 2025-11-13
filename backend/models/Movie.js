const mongoose = require('mongoose');
const Showtime = require('./Showtime'); // Need to require for pre-hook

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A movie must have a title'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'A movie must have a description'],
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'A movie must have a duration'],
    },
    genre: {
      type: [String],
      required: [true, 'A movie must have at least one genre'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'A movie must have a release date'],
    },
    director: {
      type: String,
      required: [true, 'A movie must have a director'],
    },
    cast: [String],
    language: {
      type: String,
      required: [true, 'Please specify the movie language'],
    },
    ratingsAverage: {
      type: Number,
      min: [0, 'Rating must be above 0'],
      max: [10, 'Rating must be below 10'],
      default: 0,
      set: (val) => Math.round(val * 10) / 10, // Rounds to one decimal place
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    poster: {
      type: String,
      default: null,
    },
    posterPublicId: {
      type: String,
      default: null,
    },
    trailer: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual populate for reviews
movieSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'movie',
  localField: '_id',
});

// Virtual populate for showtimes
movieSchema.virtual('showtimes', {
  ref: 'Showtime',
  foreignField: 'movie',
  localField: '_id',
  options: { sort: { startTime: 1 } }, // Sort showtimes by start time
});

// *** FIX HERE ***
// Set default_language to 'none' to disable language-specific indexing
// This prevents MongoDB from trying to use the 'language' field for override
movieSchema.index(
  { title: 'text', director: 'text' },
  { default_language: 'none' } 
);


// Mongoose middleware to delete associated showtimes when a movie is deleted
movieSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    try {
      // `this` refers to the movie document being deleted
      await Showtime.deleteMany({ movie: this._id });
      next();
    } catch (err) {
      next(err);
    }
  }
);


const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;