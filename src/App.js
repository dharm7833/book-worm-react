import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import ProductDetail from './components/ProductDetail';
import ShoppingCart from './components/ShoppingCart';
import Payment from './components/Payment';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import MyOrders from './components/MyOrders';
import MyWishlist from './components/MyWishlist';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app">
            <Header toggleSidebar={toggleSidebar} />
            <Routes>
              <Route path="/" element={
                <div className="app-container">
                  <Sidebar isOpen={isSidebarOpen} />
                  <MainContent />
                </div>
              } />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<ShoppingCart />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/wishlist" element={<MyWishlist />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

// Made with Bob
