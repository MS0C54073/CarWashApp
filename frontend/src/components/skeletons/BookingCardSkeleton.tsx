import React from 'react';
import './BookingCardSkeleton.css';

const BookingCardSkeleton: React.FC = () => {
  return (
    <div className="booking-card-skeleton">
      <div className="skeleton-booking-header">
        <div className="skeleton-booking-title"></div>
        <div className="skeleton-booking-status"></div>
      </div>
      <div className="skeleton-booking-details">
        <div className="skeleton-detail-line"></div>
        <div className="skeleton-detail-line short"></div>
        <div className="skeleton-detail-line"></div>
      </div>
      <div className="skeleton-booking-actions">
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
};

export default BookingCardSkeleton;
