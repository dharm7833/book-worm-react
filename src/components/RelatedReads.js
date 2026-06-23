import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RelatedReads.css';
import { booksAPI } from '../services/api';

function RelatedReads({ bookId }) {
  const navigate = useNavigate();
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedBooks = async () => {
      if (!bookId) return;
      
      try {
        setLoading(true);
        const response = await booksAPI.getRelatedBooks(bookId);
        
        if (response.success) {
          setRelatedBooks(response.data.books || []);
        }
      } catch (error) {
        console.error('Error fetching related books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedBooks();
  }, [bookId]);

  const handleBookClick = (id) => {
    navigate(`/product/${id}`);
  };

  if (loading) {
    return (
      <aside className="related-reads">
        <h2 className="related-title">Related Reads</h2>
        <div className="loading-message">Loading related books...</div>
      </aside>
    );
  }

  if (relatedBooks.length === 0) {
    return (
      <aside className="related-reads">
        <h2 className="related-title">Related Reads</h2>
        <p>No related books available</p>
      </aside>
    );
  }

  return (
    <aside className="related-reads">
      <h2 className="related-title">Related Reads</h2>
      <div className="related-books">
        {relatedBooks.map((book) => {
          const coverColor = book.cover_color || book.coverColor || '#f5e6d3';
          const coverTitle = book.cover_title || book.coverTitle || book.title;
          const coverIcon = book.cover_icon || book.coverIcon || '📚';
          const author = book.author || 'Unknown';
          const genres = book.genres || [];
          
          return (
            <div
              key={book.id}
              className="related-book-card"
              onClick={() => handleBookClick(book.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="related-book-cover" style={{ backgroundColor: coverColor }}>
                <div className="related-cover-content">
                  <h4 className="related-cover-title">{coverTitle}</h4>
                  <div className="related-cover-icon">{coverIcon}</div>
                  <p className="related-cover-author">{author.toUpperCase()}</p>
                </div>
              </div>
              <div className="related-book-info">
                <h3 className="related-book-title">{book.title}</h3>
                <p className="related-book-author">by {author}</p>
                <p className="related-book-description">{book.description}</p>
                <div className="related-book-meta">
                  <span className="related-book-format">{book.format}</span>
                  <div className="related-book-genres">
                    {genres.map((genre, i) => (
                      <span key={i} className="related-genre-tag">{genre}</span>
                    ))}
                  </div>
                </div>
                <div className="related-book-footer">
                  <span className="related-book-price">₹{book.price}</span>
                  <span className="related-book-delivery">Delivery by {book.delivery || 'TBD'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export default RelatedReads;

// Made with Bob
