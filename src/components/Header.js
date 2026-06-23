import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Header({ toggleSidebar }) {
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={toggleSidebar}>
          <span className="menu-icon">☰</span>
        </button>
        <div className="logo" onClick={() => navigate('/')}>
          <span className="logo-icon">📚</span>
          <span className="logo-text">Book Worm</span>
        </div>
        <nav className="nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/orders'); }}>My Orders</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/wishlist'); }}>My Wishlist</a>
          <a href="#writers">My Writers</a>
        </nav>
      </div>
      <div className="header-right">
        <div className="cart-icon" onClick={() => navigate('/cart')}>
          🛒
          {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
        </div>
        <div className="user-menu-container">
          <div className="user-icon" onClick={toggleUserMenu}>
            👤
          </div>
          {showUserMenu && (
            <div className="user-dropdown">
              {isAuthenticated ? (
                <>
                  <div className="user-info">
                    <p className="user-name">{user?.name}</p>
                    <p className="user-email">{user?.email}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button onClick={() => { navigate('/orders'); setShowUserMenu(false); }} className="dropdown-item">
                    My Orders
                  </button>
                  <button onClick={() => { navigate('/wishlist'); setShowUserMenu(false); }} className="dropdown-item">
                    My Wishlist
                  </button>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { navigate('/login'); setShowUserMenu(false); }} className="dropdown-item">
                    Login
                  </button>
                  <button onClick={() => { navigate('/register'); setShowUserMenu(false); }} className="dropdown-item">
                    Register
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

// Made with Bob
