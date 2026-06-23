const { query } = require('../config/database');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT w.id, w.created_at,
        b.id as book_id, b.title, b.author, b.description,
        b.cover_title, b.cover_icon, b.cover_color,
        b.format, b.price, b.delivery_info, b.rating,
        ARRAY_AGG(DISTINCT bg.genre) as genres
       FROM wishlist w
       JOIN books b ON w.book_id = b.id
       LEFT JOIN book_genres bg ON b.id = bg.book_id
       WHERE w.user_id = $1
       GROUP BY w.id, b.id
       ORDER BY w.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        items: result.rows
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching wishlist'
    });
  }
};

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
    }

    // Check if book exists
    const bookCheck = await query(
      'SELECT id FROM books WHERE id = $1',
      [bookId]
    );

    if (bookCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if already in wishlist
    const existingItem = await query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND book_id = $2',
      [userId, bookId]
    );

    if (existingItem.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Book already in wishlist'
      });
    }

    // Add to wishlist
    const result = await query(
      `INSERT INTO wishlist (user_id, book_id)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, bookId]
    );

    res.status(201).json({
      success: true,
      message: 'Book added to wishlist',
      data: {
        wishlistItem: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding to wishlist'
    });
  }
};

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if item exists and belongs to user
    const itemCheck = await query(
      'SELECT id FROM wishlist WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (itemCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    await query('DELETE FROM wishlist WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Item removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing from wishlist'
    });
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    await query('DELETE FROM wishlist WHERE user_id = $1', [userId]);

    res.json({
      success: true,
      message: 'Wishlist cleared'
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error clearing wishlist'
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
};

// Made with Bob