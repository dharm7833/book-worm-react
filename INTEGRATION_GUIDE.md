# Backend API Integration Guide

## Overview
This document describes the complete integration of the Book Worm frontend application with the backend API.

## Changes Made

### 1. API Service Layer (`src/services/api.js`)
Created a centralized API service module that handles all backend communication:
- **Authentication APIs**: register, login, getMe, forgotPassword, resetPassword
- **Books APIs**: getBooks, getBookById, getRecommendedBooks, getBestsellers, getNewLaunches, getRelatedBooks
- **Cart APIs**: getCart, addToCart, updateCartItem, removeFromCart, clearCart
- **Orders APIs**: createOrder, getOrders, getOrderById, updatePaymentStatus
- **Reviews APIs**: getBookReviews, createReview, getUserReviews, updateReview, deleteReview

### 2. Authentication Context (`src/context/AuthContext.js`)
Updated to use backend authentication:
- Login and registration now use backend API endpoints
- JWT token storage in localStorage
- Automatic authentication check on app load
- Forgot password functionality integrated with backend

### 3. Cart Context (`src/context/CartContext.js`)
Enhanced to support both authenticated and guest users:
- Authenticated users: Cart data synced with backend
- Guest users: Cart stored in localStorage
- Automatic cart fetch on authentication
- All cart operations (add, update, remove, clear) integrated with backend

### 4. Components Updated

#### MainContent (`src/components/MainContent.js`)
- Fetches recommended books, bestsellers, and new launches from backend
- Loading and error states
- Dynamic book rendering from API data

#### ProductDetail (`src/components/ProductDetail.js`)
- Fetches book details by ID from URL parameter
- Loads reviews from backend
- Submit reviews to backend (requires authentication)
- Dynamic related books section

#### ShoppingCart (`src/components/ShoppingCart.js`)
- Handles both backend and local cart data structures
- Compatible with cart items from API

#### Payment (`src/components/Payment.js`)
- Creates orders via backend API
- Updates payment status
- Clears cart after successful payment
- Requires authentication

#### BookCard (`src/components/BookCard.js`)
- Handles both frontend and backend data structures
- Dynamic navigation to product detail pages
- Compatible with API response format

#### RelatedReads (`src/components/RelatedReads.js`)
- Fetches related books from backend based on current book ID
- Clickable cards that navigate to product details
- Loading states

### 5. Environment Configuration
Created `.env` file with:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Backend Setup

### Prerequisites
- PostgreSQL database installed and running
- Node.js installed

### Steps
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `backend/.env`:
   ```
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=bookworm_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. Initialize database:
   ```bash
   npm run init-db
   ```

5. Start backend server:
   ```bash
   npm start
   ```

Backend will run on http://localhost:5000

## Frontend Setup

### Steps
1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Ensure `.env` file exists in root with:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. Start frontend development server:
   ```bash
   npm start
   ```

Frontend will run on http://localhost:3000

## API Endpoints Used

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Books
- `GET /api/books` - Get all books with filters
- `GET /api/books/:id` - Get book by ID
- `GET /api/books/recommended` - Get recommended books
- `GET /api/books/bestsellers` - Get bestseller books
- `GET /api/books/new-launches` - Get new launch books
- `GET /api/books/:id/related` - Get related books

### Cart (requires authentication)
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

### Orders (requires authentication)
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/payment` - Update payment status

### Reviews
- `GET /api/reviews/book/:bookId` - Get reviews for a book
- `POST /api/reviews` - Create review (requires auth)
- `GET /api/reviews/user` - Get user's reviews (requires auth)
- `PUT /api/reviews/:id` - Update review (requires auth)
- `DELETE /api/reviews/:id` - Delete review (requires auth)

## Data Structure Compatibility

The application handles both frontend mock data and backend API data structures:

### Frontend Format (legacy):
```javascript
{
  title: "Book Title",
  author: "Author Name",
  coverColor: "#f5e6d3",
  coverTitle: "BOOK TITLE",
  coverIcon: "📚",
  price: 399,
  // ...
}
```

### Backend Format:
```javascript
{
  id: 1,
  title: "Book Title",
  author: "Author Name",
  cover_color: "#f5e6d3",
  cover_title: "BOOK TITLE",
  cover_icon: "📚",
  price: 399,
  // ...
}
```

All components handle both formats seamlessly.

## Authentication Flow

1. User registers or logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token included in all authenticated requests via Authorization header
5. On app load, token validated with backend
6. If invalid, user logged out automatically

## Cart Synchronization

### For Authenticated Users:
- Cart stored in backend database
- Synced across devices
- Persists after logout

### For Guest Users:
- Cart stored in localStorage
- Lost on browser clear
- Can be migrated to backend on login (future enhancement)

## Error Handling

All API calls include error handling:
- Network errors caught and displayed to user
- Authentication errors redirect to login
- Validation errors shown in forms
- Server errors display user-friendly messages

## Testing the Integration

1. **Start both servers** (backend on :5000, frontend on :3000)
2. **Test Authentication**:
   - Register a new account
   - Login with credentials
   - Verify token storage in localStorage
3. **Test Book Browsing**:
   - View recommended books
   - View bestsellers
   - View new launches
   - Click on a book to view details
4. **Test Cart Operations**:
   - Add books to cart
   - Update quantities
   - Remove items
   - View cart page
5. **Test Reviews**:
   - Submit a review (requires login)
   - View reviews on product page
6. **Test Checkout**:
   - Proceed to payment
   - Complete payment
   - Verify order creation

## Troubleshooting

### Backend not connecting:
- Verify PostgreSQL is running
- Check database credentials in backend/.env
- Ensure port 5000 is not in use

### Frontend API errors:
- Verify backend is running on port 5000
- Check REACT_APP_API_URL in .env
- Check browser console for CORS errors

### Authentication issues:
- Clear localStorage and try again
- Verify JWT_SECRET is set in backend/.env
- Check token expiration settings

## Future Enhancements

1. Cart migration from localStorage to backend on login
2. Wishlist functionality
3. Order history page
4. User profile management
5. Book search and filtering
6. Pagination for book lists
7. Image upload for book covers
8. Email notifications for orders
9. Password reset email functionality
10. Social authentication (Google, Facebook)

## Made with Bob