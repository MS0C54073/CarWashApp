import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import './Payment.css';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [transactionId, setTransactionId] = useState('');

  const { data: booking } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data.data;
    },
    enabled: !!bookingId,
  });

  const { data: payment } = useQuery({
    queryKey: ['payment', bookingId],
    queryFn: async () => {
      const response = await api.get(`/payments/booking/${bookingId}`);
      return response.data.data;
    },
    enabled: !!bookingId,
  });

  const initiatePaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/payments/initiate', data);
      return response.data;
    },
    onSuccess: () => {
      navigate('/client');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return;

    initiatePaymentMutation.mutate({
      bookingId,
      method: paymentMethod,
      transactionId: transactionId || undefined,
    });
  };

  if (!booking) {
    return (
      <div className="payment-loading">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const paymentMethods = [
    { value: 'cash', label: 'Cash Payment', icon: '💵', description: 'Pay with cash on delivery' },
    { value: 'card', label: 'Card Payment', icon: '💳', description: 'Credit or debit card' },
    { value: 'mobile_money', label: 'Mobile Money', icon: '📱', description: 'MTN, Airtel, or other mobile money' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦', description: 'Direct bank transfer' },
  ];

  return (
    <div className="payment-page">
      <header className="payment-header">
        <button className="back-button" onClick={() => navigate('/client')}>
          ← Back
        </button>
        <div className="header-content">
          <h1>Complete Payment</h1>
          <p className="header-subtitle">Secure payment for your booking</p>
        </div>
      </header>

      <div className="payment-content">
        <div className="booking-summary-card">
          <h2 className="summary-title">Booking Summary</h2>
          <div className="summary-details">
            <div className="summary-row">
              <span className="summary-label">Car Wash:</span>
              <span className="summary-value">
                {booking.carWashId?.carWashName || booking.carWashId?.name}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Service:</span>
              <span className="summary-value">{booking.serviceId?.name}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Vehicle:</span>
              <span className="summary-value">
                {booking.vehicleId?.make} {booking.vehicleId?.model} - {booking.vehicleId?.plateNo}
              </span>
            </div>
            <div className="summary-row total">
              <span className="summary-label">Total Amount:</span>
              <span className="summary-value amount">
                K{parseFloat(booking.totalAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          <h3 className="form-title">Select Payment Method</h3>
          
          <div className="payment-methods">
            {paymentMethods.map((method) => (
              <label
                key={method.value}
                className={`payment-method-option ${
                  paymentMethod === method.value ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="method-radio"
                />
                <div className="method-icon">{method.icon}</div>
                <div className="method-content">
                  <div className="method-label">{method.label}</div>
                  <div className="method-description">{method.description}</div>
                </div>
                <div className="method-check">✓</div>
              </label>
            ))}
          </div>

          {paymentMethod !== 'cash' && (
            <div className="form-group">
              <label className="form-label">
                Transaction ID <span className="required">*</span>
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter your transaction reference number"
                className="form-input"
                required={paymentMethod !== 'cash'}
              />
              <p className="form-hint">
                Please enter the transaction ID from your payment confirmation
              </p>
            </div>
          )}

          {paymentMethod === 'cash' && (
            <div className="payment-info">
              <div className="info-icon">ℹ️</div>
              <div className="info-content">
                <strong>Cash Payment</strong>
                <p>You'll pay the driver in cash when your vehicle is delivered.</p>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-lg pay-btn"
              disabled={initiatePaymentMutation.isPending || (paymentMethod !== 'cash' && !transactionId)}
            >
              {initiatePaymentMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <span>Complete Payment</span>
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
            {paymentMethod !== 'cash' && !transactionId && (
              <p className="form-error">Please enter a transaction ID to continue</p>
            )}
          </div>
        </form>

        {payment && payment.status === 'completed' && (
          <div className="payment-success">
            <div className="success-icon">✓</div>
            <h3>Payment Successful!</h3>
            <p>Your payment has been processed successfully.</p>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/client')}
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
