import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BookCard.css';

function BookCard({ book }) {
  const navigate = useNavigate();

  // Handle both frontend and backend data structures
  const coverColor = book.cover_color || book.coverColor || '#f5e6d3';
  const coverTitle = book.cover_title || book.coverTitle || book.title;
  const coverIcon = book.cover_icon || book.coverIcon || '📚';
  const author = book.author || 'Unknown Author';
  const title = book.title || 'Untitled';
  const description = book.description || '';
  const format = book.format || 'Paperback';
  const genres = book.genres || [];
  const price = book.price || 0;
  const delivery = book.delivery || 'TBD';

  const handleClick = () => {
    navigate(`/product/${book.id}`);
  };

  return (
    <div className="book-card" onClick={handleClick}>
      <div className="book-cover" style={{ backgroundColor: coverColor }}>
        <div className="book-cover-content">
          <h3 className="book-cover-title">{coverTitle}</h3>
          {coverIcon && <div className="book-cover-icon">{coverIcon}</div>}
          <p className="book-cover-author">{author}</p>
        </div>
      </div>
      <div className="book-info">
        <h4 className="book-title">{title}</h4>
        <p className="book-author">by {author}</p>
        <p className="book-description">{description}</p>
        <div className="book-meta">
          <span className="book-format">{format}</span>
          {genres.length > 0 && (
            <div className="book-genres">
              {genres.map((genre, index) => (
                <span key={index} className="genre-tag">{genre}</span>
              ))}
            </div>
          )}
        </div>
        <div className="book-footer">
          <span className="book-price">₹{price}</span>
          <span className="book-delivery">Delivery by {delivery}</span>
        </div>
      </div>
    </div>
  );
}

export default BookCard;

// Made with Bob
