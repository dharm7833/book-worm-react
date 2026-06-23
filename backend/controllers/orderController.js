const { query, transaction } = require('../config/database');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      shippingAddress,
      paymentMethod,
      couponCode,
      taxAmount,
      discountAmount
    } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address and payment method are required'
      });
    }

    // Use transaction to ensure data consistency
    const result = await transaction(async (client) => {
      // Get cart items
      const cartResult = await client.query(
        `SELECT c.book_id, c.quantity, b.price, b.stock_quantity
         FROM cart c
         JOIN books b ON c.book_id = b.id
         WHERE c.user_id = $1`,
        [userId]
      );

      if (cartResult.rows.length === 0) {
        throw new Error('Cart is empty');
      }

      const cartItems = cartResult.rows;

      // Check stock availability
      for (const item of cartItems) {
        if (item.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for book ID ${item.book_id}`);
        }
      }

      // Calculate total
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const totalAmount = subtotal + (taxAmount || 0) - (discountAmount || 0);

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (
          user_id, total_amount, tax_amount, discount_amount,
          coupon_code, payment_method, shipping_address
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          userId,
          totalAmount,
          taxAmount || 0,
          discountAmount || 0,
          couponCode || null,
          paymentMethod,
          JSON.stringify(shippingAddress)
        ]
      );

      const order = orderResult.rows[0];

      // Create order items and update stock
      for (const item of cartItems) {
        await client.query(
          `INSERT INTO order_items (order_id, book_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [order.id, item.book_id, item.quantity, item.price]
        );

        // Update book stock and sales count
        await client.query(
          `UPDATE books 
           SET stock_quantity = stock_quantity - $1,
               sales_count = sales_count + $1
           WHERE id = $2`,
          [item.quantity, item.book_id]
        );
      }

      // Clear cart
      await client.query('DELETE FROM cart WHERE user_id = $1', [userId]);

      return order;
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: result
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating order'
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'book_id', oi.book_id,
            'quantity', oi.quantity,
            'price', oi.price,
            'book_title', b.title,
            'book_author', b.author
          )
        ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN books b ON oi.book_id = b.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = $1',
      [userId]
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: {
        orders: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await query(
      `SELECT o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'book_id', oi.book_id,
            'quantity', oi.quantity,
            'price', oi.price,
            'book_title', b.title,
            'book_author', b.author,
            'book_cover_color', b.cover_color,
            'book_cover_icon', b.cover_icon
          )
        ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN books b ON oi.book_id = b.id
       WHERE o.id = $1 AND o.user_id = $2
       GROUP BY o.id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        order: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching order'
    });
  }
};

// @desc    Update order payment status
// @route   PUT /api/orders/:id/payment
// @access  Private
const updatePaymentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];

    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

    // Check if order belongs to user
    const orderCheck = await query(
      'SELECT id FROM orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const result = await query(
      `UPDATE orders 
       SET payment_status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [paymentStatus, id]
    );

    res.json({
      success: true,
      message: 'Payment status updated',
      data: {
        order: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating payment status'
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updatePaymentStatus
};

// Made with Bob