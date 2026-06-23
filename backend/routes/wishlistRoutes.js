const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
} = require('../controllers/wishlistController');
const { auth } = require('../middleware/auth');

// All wishlist routes require authentication
router.use(auth);

// Routes
router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:id', removeFromWishlist);
router.delete('/', clearWishlist);

module.exports = router;

// Made with Bob