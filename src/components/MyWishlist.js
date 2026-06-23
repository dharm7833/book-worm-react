import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyWishlist.css';
import { wishlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function MyWishlist() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState({ type: '', message: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchWishlist();
  }, [isAuthenticated, navigate]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await wishlistAPI.getWishlist();
      
      if (response.success) {
        setWishlistItems(response.data.items || []);
      } else {
        setError('Failed to load wishlist');
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load wishlist. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const showNotice = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice({ type: '', message: '' }), 3000);
  };

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      const response = await wishlistAPI.removeFromWishlist(itemId);
      if (response.success) {
        setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
        showNotice('success', 'Item removed from wishlist');
      } else {
        showNotice('error', 'Failed to remove item');
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      showNotice('error', 'Failed to remove item. Please try again.');
    }
  };

  const handleAddToCart = async (item) => {
    try {
      const book = {
        id: item.book_id,
        title: item.title,
        author: item.author,
        description: item.description,
        price: item.price,
        cover_color: item.cover_color,
        cover_title: item.cover_title,
        cover_icon: item.cover_icon,
        format: item.format,
        genres: item.genres,
        delivery: item.delivery_info
      };
      
      const result = await addToCart(book);
      if (result && result.success !== false) {
        showNotice('success', 'Item added to cart!');
      } else {
        showNotice('error', result?.error || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      showNotice('error', 'Failed to add to cart. Please try again.');
    }
  };

  const handleViewDetails = (bookId) => {
    navigate(`/product/${bookId}`);
  };

  if (loading) {
    return (
      <div className="my-wishlist">
        <div className="wishlist-container">
          <h1 className="wishlist-title">My Wishlist</h1>
          <div className="loading-message">Loading your wishlist...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-wishlist">
        <div className="wishlist-container">
          <h1 className="wishlist-title">My Wishlist</h1>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-wishlist">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1 className="wishlist-title">My Wishlist</h1>
          <button className="btn-back" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>

        {notice.message && (
          <div className={`wishlist-notice ${notice.type}`}>
            {notice.message}
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-icon">💝</div>
            <h2>Your Wishlist is Empty</h2>
            <p>Save your favorite books here to buy them later!</p>
            <button className="btn-browse" onClick={() => navigate('/')}>
              Browse Books
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => (
              <div key={item.id} className="wishlist-card">
                <button 
                  className="btn-remove"
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  title="Remove from wishlist"
                >
                  ×
                </button>
                
                <div 
                  className="wishlist-book-cover" 
                  style={{ backgroundColor: item.cover_color || '#f5e6d3' }}
                  onClick={() => handleViewDetails(item.book_id)}
                >
                  <div className="wishlist-cover-content">
                    <h3 className="wishlist-cover-title">
                      {item.cover_title || item.title}
                    </h3>
                    <div className="wishlist-cover-icon">
                      {item.cover_icon || '📚'}
                    </div>
                    <p className="wishlist-cover-author">
                      {item.author?.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="wishlist-book-info">
                  <h3 
                    className="wishlist-book-title"
                    onClick={() => handleViewDetails(item.book_id)}
                  >
                    {item.title}
                  </h3>
                  <p className="wishlist-book-author">by {item.author}</p>
                  <p className="wishlist-book-description">
                    {item.description?.substring(0, 100)}
                    {item.description?.length > 100 ? '...' : ''}
                  </p>

                  <div className="wishlist-book-meta">
                    <span className="wishlist-format">{item.format}</span>
                    {item.genres && item.genres.length > 0 && (
                      <div className="wishlist-genres">
                        {item.genres.slice(0, 2).map((genre, index) => (
                          <span key={index} className="wishlist-genre-tag">
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="wishlist-book-footer">
                    <div className="wishlist-price-section">
                      <span className="wishlist-price">₹{item.price}</span>
                      {item.rating && (
                        <span className="wishlist-rating">
                          ⭐ {item.rating}
                        </span>
                      )}
                    </div>
                    <button 
                      className="btn-add-to-cart"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart 🛒
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyWishlist;

// Made with Bob