import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import MapView from '../MapView';
import { useBookings } from '../../hooks/useBookings';
import './CarWashHome.css';

const CarWashHome = () => {
  const { user } = useAuth();
  const [showMap, setShowMap] = useState(false);
  
  const { data, isLoading } = useQuery({
    queryKey: ['carwash-dashboard'],
    queryFn: async () => {
      const response = await api.get('/carwash/dashboard');
      return response.data.data;
    },
    staleTime: 15000, // Consider data fresh for 15 seconds
  });

  // Fetch bookings for map view
  const { data: bookings } = useBookings({
    filters: { role: 'carwash' },
    refetchInterval: 10000,
  });

  // Don't block - show skeleton while loading
  const isInitialLoad = isLoading && !data;

  return (
    <div className="carwash-home">
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p className="page-subtitle">Monitor your car wash operations and performance</p>
      </div>

      <div className="stats-grid">
        {isInitialLoad ? (
          // Show skeleton cards while loading
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="stat-card skeleton-stat-card">
              <div className="skeleton-stat-icon"></div>
              <div className="skeleton-stat-content">
                <div className="skeleton-stat-label"></div>
                <div className="skeleton-stat-value"></div>
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <h3>Total Bookings</h3>
              <div className="value">{data?.totalBookings || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <h3>Pending</h3>
              <div className="value">{data?.pendingBookings || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔄</div>
              <h3>In Progress</h3>
              <div className="value">{data?.inProgressBookings || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <h3>Completed</h3>
              <div className="value">{data?.completedBookings || 0}</div>
            </div>
            <div className="stat-card highlight">
              <div className="stat-icon">💰</div>
              <h3>Total Revenue</h3>
              <div className="value">K{data?.totalRevenue?.toLocaleString() || 0}</div>
            </div>
          </>
        )}
      </div>

      {/* Map View Toggle */}
      <div className="map-section">
        <div className="map-header">
          <h2>Operational Map</h2>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowMap(!showMap)}
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
        {showMap && (
          <div className="map-container">
            <MapView
              bookings={bookings || []}
              showCarWashes={true}
              showDrivers={true}
              height="500px"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CarWashHome;
