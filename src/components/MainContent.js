import React, { useState, useEffect } from 'react';
import './MainContent.css';
import BookCard from './BookCard';
import { booksAPI } from '../services/api';

function MainContent() {
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [newLaunches, setNewLaunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        const [recommendedRes, bestsellersRes, newLaunchesRes] = await Promise.all([
          booksAPI.getRecommendedBooks(),
          booksAPI.getBestsellers(),
          booksAPI.getNewLaunches()
        ]);

        if (recommendedRes.success) {
          setRecommendedBooks(recommendedRes.data.books || []);
        }
        if (bestsellersRes.success) {
          setBestsellers(bestsellersRes.data.books || []);
        }
        if (newLaunchesRes.success) {
          setNewLaunches(newLaunchesRes.data.books || []);
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <main className="main-content">
        <div className="loading-message">Loading books...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content">
        <div className="error-message">{error}</div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="search-filters">
        <div className="search-bar">
          <input type="text" placeholder="Search you want to read here" />
          <button className="search-btn">🔍</button>
        </div>
        <div className="filters">
          <select className="filter-select">
            <option>Language - All</option>
            <option>English</option>
            <option>Hindi</option>
            <option>Spanish</option>
          </select>
          <select className="filter-select">
            <option>Format (Paperback, eBook etc.)</option>
            <option>Paperback</option>
            <option>Hardcover</option>
            <option>eBook</option>
          </select>
          <select className="filter-select">
            <option>Price Range - All</option>
            <option>Under ₹200</option>
            <option>₹200 - ₹500</option>
            <option>Above ₹500</option>
          </select>
          <select className="filter-select">
            <option>Sort by - Relevance</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest First</option>
          </select>
        </div>
      </div>

      <section className="book-section">
        <h2 className="section-title">Recommended for You</h2>
        <div className="book-grid">
          {recommendedBooks.length > 0 ? (
            recommendedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))
          ) : (
            <p>No recommended books available</p>
          )}
        </div>
      </section>

      <section className="book-section">
        <h2 className="section-title">Bestsellers this Month</h2>
        <div className="book-grid">
          {bestsellers.length > 0 ? (
            bestsellers.map((book) => (
              <BookCard key={book.id} book={book} />
            ))
          ) : (
            <p>No bestsellers available</p>
          )}
        </div>
      </section>

      <section className="book-section">
        <h2 className="section-title">New Launches</h2>
        <div className="book-grid">
          {newLaunches.length > 0 ? (
            newLaunches.map((book) => (
              <BookCard key={book.id} book={book} />
            ))
          ) : (
            <p>No new launches available</p>
          )}
        </div>
      </section>
    </main>
  );
}

export default MainContent;

// Made with Bob
