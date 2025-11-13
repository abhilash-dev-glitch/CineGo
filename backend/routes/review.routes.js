const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  getMovieReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/review.controller');

const router = express.Router();

// Public: list reviews for a movie
router.get('/movies/:movieId/reviews', getMovieReviews);

// Protected: create a review for a movie (requires paid booking; enforced in controller)
router.post('/movies/:movieId/reviews', protect, createReview);

// Protected: update/delete review (owner or admin)
router.patch('/reviews/:id', protect, updateReview);
router.delete('/reviews/:id', protect, deleteReview);

module.exports = router;
