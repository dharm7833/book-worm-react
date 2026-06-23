import React, { createContext, useState, useContext, useEffect } from 'react';
import { cartAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart on mount if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCart();
    }
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      if (response.success) {
        setCartItems(response.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      // If not authenticated, use local cart
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      setCartItems(localCart);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // User is authenticated, use backend API
      try {
        const response = await cartAPI.addToCart(product.id, 1);
        if (response.success) {
          await fetchCart(); // Refresh cart from backend
          return { success: true };
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        return { success: false, error: error.message };
      }
    } else {
      // User not authenticated, use local storage
      setCartItems((prevItems) => {
        const existingItem = prevItems.find(item => item.id === product.id);
        let newItems;
        
        if (existingItem) {
          newItems = prevItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          newItems = [...prevItems, { ...product, quantity: 1 }];
        }
        
        localStorage.setItem('localCart', JSON.stringify(newItems));
        return newItems;
      });
      return { success: true };
    }
  };

  const removeFromCart = async (cartItemId) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const response = await cartAPI.removeFromCart(cartItemId);
        if (response.success) {
          await fetchCart();
          return { success: true };
        }
      } catch (error) {
        console.error('Error removing from cart:', error);
        return { success: false, error: error.message };
      }
    } else {
      setCartItems((prevItems) => {
        const newItems = prevItems.filter(item => item.id !== cartItemId);
        localStorage.setItem('localCart', JSON.stringify(newItems));
        return newItems;
      });
      return { success: true };
    }
  };

  const updateQuantity = async (cartItemId, change) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const item = cartItems.find(i => i.id === cartItemId);
        if (!item) return { success: false };
        
        const newQuantity = Math.max(1, item.quantity + change);
        const response = await cartAPI.updateCartItem(cartItemId, newQuantity);
        
        if (response.success) {
          await fetchCart();
          return { success: true };
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
        return { success: false, error: error.message };
      }
    } else {
      setCartItems((prevItems) => {
        const newItems = prevItems.map(item => {
          if (item.id === cartItemId) {
            const newQuantity = Math.max(1, item.quantity + change);
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
        localStorage.setItem('localCart', JSON.stringify(newItems));
        return newItems;
      });
      return { success: true };
    }
  };

  const clearCart = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const response = await cartAPI.clearCart();
        if (response.success) {
          setCartItems([]);
          return { success: true };
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
        return { success: false, error: error.message };
      }
    } else {
      setCartItems([]);
      localStorage.removeItem('localCart');
      return { success: true };
    }
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.book?.price || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Made with Bob
