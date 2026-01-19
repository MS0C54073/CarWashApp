import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentPosition, Coordinates } from '../../services/locationService';
import api from '../../services/api';
import './RouteOptimizer.css';

interface RouteOptimizerProps {
  bookings: any[];
}

const RouteOptimizer = ({ bookings }: RouteOptimizerProps) => {
  const [optimizationMode, setOptimizationMode] = useState<'distance' | 'time' | 'priority'>('distance');
  const [driverLocation, setDriverLocation] = useState<Coordinates | null>(null);

  // Get driver's current location
  useEffect(() => {
    getCurrentPosition()
      .then((position) => {
        setDriverLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      })
      .catch((error) => {
        console.warn('Could not get driver location:', error);
        setDriverLocation({ lat: -15.3875, lng: 28.3228 }); // Default to Lusaka
      });
  }, []);

  // Filter active bookings that need pickup/delivery
  const activeBookings = useMemo(() => {
    return bookings.filter(
      (b: any) =>
        ['pending', 'accepted', 'picked_up', 'delivered_to_wash'].includes(b.status) &&
        b.bookingType === 'pickup_delivery' &&
        b.pickupCoordinates
    );
  }, [bookings]);

  // Simple route list (no optimization without mapping service)
  const routeList = useMemo(() => {
    return activeBookings.map((booking: any, index: number) => ({
      id: booking.id,
      order: index + 1,
      name: booking.pickupLocation || 'Pickup Location',
      carWashName: booking.carWashId?.carWashName || booking.carWashId?.name || 'Car Wash',
      vehicleInfo: booking.vehicleId
        ? `${booking.vehicleId.make} ${booking.vehicleId.model}`
        : 'Vehicle',
      status: booking.status,
    }));
  }, [activeBookings]);

  if (activeBookings.length === 0) {
    return (
      <div className="route-optimizer">
        <div className="route-empty">
          <p>No active bookings requiring routing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="route-optimizer">
      <div className="route-header">
        <h3>Route Optimization</h3>
        <div className="route-controls">
          <select
            value={optimizationMode}
            onChange={(e) => setOptimizationMode(e.target.value as any)}
            className="route-select"
          >
            <option value="distance">Optimize by Distance</option>
            <option value="time">Optimize by Time</option>
            <option value="priority">Optimize by Priority</option>
          </select>
        </div>
      </div>

      <div className="route-content">
        <div className="route-list">
          <div className="route-summary">
            <div className="summary-item">
              <span className="summary-label">Total Stops</span>
              <span className="summary-value">{routeList.length}</span>
            </div>
          </div>

          <div className="route-stops">
            {routeList.map((stop) => {
              const booking = activeBookings.find((b: any) => b.id === stop.id);
              return (
                <div key={stop.id} className="route-stop">
                  <div className="stop-number">{stop.order}</div>
                  <div className="stop-content">
                    <div className="stop-title">{stop.name}</div>
                    <div className="stop-details">
                      {booking && (
                        <>
                          <p><strong>Client:</strong> {booking.clientId?.name || 'N/A'}</p>
                          <p><strong>Vehicle:</strong> {stop.vehicleInfo}</p>
                          <p><strong>Car Wash:</strong> {stop.carWashName}</p>
                          <p><strong>Status:</strong> {stop.status}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteOptimizer;
