const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A theater must have a name'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // [longitude, latitude]
      address: {
        type: String,
        required: [true, 'Theater must have an address'],
      },
      description: String,
    },
    city: {
      type: String,
      required: [true, 'Please specify the city'],
    },
    screens: [
      {
        name: {
          type: String,
          required: [true, 'Screen must have a name'],
        },
        capacity: {
          type: Number,
          required: [true, 'Screen must have a capacity'],
        },
        // Store layout as a 2D array of seat types (e.g., 0=empty, 1=regular, 2=premium)
        seatLayout: {
          type: [[Number]], 
          required: [true, 'Screen must have a seat layout'],
        },
      },
    ],
    facilities: [String],
    logo: {
      type: String,
      default: null,
    },
    logoPublicId: {
      type: String,
      default: null,
    },
    contact: {
      phone: String,
      email: {
        type: String,
        validate: {
          validator: function (v) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          },
          message: (props) => `${props.value} is not a valid email!`,
        },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Index for geospatial queries
theaterSchema.index({ location: '2dsphere' });

// Virtual populate showtimes
theaterSchema.virtual('showtimes', {
  ref: 'Showtime',
  foreignField: 'theater',
  localField: '_id',
});

// Middleware: When a theater is deleted, delete all its showtimes
theaterSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  console.log(`Deleting showtimes for theater: ${this._id}`);
  // 'this' refers to the document being deleted
  await mongoose.model('Showtime').deleteMany({ theater: this._id });
  next();
});

const Theater = mongoose.model('Theater', theaterSchema);
module.exports = Theater;