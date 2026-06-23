import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetail.css';
import RelatedReads from './RelatedReads';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { booksAPI, reviewsAPI, wishlistAPI } from '../services/api';

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [productNotice, setProductNotice] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [bookRes, reviewsRes] = await Promise.all([
          booksAPI.getBookById(id),
          reviewsAPI.getBookReviews(id)
        ]);

        if (bookRes.success) {
          setProduct(bookRes.data.book);
        } else {
          setError('Book not found');
        }

        if (reviewsRes.success) {
          setReviews(reviewsRes.data.reviews || []);
        }
      } catch (err) {
        console.error('Error fetching product data:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  const handleStarClick = (value) => {
    setRating(value);
  };

  const showProductNotice = (type, message) => {
    setProductNotice({ type, message });
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      showProductNotice('error', 'Please login to submit a review.');
      return;
    }

    if (rating > 0 && reviewText.trim()) {
      try {
        const response = await reviewsAPI.createReview({
          bookId: id,
          rating,
          reviewText: reviewText
        });

        if (response.success) {
          setRating(0);
          setReviewText('');
          showProductNotice('success', 'Review submitted successfully!');
          
          // Refresh reviews
          const reviewsRes = await reviewsAPI.getBookReviews(id);
          if (reviewsRes.success) {
            setReviews(reviewsRes.data.reviews || []);
          }
        } else {
          showProductNotice('error', response.message || 'Failed to submit review.');
        }
      } catch (err) {
        console.error('Error submitting review:', err);
        showProductNotice('error', 'Failed to submit review. Please try again.');
      }
    } else {
      showProductNotice('error', 'Please provide a rating and review text.');
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = {
      id: product.id,
      title: product.title,
      author: product.author,
      description: product.description,
      price: product.price,
      coverColor: product.cover_color,
      coverTitle: product.cover_title,
      coverIcon: product.cover_icon,
      format: product.format,
      genres: product.genres,
      delivery: product.delivery
    };
    addToCart(cartItem);
    showProductNotice('success', 'Item added to cart successfully!');
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      showProductNotice('error', 'Please login to add items to wishlist.');
      return;
    }

    if (!product) return;

    try {
      const response = await wishlistAPI.addToWishlist(product.id);
      
      if (response.success) {
        showProductNotice('success', 'Item added to wishlist successfully!');
      } else {
        showProductNotice('error', response.message || 'Failed to add to wishlist.');
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      showProductNotice('error', 'Failed to add to wishlist. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="product-detail">
        <div className="loading-message">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail">
        <div className="error-message">{error || 'Product not found'}</div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="breadcrumb">
        {product.breadcrumb && product.breadcrumb.map((item, index) => (
          <span key={index}>
            {index > 0 && ' / '}
            <a href="#" className={index === product.breadcrumb.length - 1 ? 'active' : ''}>
              {item}
            </a>
          </span>
        ))}
      </div>

      <div className="product-layout">
        <div className="product-main">
          {productNotice.message && (
            <div className={`product-notice ${productNotice.type}`}>
              {productNotice.message}
            </div>
          )}

          <div className="product-header">
            <div className="product-covers">
              <div className="book-cover-large" style={{ backgroundColor: product.cover_color }}>
                <div className="book-cover-content">
                  <h3 className="book-cover-title">{product.cover_title || product.title}</h3>
                  <div className="book-cover-icon">{product.cover_icon || '📚'}</div>
                  <p className="book-cover-author">{product.author.toUpperCase()}</p>
                  <p className="book-cover-tagline">Simplify your life for greater clarity and happiness</p>
                </div>
              </div>
              <div className="book-cover-back" style={{ backgroundColor: product.cover_color }}>
                <div className="book-back-content">
                  <p className="book-back-quote">"{product.tagline || 'A great read'}"</p>
                  <p className="book-back-text">{product.description}</p>
                  <div className="book-back-description">
                    {(product.book_description || product.description).split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                  <div className="book-barcode">📊</div>
                </div>
              </div>
            </div>

            <div className="product-info">
              <h1 className="product-title">{product.title}</h1>
              <p className="product-author">by <a href="#">{product.author}</a></p>
              <p className="product-description">{product.description}</p>
              <p className="product-publisher">Published by: <a href="#">{product.publisher || 'Unknown'}</a></p>
              <p className="product-format">{product.format}</p>
              <div className="product-genres">
                {(product.genres || []).map((genre, index) => (
                  <a key={index} href="#" className="genre-link">{genre}</a>
                ))}
              </div>

              <div className="product-price-section">
                <span className="product-price">₹{product.price}</span>
                <span className="product-delivery">Delivery by {product.delivery}</span>
              </div>

              <div className="product-actions">
                <button className="btn-add-cart" onClick={handleAddToCart}>
                  Add to Cart 🛒
                </button>
                <button className="btn-add-wishlist" onClick={handleAddToWishlist}>
                  Add to Wishlist 🔖
                </button>
              </div>

              <div className="product-meta">
                <div className="meta-item">
                  <span className="meta-icon">🌐</span>
                  <div>
                    <div className="meta-label">Language</div>
                    <div className="meta-value">{product.language}</div>
                  </div>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">⭐</span>
                  <div>
                    <div className="meta-label">Rating</div>
                    <div className="meta-value">
                      {'★'.repeat(Math.floor(product.rating))}
                      {'☆'.repeat(5 - Math.floor(product.rating))}
                    </div>
                  </div>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">📈</span>
                  <div>
                    <div className="meta-label">Sells</div>
                    <div className="meta-value">{product.sales}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="about-writer">
            <h2 className="section-title">About the writer</h2>
            <div className="writer-content">
              <div className="writer-avatar">{product.author_image || '👤'}</div>
              <div className="writer-info">
                <h3 className="writer-name">{product.author}</h3>
                <p className="writer-bio">{product.author_bio || 'No biography available.'}</p>
              </div>
            </div>
          </div>

          <div className="reviews-section">
            <h2 className="section-title">Reviews</h2>
            <div className="review-form">
              <div className="form-header">
                <span>Leave Your Review</span>
                <span className="review-count">0/100</span>
              </div>
              <textarea
                className="review-textarea"
                placeholder="Placeholder text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                maxLength={100}
              />
              <div className="review-actions">
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <button className="btn-submit-review" onClick={handleSubmitReview}>
                  Submit →
                </button>
              </div>
            </div>

            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <h4 className="review-author">{review.user_name || 'Anonymous'}</h4>
                    <p className="review-text">{review.comment}</p>
                    <div className="review-rating">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                ))
              ) : (
                <p>No reviews yet. Be the first to review this book!</p>
              )}
            </div>
          </div>
        </div>

        <RelatedReads bookId={id} />
      </div>
    </div>
  );
}

export default ProductDetail;

// Made with Bob
