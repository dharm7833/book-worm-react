# Book Worm Backend API

A comprehensive Node.js backend API for the Book Worm bookstore application, built with Express.js and PostgreSQL.

## Features

- 🔐 **Authentication & Authorization**
  - User registration and login with JWT
  - Password reset functionality
  - Secure password hashing with bcrypt

- 📚 **Book Management**
  - Browse books with advanced filtering
  - Search by title, author, genre
  - Sort by price, rating, newest
  - Recommended books, bestsellers, new launches

- 🛒 **Shopping Cart**
  - Add/remove items
  - Update quantities
  - Stock validation

- 💳 **Order Processing**
  - Create orders from cart
  - Order history
  - Payment status tracking

- ⭐ **Reviews & Ratings**
  - Submit book reviews
  - Rate books (1-5 stars)
  - View all reviews for a book

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Environment Variables**: dotenv

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookworm_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Set up PostgreSQL Database

Create a new PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE bookworm_db;

# Exit psql
\q
```

### 5. Initialize Database Tables

Run the database initialization script:

```bash
npm run init-db
```

This will:
- Create all necessary tables (users, books, cart, orders, reviews, etc.)
- Set up indexes for better performance
- Seed initial book data

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Book Endpoints

#### Get All Books (with filters)
```http
GET /api/books?search=focus&language=English&format=Paperback&minPrice=100&maxPrice=500&sortBy=price_low&page=1&limit=20
```

#### Get Single Book
```http
GET /api/books/:id
```

#### Get Recommended Books
```http
GET /api/books/recommended?limit=3
```

#### Get Bestsellers
```http
GET /api/books/bestsellers?limit=3
```

#### Get New Launches
```http
GET /api/books/new-launches?limit=3
```

#### Get Related Books
```http
GET /api/books/:id/related?limit=4
```

### Cart Endpoints (Protected)

#### Get Cart
```http
GET /api/cart
Authorization: Bearer <token>
```

#### Add to Cart
```http
POST /api/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookId": 1,
  "quantity": 1
}
```

#### Update Cart Item
```http
PUT /api/cart/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 2
}
```

#### Remove from Cart
```http
DELETE /api/cart/:id
Authorization: Bearer <token>
```

#### Clear Cart
```http
DELETE /api/cart
Authorization: Bearer <token>
```

### Order Endpoints (Protected)

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "addressLine": "123 Main St",
    "city": "New York",
    "state": "NY",
    "pin": "10001",
    "phone": "1234567890",
    "email": "john@example.com"
  },
  "paymentMethod": "credit",
  "taxAmount": 62,
  "discountAmount": 100,
  "couponCode": "SAVE100"
}
```

#### Get User Orders
```http
GET /api/orders?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Single Order
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Update Payment Status
```http
PUT /api/orders/:id/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentStatus": "completed"
}
```

### Review Endpoints

#### Get Book Reviews (Public)
```http
GET /api/reviews/book/:bookId?page=1&limit=10
```

#### Create Review (Protected)
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookId": 1,
  "rating": 5,
  "reviewText": "Great book!"
}
```

#### Get User Reviews (Protected)
```http
GET /api/reviews/user?page=1&limit=10
Authorization: Bearer <token>
```

#### Update Review (Protected)
```http
PUT /api/reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "reviewText": "Updated review"
}
```

#### Delete Review (Protected)
```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

## Database Schema

### Users Table
- id, name, email, password, reset_token, reset_token_expiry, created_at, updated_at

### Books Table
- id, title, author, description, cover_title, cover_icon, cover_color, publisher, format, language, price, stock_quantity, rating, sales_count, delivery_info, about_author, book_description, created_at, updated_at

### Book Genres Table
- id, book_id, genre

### Cart Table
- id, user_id, book_id, quantity, created_at, updated_at

### Orders Table
- id, user_id, total_amount, tax_amount, discount_amount, coupon_code, payment_method, payment_status, order_status, shipping_address, created_at, updated_at

### Order Items Table
- id, order_id, book_id, quantity, price, created_at

### Reviews Table
- id, user_id, book_id, rating, review_text, created_at, updated_at

### Wishlist Table
- id, user_id, book_id, created_at

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

Error Response Format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- SQL injection prevention with parameterized queries
- CORS configuration
- Input validation with express-validator
- Environment variable protection

## Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── bookController.js    # Book operations
│   ├── cartController.js    # Cart operations
│   ├── orderController.js   # Order processing
│   └── reviewController.js  # Review management
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── bookRoutes.js        # Book endpoints
│   ├── cartRoutes.js        # Cart endpoints
│   ├── orderRoutes.js       # Order endpoints
│   └── reviewRoutes.js      # Review endpoints
├── scripts/
│   └── initDatabase.js      # Database initialization
├── .env.example             # Environment variables template
├── package.json             # Dependencies
├── server.js                # Main server file
└── README.md                # This file
```

## Testing

You can test the API using:
- Postman
- cURL
- Thunder Client (VS Code extension)
- Any HTTP client

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if the database exists

### Port Already in Use
- Change the PORT in `.env` file
- Or kill the process using the port

### JWT Token Errors
- Ensure JWT_SECRET is set in `.env`
- Check token expiration time

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please open an issue in the repository.

---

**Made with Bob** 🤖