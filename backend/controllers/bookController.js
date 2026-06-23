const { query } = require('../config/database');

// @desc    Get all books with filters
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    const {
      search,
      language,
      format,
      minPrice,
      maxPrice,
      genre,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.query;

    let queryText = `
      SELECT DISTINCT b.*, 
        ARRAY_AGG(DISTINCT bg.genre) as genres
      FROM books b
      LEFT JOIN book_genres bg ON b.id = bg.book_id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    // Search filter
    if (search) {
      paramCount++;
      queryText += ` AND (b.title ILIKE $${paramCount} OR b.author ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Language filter
    if (language && language !== 'All') {
      paramCount++;
      queryText += ` AND b.language = $${paramCount}`;
      queryParams.push(language);
    }

    // Format filter
    if (format) {
      paramCount++;
      queryText += ` AND b.format = $${paramCount}`;
      queryParams.push(format);
    }

    // Price range filter
    if (minPrice) {
      paramCount++;
      queryText += ` AND b.price >= $${paramCount}`;
      queryParams.push(minPrice);
    }

    if (maxPrice) {
      paramCount++;
      queryText += ` AND b.price <= $${paramCount}`;
      queryParams.push(maxPrice);
    }

    // Genre filter
    if (genre) {
      paramCount++;
      queryText += ` AND bg.genre = $${paramCount}`;
      queryParams.push(genre);
    }

    queryText += ' GROUP BY b.id';

    // Sorting
    switch (sortBy) {
      case 'price_low':
        queryText += ' ORDER BY b.price ASC';
        break;
      case 'price_high':
        queryText += ' ORDER BY b.price DESC';
        break;
      case 'newest':
        queryText += ' ORDER BY b.created_at DESC';
        break;
      case 'rating':
        queryText += ' ORDER BY b.rating DESC';
        break;
      default:
        queryText += ' ORDER BY b.sales_count DESC, b.rating DESC';
    }

    // Pagination
    const offset = (page - 1) * limit;
    paramCount++;
    queryText += ` LIMIT $${paramCount}`;
    queryParams.push(limit);
    
    paramCount++;
    queryText += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    const result = await query(queryText, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT b.id) as total
      FROM books b
      LEFT JOIN book_genres bg ON b.id = bg.book_id
      WHERE 1=1
    `;
    const countParams = [];
    let countParamIndex = 0;

    if (search) {
      countParamIndex++;
      countQuery += ` AND (b.title ILIKE $${countParamIndex} OR b.author ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }

    if (language && language !== 'All') {
      countParamIndex++;
      countQuery += ` AND b.language = $${countParamIndex}`;
      countParams.push(language);
    }

    if (format) {
      countParamIndex++;
      countQuery += ` AND b.format = $${countParamIndex}`;
      countParams.push(format);
    }

    if (minPrice) {
      countParamIndex++;
      countQuery += ` AND b.price >= $${countParamIndex}`;
      countParams.push(minPrice);
    }

    if (maxPrice) {
      countParamIndex++;
      countQuery += ` AND b.price <= $${countParamIndex}`;
      countParams.push(maxPrice);
    }

    if (genre) {
      countParamIndex++;
      countQuery += ` AND bg.genre = $${countParamIndex}`;
      countParams.push(genre);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: {
        books: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching books'
    });
  }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT b.*, 
        ARRAY_AGG(DISTINCT bg.genre) as genres
       FROM books b
       LEFT JOIN book_genres bg ON b.id = bg.book_id
       WHERE b.id = $1
       GROUP BY b.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: {
        book: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Get book by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching book'
    });
  }
};

// @desc    Get recommended books
// @route   GET /api/books/recommended
// @access  Public
const getRecommendedBooks = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const result = await query(
      `SELECT b.*, 
        ARRAY_AGG(DISTINCT bg.genre) as genres
       FROM books b
       LEFT JOIN book_genres bg ON b.id = bg.book_id
       WHERE bg.genre IN ('Non-fiction', 'Self Help')
       GROUP BY b.id
       ORDER BY b.rating DESC, b.sales_count DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      data: {
        books: result.rows
      }
    });
  } catch (error) {
    console.error('Get recommended books error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching recommended books'
    });
  }
};

// @desc    Get bestseller books
// @route   GET /api/books/bestsellers
// @access  Public
const getBestsellers = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const result = await query(
      `SELECT b.*, 
        ARRAY_AGG(DISTINCT bg.genre) as genres
       FROM books b
       LEFT JOIN book_genres bg ON b.id = bg.book_id
       GROUP BY b.id
       ORDER BY b.sales_count DESC, b.rating DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      data: {
        books: result.rows
      }
    });
  } catch (error) {
    console.error('Get bestsellers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bestsellers'
    });
  }
};

// @desc    Get new launches
// @route   GET /api/books/new-launches
// @access  Public
const getNewLaunches = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const result = await query(
      `SELECT b.*, 
        ARRAY_AGG(DISTINCT bg.genre) as genres
       FROM books b
       LEFT JOIN book_genres bg ON b.id = bg.book_id
       GROUP BY b.id
       ORDER BY b.created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      data: {
        books: result.rows
      }
    });
  } catch (error) {
    console.error('Get new launches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching new launches'
    });
  }
};

// @desc    Get related books
// @route   GET /api/books/:id/related
// @access  Public
const getRelatedBooks = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    // Get genres of the current book
    const bookGenres = await query(
      'SELECT genre FROM book_genres WHERE book_id = $1',
      [id]
    );

    if (bookGenres.rows.length === 0) {
      return res.json({
        success: true,
        data: { books: [] }
      });
    }

    const genres = bookGenres.rows.map(row => row.genre);

    // Find books with similar genres
    const result = await query(
      `SELECT DISTINCT b.*, 
        ARRAY_AGG(DISTINCT bg.genre) as genres
       FROM books b
       LEFT JOIN book_genres bg ON b.id = bg.book_id
       WHERE b.id != $1 
       AND bg.genre = ANY($2)
       GROUP BY b.id
       ORDER BY b.rating DESC
       LIMIT $3`,
      [id, genres, limit]
    );

    res.json({
      success: true,
      data: {
        books: result.rows
      }
    });
  } catch (error) {
    console.error('Get related books error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching related books'
    });
  }
};

module.exports = {
  getBooks,
  getBookById,
  getRecommendedBooks,
  getBestsellers,
  getNewLaunches,
  getRelatedBooks
};

// Made with Bob