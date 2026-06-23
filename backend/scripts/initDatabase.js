const { pool } = require('../config/database');
require('dotenv').config();

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Creating database tables...');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Books table
    await client.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        description TEXT,
        cover_title VARCHAR(255),
        cover_icon VARCHAR(50),
        cover_color VARCHAR(50),
        publisher VARCHAR(255),
        format VARCHAR(50),
        language VARCHAR(50) DEFAULT 'English',
        price DECIMAL(10, 2) NOT NULL,
        stock_quantity INTEGER DEFAULT 0,
        rating DECIMAL(3, 2) DEFAULT 0,
        sales_count INTEGER DEFAULT 0,
        delivery_info VARCHAR(255),
        about_author TEXT,
        book_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Books table created');

    // Book genres table (many-to-many relationship)
    await client.query(`
      CREATE TABLE IF NOT EXISTS book_genres (
        id SERIAL PRIMARY KEY,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        genre VARCHAR(100) NOT NULL,
        UNIQUE(book_id, genre)
      );
    `);
    console.log('✅ Book genres table created');

    // Cart table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      );
    `);
    console.log('✅ Cart table created');

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total_amount DECIMAL(10, 2) NOT NULL,
        tax_amount DECIMAL(10, 2) DEFAULT 0,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        coupon_code VARCHAR(50),
        payment_method VARCHAR(50),
        payment_status VARCHAR(50) DEFAULT 'pending',
        order_status VARCHAR(50) DEFAULT 'processing',
        shipping_address JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Orders table created');

    // Order items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Order items table created');

    // Reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      );
    `);
    console.log('✅ Reviews table created');

    // Wishlist table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      );
    `);
    console.log('✅ Wishlist table created');

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
      CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
      CREATE INDEX IF NOT EXISTS idx_books_price ON books(price);
      CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON reviews(book_id);
    `);
    console.log('✅ Indexes created');

    console.log('🎉 Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

const seedData = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Seeding initial data...');

    // Check if books already exist
    const { rows } = await client.query('SELECT COUNT(*) FROM books');
    if (parseInt(rows[0].count) > 0) {
      console.log('⚠️  Books already exist, skipping seed data');
      return;
    }

    // Insert sample books
    const books = [
      {
        title: 'The Art of Focus',
        author: 'Arjun Patel',
        description: 'A practical guide to mastering focus & boosting productivity.',
        cover_title: 'THE ART OF FOCUS',
        cover_icon: '🎯',
        cover_color: '#f5e6d3',
        format: 'Paperback',
        genres: ['Non-fiction', 'Self Help'],
        price: 399,
        stock_quantity: 50,
        delivery_info: 'Mon, 23 Jul'
      },
      {
        title: 'The Art of Learning',
        author: 'Raj Patel',
        description: 'Discover proven methods for effective lifelong learning.',
        cover_title: 'THE ART OF LEARNING',
        cover_icon: '💡',
        cover_color: '#ff4444',
        format: 'Paperback',
        genres: ['Non-fiction', 'Self Help'],
        price: 259,
        stock_quantity: 45,
        delivery_info: 'Mon, 23 Jul'
      },
      {
        title: 'The Path to Success',
        author: 'James Wright',
        description: 'A practical guide to achieving goals with clarity and confidence.',
        cover_title: 'THE PATH TO SUCCESS',
        cover_icon: '📈',
        cover_color: '#4db8e8',
        format: 'Paperback',
        genres: ['Non-fiction', 'Self Help'],
        price: 359,
        stock_quantity: 40,
        delivery_info: 'Mon, 23 Jul'
      },
      {
        title: 'The Midnight Hour',
        author: 'James Adams',
        description: "Haunting tale of a man's journey & the shadows of a forgotten past.",
        cover_title: 'THE MIDNIGHT HOUR',
        cover_icon: '🌙',
        cover_color: '#1a4d5c',
        format: 'Paperback',
        genres: ['Fiction', 'Thriller', 'Horror'],
        price: 299,
        stock_quantity: 35,
        delivery_info: 'Mon, 23 Jul'
      },
      {
        title: 'Beneath the Stars',
        author: 'Jessica Martin',
        description: 'A heartwarming tale, where two souls discover who you are.',
        cover_title: 'Beneath the Stars',
        cover_icon: '⭐',
        cover_color: '#6b4d8a',
        format: 'Hard Cover',
        genres: ['Fiction', 'Love', 'Drama'],
        price: 499,
        stock_quantity: 30,
        delivery_info: 'Mon, 23 Jul'
      },
      {
        title: 'The Final Frontier',
        author: 'Laura Mitchell',
        description: 'A mission to solve secrets to change humanity forever.',
        cover_title: 'THE FINAL FRONTIER',
        cover_icon: '🚀',
        cover_color: '#1a3d5c',
        format: 'Paperback',
        genres: ['Fiction', 'Thriller'],
        price: 359,
        stock_quantity: 42,
        delivery_info: 'Mon, 23 Jul'
      },
      {
        title: 'Joy of Minimalism',
        author: 'Daniel Reed',
        description: 'Declutter your life to uncover peace, clarity, and happiness.',
        cover_title: 'THE JOY OF MINIMALISM',
        cover_icon: '🏠',
        cover_color: '#ffd700',
        format: 'Paperback',
        genres: ['Non-fiction', 'Self Help'],
        price: 149,
        stock_quantity: 60,
        delivery_info: 'Mon, 23 Jul'
      },
      {
        title: 'The Vanishing House',
        author: 'Clara Nelson',
        description: 'A chilling mystery unfolds within a house that disappears.',
        cover_title: 'THE VANISHING HOUSE',
        cover_icon: '🏚️',
        cover_color: '#2d5a5a',
        format: 'eBook',
        genres: ['Fiction', 'Horror'],
        price: 99,
        stock_quantity: 100,
        delivery_info: 'Mon, 23 Jul'
      },
      {
        title: 'The Lost Kitten',
        author: 'Emily Parker',
        description: 'A heartwarming tale of courage, friendship, and feline adventure.',
        cover_title: 'The Lost Kitten',
        cover_icon: '🐱',
        cover_color: '#ff8c42',
        format: 'Hardcover',
        genres: ['Fiction', 'Children'],
        price: 339,
        stock_quantity: 38,
        delivery_info: 'Mon, 23 Jul'
      }
    ];

    for (const book of books) {
      const result = await client.query(
        `INSERT INTO books (title, author, description, cover_title, cover_icon, cover_color, 
         format, price, stock_quantity, delivery_info) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [book.title, book.author, book.description, book.cover_title, book.cover_icon, 
         book.cover_color, book.format, book.price, book.stock_quantity, book.delivery_info]
      );

      const bookId = result.rows[0].id;

      // Insert genres
      for (const genre of book.genres) {
        await client.query(
          'INSERT INTO book_genres (book_id, genre) VALUES ($1, $2)',
          [bookId, genre]
        );
      }
    }

    console.log('✅ Sample books inserted');
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    client.release();
  }
};

const init = async () => {
  try {
    await createTables();
    await seedData();
    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

init();

// Made with Bob