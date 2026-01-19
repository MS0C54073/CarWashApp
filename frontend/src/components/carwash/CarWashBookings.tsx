import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useBookings } from '../../hooks/useBookings';
import LoadingSpinner from '../LoadingSpinner';
import QueueManagement from './QueueManagement';
import BookingCard from '../booking/BookingCard';
import { useToast } from '../ToastContainer';

const CarWashBookings = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<'bookings' | 'queue'>('bookings');

  // Use centralized bookings hook
  const { data: bookings, isLoading } = useBookings({
    filters: { role: 'carwash' },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      return api.put(`/bookings/${bookingId}/status`, { status });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['carwash-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['carwash-bookings'] });
      showToast(`Status updated to ${variables.status.replace(/_/g, ' ')}`, 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to update status', 'error');
    },
  });

  const handleStatusUpdate = (bookingId: string, status: string) => {
    updateStatusMutation.mutate({ bookingId, status });
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow: Record<string, string> = {
      'at_wash': 'waiting_bay',
      'waiting_bay': 'washing_bay',
      'washing_bay': 'drying_bay',
      'drying_bay': 'wash_completed',
    };
    return statusFlow[currentStatus];
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="carwash-bookings">
      <div className="bookings-header">
        <h1>Bookings & Queue</h1>
        <div className="view-toggle">
          <button
            className={viewMode === 'bookings' ? 'active' : ''}
            onClick={() => setViewMode('bookings')}
          >
            📋 Bookings
          </button>
          <button
            className={viewMode === 'queue' ? 'active' : ''}
            onClick={() => setViewMode('queue')}
          >
            🚗 Queue
          </button>
        </div>
      </div>

      {viewMode === 'queue' ? (
        <QueueManagement />
      ) : (
        <div className="bookings-view">
          {isLoading ? (
            <div className="loading-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="bookings-list">
              {bookings.map((booking: any) => (
                <BookingCard
                  key={booking.id || booking._id}
                  booking={booking}
                  onStatusUpdate={() => {
                    queryClient.invalidateQueries({ queryKey: ['bookings'] });
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No bookings found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CarWashBookings;
