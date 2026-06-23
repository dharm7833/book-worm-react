const { query } = require('../config/database');

// @desc    Get reviews for a book
// @route   GET /api/reviews/book/:bookId
// @access  Public
const getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT r.*, u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.book_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [bookId, limit, offset]
    );

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM reviews WHERE book_id = $1',
      [bookId]
    );

    const total = parseInt(countResult.rows[0].total);

    // Get average rating
    const avgResult = await query(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE book_id = $1',
      [bookId]
    );

    const avgRating = parseFloat(avgResult.rows[0].avg_rating) || 0;

    res.json({
      success: true,
      data: {
        reviews: result.rows,
        avgRating: avgRating.toFixed(1),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get book reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching reviews'
    });
  }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, rating, reviewText } = req.body;

    if (!bookId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Book ID and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
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

    // Check if user already reviewed this book
    const existingReview = await query(
      'SELECT id FROM reviews WHERE user_id = $1 AND book_id = $2',
      [userId, bookId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this book'
      });
    }

    // Create review
    const result = await query(
      `INSERT INTO reviews (user_id, book_id, rating, review_text)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, bookId, rating, reviewText || null]
    );

    // Update book's average rating
    const avgResult = await query(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE book_id = $1',
      [bookId]
    );

    const avgRating = parseFloat(avgResult.rows[0].avg_rating);

    await query(
      'UPDATE books SET rating = $1 WHERE id = $2',
      [avgRating, bookId]
    );

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: {
        review: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating review'
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rating, reviewText } = req.body;

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: 'Rating is required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if review belongs to user
    const reviewCheck = await query(
      'SELECT id, book_id FROM reviews WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const bookId = reviewCheck.rows[0].book_id;

    // Update review
    const result = await query(
      `UPDATE reviews 
       SET rating = $1, review_text = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [rating, reviewText || null, id]
    );

    // Update book's average rating
    const avgResult = await query(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE book_id = $1',
      [bookId]
    );

    const avgRating = parseFloat(avgResult.rows[0].avg_rating);

    await query(
      'UPDATE books SET rating = $1 WHERE id = $2',
      [avgRating, bookId]
    );

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating review'
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if review belongs to user
    const reviewCheck = await query(
      'SELECT id, book_id FROM reviews WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const bookId = reviewCheck.rows[0].book_id;

    // Delete review
    await query('DELETE FROM reviews WHERE id = $1', [id]);

    // Update book's average rating
    const avgResult = await query(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE book_id = $1',
      [bookId]
    );

    const avgRating = avgResult.rows[0].avg_rating 
      ? parseFloat(avgResult.rows[0].avg_rating) 
      : 0;

    await query(
      'UPDATE books SET rating = $1 WHERE id = $2',
      [avgRating, bookId]
    );

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting review'
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/user
// @access  Private
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT r.*, b.title as book_title, b.author as book_author
       FROM reviews r
       JOIN books b ON r.book_id = b.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM reviews WHERE user_id = $1',
      [userId]
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: {
        reviews: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user reviews'
    });
  }
};

module.exports = {
  getBookReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews
};

// Made with Bob