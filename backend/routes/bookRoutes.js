const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  getRecommendedBooks,
  getBestsellers,
  getNewLaunches,
  getRelatedBooks
} = require('../controllers/bookController');

// Routes
router.get('/', getBooks);
router.get('/recommended', getRecommendedBooks);
router.get('/bestsellers', getBestsellers);
router.get('/new-launches', getNewLaunches);
router.get('/:id', getBookById);
router.get('/:id/related', getRelatedBooks);

module.exports = router;

// Made with Bob