const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must not exceed 50 characters'],
      validate: {
        validator: function(v) {
          // Must contain at least one letter
          if (!/[a-zA-Z]/.test(v)) return false;
          // Cannot be only numbers
          if (/^\d+$/.test(v)) return false;
          // Only letters, spaces, hyphens, and apostrophes allowed
          if (!/^[a-zA-Z\s\-']+$/.test(v)) return false;
          return true;
        },
        message: 'Name must contain letters and can only include spaces, hyphens, and apostrophes'
      }
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['endUser', 'admin', 'theaterManager'],
      default: 'endUser',
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      validate: {
        validator: function(v) {
          // Remove all non-digit characters
          const digitsOnly = v.replace(/\D/g, '');
          
          // Check length
          if (digitsOnly.length < 10 || digitsOnly.length > 15) return false;
          
          // Reject repetitive numbers (e.g., 1111111111)
          if (/^(\d)\1+$/.test(digitsOnly)) return false;
          
          // Reject sequential numbers (e.g., 1234567890)
          const isSequential = digitsOnly.split('').every((digit, i, arr) => {
            if (i === 0) return true;
            return parseInt(digit) === parseInt(arr[i-1]) + 1 || 
                   (parseInt(arr[i-1]) === 9 && parseInt(digit) === 0);
          });
          if (isSequential) return false;
          
          return true;
        },
        message: 'Please provide a valid phone number (10-15 digits, no repetitive or sequential patterns)'
      }
    },
    profilePicture: {
      type: String,
      default: null,
    },
    profilePicturePublicId: {
      type: String,
      default: null,
    },
    // Theater manager specific fields
    managedTheaters: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Theater',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
