const { query, transaction } = require('../config/database');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT c.id, c.quantity, c.created_at,
        b.id as book_id, b.title, b.author, b.description,
        b.cover_title, b.cover_icon, b.cover_color,
        b.format, b.price, b.delivery_info,
        ARRAY_AGG(DISTINCT bg.genre) as genres
       FROM cart c
       JOIN books b ON c.book_id = b.id
       LEFT JOIN book_genres bg ON b.id = bg.book_id
       WHERE c.user_id = $1
       GROUP BY c.id, b.id
       ORDER BY c.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        items: result.rows
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching cart'
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, quantity = 1 } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
    }

    // Check if book exists and has stock
    const bookResult = await query(
      'SELECT id, stock_quantity FROM books WHERE id = $1',
      [bookId]
    );

    if (bookResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const book = bookResult.rows[0];

    if (book.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Check if item already exists in cart
    const existingItem = await query(
      'SELECT id, quantity FROM cart WHERE user_id = $1 AND book_id = $2',
      [userId, bookId]
    );

    let result;

    if (existingItem.rows.length > 0) {
      // Update quantity
      const newQuantity = existingItem.rows[0].quantity + quantity;

      if (book.stock_quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock for requested quantity'
        });
      }

      result = await query(
        `UPDATE cart 
         SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 
         RETURNING *`,
        [newQuantity, existingItem.rows[0].id]
      );
    } else {
      // Add new item
      result = await query(
        `INSERT INTO cart (user_id, book_id, quantity) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [userId, bookId, quantity]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: {
        item: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding to cart'
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    // Check if cart item belongs to user
    const cartItem = await query(
      `SELECT c.id, c.book_id, b.stock_quantity 
       FROM cart c
       JOIN books b ON c.book_id = b.id
       WHERE c.id = $1 AND c.user_id = $2`,
      [id, userId]
    );

    if (cartItem.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const item = cartItem.rows[0];

    if (item.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    const result = await query(
      `UPDATE cart 
       SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [quantity, id]
    );

    res.json({
      success: true,
      message: 'Cart item updated',
      data: {
        item: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating cart item'
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if cart item belongs to user
    const cartItem = await query(
      'SELECT id FROM cart WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (cartItem.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    await query('DELETE FROM cart WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing from cart'
    });
  }
};

// @desc    Clear user's cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await query('DELETE FROM cart WHERE user_id = $1', [userId]);

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error clearing cart'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};

// Made with Bob