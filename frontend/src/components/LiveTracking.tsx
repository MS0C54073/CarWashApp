import { useEffect, useState, useRef } from 'react';
import { useBooking } from '../hooks/useBookings';
import { watchPosition, clearWatch, Coordinates } from '../services/locationService';
import { parseCoordinates, calculateRouteSegment, formatDistance, formatTime } from '../services/mappingService';
import MapView from './MapView';
import LoadingSpinner from './LoadingSpinner';
import './LiveTracking.css';

interface Booking {
  id: string;
  status: string;
  pickupLocation: string;
  pickupCoordinates?: Coordinates;
  carWashId?: {
    name?: string;
    carWashName?: string;
    location?: string;
  };
  vehicleId?: {
    make?: string;
    model?: string;
    plateNo?: string;
  };
  driverId?: {
    name?: string;
    phone?: string;
  };
}

interface LiveTrackingProps {
  bookingId: string;
  onClose?: () => void;
}

const LiveTracking = ({ bookingId, onClose }: LiveTrackingProps) => {
  const [driverLocation, setDriverLocation] = useState<Coordinates | null>(null);
  const watchIdRef = useRef<number>(-1);
  const [isTracking, setIsTracking] = useState(false);

  // Use centralized booking hook with automatic refetching
  const { data: booking, isLoading } = useBooking(bookingId, {
    refetchInterval: 5000, // Poll every 5 seconds for status updates
  });

  // Start tracking driver location if booking is active
  useEffect(() => {
    if (!booking || !isTracking) return;

    const shouldTrack = ['accepted', 'picked_up', 'at_wash', 'delivered'].includes(booking.status);

    if (shouldTrack && watchIdRef.current === -1) {
      const watchId = watchPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Location tracking error:', error);
        }
      );
      watchIdRef.current = watchId;
    }

    return () => {
      if (watchIdRef.current >= 0) {
        clearWatch(watchIdRef.current);
        watchIdRef.current = -1;
      }
    };
  }, [booking, isTracking]);

  // Auto-start tracking for active bookings
  useEffect(() => {
    if (booking && ['accepted', 'picked_up', 'at_wash'].includes(booking.status)) {
      setIsTracking(true);
    }
  }, [booking]);

  if (isLoading) {
    return (
      <div className="live-tracking-container">
        <div className="live-tracking-loading">
          <LoadingSpinner size="lg" />
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="live-tracking-container">
        <div className="live-tracking-error">
          <p>Booking not found</p>
          {onClose && (
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(booking.status);

  return (
    <div className="live-tracking-container">
      <div className="live-tracking-header">
        <div className="live-tracking-title">
          <h2>Live Tracking</h2>
          <span className={`status-badge status-${booking.status}`}>
            {statusInfo.label}
          </span>
        </div>
        {onClose && (
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        )}
      </div>

      <div className="live-tracking-status">
        <div className="status-timeline">
          {getStatusSteps(booking.status).map((step, index) => (
            <div
              key={step.status}
              className={`status-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}
            >
              <div className="status-step-icon">{step.icon}</div>
              <div className="status-step-label">{step.label}</div>
            </div>
          ))}
        </div>
      </div>

      {driverLocation && (
        <div className="location-info">
          <div className="info-card">
            <div className="info-item">
              <span className="info-label">Driver Location</span>
              <span className="info-value">
                📍 {driverLocation.lat.toFixed(6)}, {driverLocation.lng.toFixed(6)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="live-tracking-info">
        <div className="info-card">
          <div className="info-item">
            <span className="info-label">Pickup Location</span>
            <span className="info-value">{booking.pickupLocation}</span>
          </div>
          {booking.driverId && (
            <div className="info-item">
              <span className="info-label">Driver</span>
              <span className="info-value">{booking.driverId.name}</span>
            </div>
          )}
          {booking.vehicleId && (
            <div className="info-item">
              <span className="info-label">Vehicle</span>
              <span className="info-value">
                {booking.vehicleId.make} {booking.vehicleId.model} ({booking.vehicleId.plateNo})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getStatusInfo = (status: string) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'warning' },
    accepted: { label: 'Accepted', color: 'info' },
    picked_up: { label: 'Picked Up', color: 'primary' },
    at_wash: { label: 'At Car Wash', color: 'primary' },
    waiting_bay: { label: 'Waiting', color: 'info' },
    washing_bay: { label: 'Washing', color: 'info' },
    drying_bay: { label: 'Drying', color: 'info' },
    wash_completed: { label: 'Wash Complete', color: 'success' },
    delivered: { label: 'Delivered', color: 'success' },
    completed: { label: 'Completed', color: 'success' },
    cancelled: { label: 'Cancelled', color: 'error' },
  };

  return statusMap[status] || { label: status, color: 'secondary' };
};

const getStatusSteps = (currentStatus: string) => {
  const steps = [
    { status: 'pending', label: 'Pending', icon: '⏳', completed: false, active: false },
    { status: 'accepted', label: 'Accepted', icon: '✅', completed: false, active: false },
    { status: 'picked_up', label: 'Picked Up', icon: '🚗', completed: false, active: false },
    { status: 'at_wash', label: 'At Wash', icon: '🧼', completed: false, active: false },
    { status: 'wash_completed', label: 'Wash Complete', icon: '✨', completed: false, active: false },
    { status: 'delivered', label: 'Delivered', icon: '🏁', completed: false, active: false },
  ];

  const statusOrder = ['pending', 'accepted', 'picked_up', 'at_wash', 'wash_completed', 'delivered'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  return steps.map((step, index) => {
    const stepIndex = statusOrder.indexOf(step.status);
    return {
      ...step,
      completed: stepIndex < currentIndex,
      active: stepIndex === currentIndex,
    };
  });
};

export default LiveTracking;
