const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updatePaymentStatus
} = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

// All order routes require authentication
router.use(auth);

// Routes
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id/payment', updatePaymentStatus);

module.exports = router;

// Made with Bob