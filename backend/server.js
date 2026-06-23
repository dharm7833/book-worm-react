const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { pool } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   📚 Book Worm API Server                            ║
║                                                       ║
║   🚀 Server running on port ${PORT}                     ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                    ║
║   📡 API Base URL: http://localhost:${PORT}             ║
║                                                       ║
║   Available Routes:                                   ║
║   • POST   /api/auth/register                        ║
║   • POST   /api/auth/login                           ║
║   • GET    /api/auth/me                              ║
║   • POST   /api/auth/forgot-password                 ║
║   • POST   /api/auth/reset-password/:token           ║
║                                                       ║
║   • GET    /api/books                                ║
║   • GET    /api/books/:id                            ║
║   • GET    /api/books/recommended                    ║
║   • GET    /api/books/bestsellers                    ║
║   • GET    /api/books/new-launches                   ║
║                                                       ║
║   • GET    /api/cart                                 ║
║   • POST   /api/cart                                 ║
║   • PUT    /api/cart/:id                             ║
║   • DELETE /api/cart/:id                             ║
║                                                       ║
║   • GET    /api/orders                               ║
║   • POST   /api/orders                               ║
║   • GET    /api/orders/:id                           ║
║                                                       ║
║   • GET    /api/reviews/book/:bookId                 ║
║   • POST   /api/reviews                              ║
║   • GET    /api/reviews/user                         ║
║   • PUT    /api/reviews/:id                          ║
║   • DELETE /api/reviews/:id                          ║
║                                                       ║
║   • GET    /api/wishlist                             ║
║   • POST   /api/wishlist                             ║
║   • DELETE /api/wishlist/:id                         ║
║   • DELETE /api/wishlist                             ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

module.exports = app;

// Made with Bob