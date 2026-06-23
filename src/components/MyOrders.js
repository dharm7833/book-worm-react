import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyOrders.css';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function MyOrders() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ordersAPI.getOrders();
        
        if (response.success) {
          setOrders(response.data.orders || []);
        } else {
          setError('Failed to load orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      case 'refunded':
        return 'status-refunded';
      default:
        return '';
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'payment-completed';
      case 'pending':
        return 'payment-pending';
      case 'failed':
        return 'payment-failed';
      case 'refunded':
        return 'payment-refunded';
      default:
        return '';
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await ordersAPI.getOrderById(orderId);
      if (response.success) {
        setSelectedOrder(response.data.order);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="my-orders">
        <div className="orders-container">
          <h1 className="orders-title">My Orders</h1>
          <div className="loading-message">Loading your orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-orders">
        <div className="orders-container">
          <h1 className="orders-title">My Orders</h1>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <div className="orders-container">
        <div className="orders-header">
          <h1 className="orders-title">My Orders</h1>
          <button className="btn-back" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h2>No Orders Yet</h2>
            <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
            <button className="btn-shop-now" onClick={() => navigate('/')}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3 className="order-id">Order #{order.id}</h3>
                    <p className="order-date">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="order-status-badges">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                    </span>
                    <span className={`payment-badge ${getPaymentStatusClass(order.payment_status)}`}>
                      Payment: {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="order-body">
                  <div className="order-items">
                    <h4>Items ({order.item_count || 0})</h4>
                    {order.items && order.items.length > 0 ? (
                      <div className="items-preview">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="item-preview">
                            <span className="item-title">{item.title || 'Book'}</span>
                            <span className="item-quantity">x{item.quantity}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="more-items">+{order.items.length - 3} more items</p>
                        )}
                      </div>
                    ) : (
                      <p className="no-items">No items information available</p>
                    )}
                  </div>

                  <div className="order-details">
                    <div className="detail-row">
                      <span className="detail-label">Subtotal:</span>
                      <span className="detail-value">₹{order.subtotal || 0}</span>
                    </div>
                    {order.tax_amount > 0 && (
                      <div className="detail-row">
                        <span className="detail-label">Tax:</span>
                        <span className="detail-value">₹{order.tax_amount}</span>
                      </div>
                    )}
                    {order.discount_amount > 0 && (
                      <div className="detail-row discount">
                        <span className="detail-label">Discount:</span>
                        <span className="detail-value">-₹{order.discount_amount}</span>
                      </div>
                    )}
                    <div className="detail-row total">
                      <span className="detail-label">Total:</span>
                      <span className="detail-value">₹{order.total_amount || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="order-footer">
                  <div className="shipping-info">
                    <span className="shipping-icon">📍</span>
                    <span className="shipping-text">
                      {order.shipping_address?.city || 'N/A'}, {order.shipping_address?.state || 'N/A'}
                    </span>
                  </div>
                  <button 
                    className="btn-view-details"
                    onClick={() => handleViewDetails(order.id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="btn-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Order Information</h3>
                <p><strong>Order ID:</strong> #{selectedOrder.id}</p>
                <p><strong>Date:</strong> {formatDate(selectedOrder.created_at)}</p>
                <p><strong>Status:</strong> <span className={getStatusClass(selectedOrder.status)}>{selectedOrder.status || 'Unknown'}</span></p>
                <p><strong>Payment Status:</strong> <span className={getPaymentStatusClass(selectedOrder.payment_status)}>{selectedOrder.payment_status || 'Unknown'}</span></p>
                <p><strong>Payment Method:</strong> {selectedOrder.payment_method}</p>
              </div>

              <div className="detail-section">
                <h3>Shipping Address</h3>
                <p>{selectedOrder.shipping_address?.first_name} {selectedOrder.shipping_address?.last_name}</p>
                <p>{selectedOrder.shipping_address?.address_line}</p>
                <p>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.pin_code}</p>
                <p>{selectedOrder.shipping_address?.country}</p>
                <p>Phone: {selectedOrder.shipping_address?.phone}</p>
                <p>Email: {selectedOrder.shipping_address?.email}</p>
              </div>

              <div className="detail-section">
                <h3>Order Items</h3>
                {selectedOrder.items && selectedOrder.items.map((item, index) => (
                  <div key={index} className="modal-item">
                    <div className="modal-item-info">
                      <p className="modal-item-title">{item.title}</p>
                      <p className="modal-item-quantity">Quantity: {item.quantity}</p>
                    </div>
                    <p className="modal-item-price">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="detail-section">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                {selectedOrder.tax_amount > 0 && (
                  <div className="summary-row">
                    <span>Tax:</span>
                    <span>₹{selectedOrder.tax_amount}</span>
                  </div>
                )}
                {selectedOrder.discount_amount > 0 && (
                  <div className="summary-row">
                    <span>Discount:</span>
                    <span>-₹{selectedOrder.discount_amount}</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₹{selectedOrder.total_amount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrders;

// Made with Bob