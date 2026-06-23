import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ShoppingCart.css';
import { useCart } from '../context/CartContext';

function ShoppingCart() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, getCartTotal } = useCart();

  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount] = useState(100);
  const [cartNotice, setCartNotice] = useState({ type: '', message: '' });
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    addressLine: '',
    email: '',
    city: '',
    pin: '',
    phone: '',
    state: '',
    country: 'India'
  });

  const calculateSubtotal = () => {
    return getCartTotal();
  };

  const calculateTax = () => {
    return 62; // Fixed tax for demo
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - discount;
  };

  const showCartNotice = (type, message) => {
    setCartNotice({ type, message });
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      showCartNotice('success', `Coupon "${couponCode}" applied. Discount: ₹${discount}.`);
    } else {
      showCartNotice('error', 'Please enter a coupon code.');
    }
  };

  const handlePayNow = () => {
    if (!address.firstName || !address.email || !address.phone) {
      showCartNotice('error', 'Please fill in all required address fields.');
      return;
    }
    
    // Format shipping address for backend
    const shippingAddress = {
      first_name: address.firstName,
      last_name: address.lastName,
      address_line: address.addressLine,
      city: address.city,
      state: address.state,
      pin_code: address.pin,
      country: address.country,
      phone: address.phone,
      email: address.email
    };
    
    // Navigate to payment page with total amount and shipping address
    navigate('/payment', {
      state: {
        totalAmount: calculateTotal(),
        shippingAddress: shippingAddress
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });
  };

  return (
    <div className="shopping-cart">
      <div className="breadcrumb">
        <a href="/">Home</a> / <a href="#">Non-Fiction</a> / <a href="#">Self Help</a> / <a href="#">Joy of Minimalism</a> / <span className="active">Checkout</span>
      </div>

      <h1 className="cart-title">Shopping Cart</h1>

      <div className="cart-layout">
        <div className="cart-main">
          <div className="cart-items">
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty</p>
                <button onClick={() => navigate('/')}>Continue Shopping</button>
              </div>
            ) : (
              cartItems.map((item) => {
                const book = item.book || item;
                const coverColor = book.cover_color || item.coverColor || '#f5e6d3';
                const coverTitle = book.cover_title || item.coverTitle || book.title;
                const coverIcon = book.cover_icon || item.coverIcon || '📚';
                const author = book.author || item.author || 'Unknown';
                const title = book.title || item.title;
                const description = book.description || item.description || '';
                const format = book.format || item.format || 'Paperback';
                const genres = book.genres || item.genres || [];
                const price = book.price || item.price || 0;
                const delivery = book.delivery || item.delivery || 'TBD';
                const quantity = item.quantity || 1;

                return (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-cover" style={{ backgroundColor: coverColor }}>
                      <div className="cart-cover-content">
                        <h4 className="cart-cover-title">{coverTitle}</h4>
                        <div className="cart-cover-icon">{coverIcon}</div>
                        <p className="cart-cover-author">{author.toUpperCase()}</p>
                        <p className="cart-cover-tagline">{description.substring(0, 50)}...</p>
                      </div>
                    </div>
                    <div className="cart-item-info">
                      <h3 className="cart-item-title">{title}</h3>
                      <p className="cart-item-author">by <a href="#">{author}</a></p>
                      <p className="cart-item-description">{description}</p>
                      <div className="cart-item-meta">
                        <span className="cart-item-format">{format}</span>
                        <div className="cart-item-genres">
                          {genres.map((genre, index) => (
                            <a key={index} href="#" className="cart-genre-tag">{genre}</a>
                          ))}
                        </div>
                      </div>
                      <div className="cart-item-footer">
                        <span className="cart-item-price">₹{price}</span>
                        <span className="cart-item-delivery">Delivery by {delivery}</span>
                      </div>
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, -1)}>−</button>
                        <span>{quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="address-section">
            <h2 className="section-title">Address</h2>
            <div className="saved-address-checkbox">
              <input
                type="checkbox"
                id="useSavedAddress"
                checked={useSavedAddress}
                onChange={(e) => setUseSavedAddress(e.target.checked)}
              />
              <label htmlFor="useSavedAddress">Use Saved Address</label>
            </div>
            <div className="address-form">
              <div className="form-row">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={address.firstName}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={address.lastName}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="addressLine"
                  placeholder="Address Line 2"
                  value={address.addressLine}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <input
                  type="email"
                  name="email"
                  placeholder="e-mail"
                  value={address.email}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={address.city}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="pin"
                  placeholder="000000"
                  value={address.pin}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <div className="phone-input">
                  <span className="phone-prefix">+91</span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="1234567890"
                    value={address.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={address.state}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={address.country}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="cart-summary">
          <div className="summary-image">
            <div className="summary-illustration">
              📚
            </div>
          </div>
          <div className="summary-content">
            {cartNotice.message && (
              <div className={`cart-notice ${cartNotice.type}`}>
                {cartNotice.message}
              </div>
            )}

            <h2 className="summary-title">Grand Total</h2>
            <div className="summary-row">
              <span>Price ({cartItems.length} items)</span>
              <span>₹{calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>₹{calculateTax().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Charges</span>
              <span className="free">Free</span>
            </div>
            <div className="coupon-section">
              <input
                type="text"
                placeholder="Apply Coupon"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button onClick={handleApplyCoupon}>Apply</button>
            </div>
            <div className="summary-row">
              <span>Discount</span>
              <span className="discount-amount">₹{discount}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount</span>
              <span>₹{calculateTotal()}</span>
            </div>
            <button className="pay-now-btn" onClick={handlePayNow}>
              Pay Now 💳
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCart;

// Made with Bob
