import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Payment.css';
import { ordersAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const totalAmount = location.state?.totalAmount || 580;
  const shippingAddress = location.state?.shippingAddress || {};

  const [selectedMethod, setSelectedMethod] = useState('credit');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    cvv: '',
    expiryDate: ''
  });
  const [paymentNotice, setPaymentNotice] = useState({ type: '', message: '' });
  const [processing, setProcessing] = useState(false);

  const showPaymentNotice = (type, message) => {
    setPaymentNotice({ type, message });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setCardDetails({ ...cardDetails, [name]: formatted });
    } 
    // Format expiry date as MM/YYYY
    else if (name === 'expiryDate') {
      let formatted = value.replace(/\D/g, '');
      if (formatted.length >= 2) {
        formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 6);
      }
      setCardDetails({ ...cardDetails, [name]: formatted });
    }
    // Limit CVV to 3 digits
    else if (name === 'cvv') {
      const formatted = value.replace(/\D/g, '').slice(0, 3);
      setCardDetails({ ...cardDetails, [name]: formatted });
    }
    else {
      setCardDetails({ ...cardDetails, [name]: value });
    }
  };

  const handlePayment = async () => {
    if (!isAuthenticated) {
      showPaymentNotice('error', 'Please login to complete the purchase.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.cvv || !cardDetails.expiryDate) {
      showPaymentNotice('error', 'Please fill in all payment details.');
      return;
    }

    const paymentMethod = selectedMethod === 'credit'
      ? 'credit_card'
      : selectedMethod === 'debit'
        ? 'debit_card'
        : selectedMethod === 'upi'
          ? 'upi'
          : 'wallet';

    try {
      setProcessing(true);

      // Create order with backend API
      const orderData = {
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        paymentDetails: {
          card_last_four: cardDetails.cardNumber.slice(-4),
          card_name: cardDetails.cardName
        }
      };

      const response = await ordersAPI.createOrder(orderData);

      if (response.success) {
        // Update payment status
        await ordersAPI.updatePaymentStatus(response.data.order.id, {
          paymentStatus: 'completed',
          transactionId: `TXN${Date.now()}`
        });

        // Clear cart after successful order
        await clearCart();

        showPaymentNotice(
          'success',
          `Payment of ₹${totalAmount} processed successfully via ${paymentMethod.replace('_', ' ')} ending in ${cardDetails.cardNumber.slice(-4)}. Thank you for your purchase!`
        );
        
        // Give users enough time to read the confirmation message.
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        showPaymentNotice('error', response.message || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      showPaymentNotice('error', error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-background">
        <div className="book-decoration book-1">📕</div>
        <div className="book-decoration book-2">📗</div>
        <div className="book-decoration book-3">📘</div>
        <div className="book-decoration book-4">📙</div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
        <div className="wave-decoration wave-1"></div>
        <div className="wave-decoration wave-2"></div>
      </div>

      <div className="payment-container">
        <div className="payment-card">
          <div className="payment-header">
            <h2 className="payment-title">Complete Payment</h2>
            <div className="payable-amount">
              <span className="amount-label">Payable Amount:</span>
              <span className="amount-value">₹{totalAmount}</span>
            </div>
          </div>

          <div className="payment-content">
            {paymentNotice.message && (
              <div className={`payment-notice ${paymentNotice.type}`}>
                {paymentNotice.message}
              </div>
            )}

            <div className="payment-methods">
              <button
                className={`payment-method-btn ${selectedMethod === 'credit' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('credit')}
              >
                Credit Card
              </button>
              <button
                className={`payment-method-btn ${selectedMethod === 'debit' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('debit')}
              >
                Debit card
              </button>
              <button
                className={`payment-method-btn ${selectedMethod === 'upi' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('upi')}
              >
                UPI
              </button>
              <button
                className={`payment-method-btn ${selectedMethod === 'wallet' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('wallet')}
              >
                Wallet
              </button>
            </div>

            <div className="payment-form">
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={cardDetails.cardNumber}
                  onChange={handleInputChange}
                  maxLength="19"
                />
              </div>

              <div className="form-group">
                <label>Name on Card</label>
                <input
                  type="text"
                  name="cardName"
                  placeholder="Name"
                  value={cardDetails.cardName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    placeholder="XXX"
                    value={cardDetails.cvv}
                    onChange={handleInputChange}
                    maxLength="3"
                  />
                </div>

                <div className="form-group">
                  <label>Date of Expiry</label>
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YYYY"
                    value={cardDetails.expiryDate}
                    onChange={handleInputChange}
                    maxLength="7"
                  />
                </div>
              </div>

              <button
                className="pay-now-button"
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Pay Now 💳'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;

// Made with Bob
