const express = require('express');
const router = express.Router();
const {
  getBookReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews
} = require('../controllers/reviewController');
const { auth, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/book/:bookId', getBookReviews);

// Private routes
router.post('/', auth, createReview);
router.get('/user', auth, getUserReviews);
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);

module.exports = router;

// Made with Bob