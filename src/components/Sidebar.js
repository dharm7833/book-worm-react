import React from 'react';
import './Sidebar.css';

function Sidebar({ isOpen }) {
  const genres = [
    'All',
    'Romance',
    'Mystery',
    'Science Fiction',
    'Fantasy',
    'Historical',
    'Biography',
    'Self-help',
    'Memoir',
    'Travel',
    'Cooking',
    "Children's",
    'Young Adult',
    'Comics & Graphic Novels',
    'Poetry',
    'Drama',
    'Science',
    'Philosophy',
    'Religion',
    'Language Learning'
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        {genres.map((genre, index) => (
          <div
            key={index}
            className={`genre-item ${index === 0 ? 'active' : ''}`}
          >
            {genre}
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;

// Made with Bob
