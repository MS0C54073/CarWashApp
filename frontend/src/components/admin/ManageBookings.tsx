import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';
import EmptyState from '../EmptyState';
import ConfirmDialog from '../ConfirmDialog';
import DriverSelector from './DriverSelector';
import './ManageBookings.css';

const ManageBookings = () => {
  const [selectedDriver, setSelectedDriver] = useState<Record<string, string>>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const response = await api.get('/admin/bookings');
      return response.data.data;
    },
  });

  const { data: drivers } = useQuery({
    queryKey: ['available-drivers'],
    queryFn: async () => {
      const response = await api.get('/drivers/available');
      return response.data.data;
    },
  });

  const assignDriverMutation = useMutation({
    mutationFn: async ({ bookingId, driverId }: { bookingId: string; driverId: string }) => {
      return api.put(`/admin/bookings/${bookingId}/assign-driver`, { driverId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setConfirmDialog({ ...confirmDialog, open: false });
    },
  });

  const handleAssignDriver = (bookingId: string, driverId: string, driverName: string) => {
    setConfirmDialog({
      open: true,
      title: 'Assign Driver',
      message: `Assign ${driverName} to this booking?`,
      onConfirm: () => {
        assignDriverMutation.mutate({ bookingId, driverId });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="manage-bookings">
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="header-content">
            <h2 className="admin-card-title">Manage Bookings</h2>
            <p className="card-subtitle">View and manage all booking requests</p>
          </div>
        </div>

        {!bookings || bookings.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No bookings found"
            description="Bookings will appear here once clients create them"
          />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Vehicle</th>
                  <th>Car Wash</th>
                  <th>Service</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th className="actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking: any) => (
                  <tr key={booking.id || booking._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small">
                          {booking.clientId?.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <span>{booking.clientId?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      {booking.vehicleId?.make} {booking.vehicleId?.model} - {booking.vehicleId?.plateNo}
                    </td>
                    <td>{booking.carWashId?.carWashName || booking.carWashId?.name || 'N/A'}</td>
                    <td>{booking.serviceId?.name || 'N/A'}</td>
                    <td>
                      {booking.driverId?.name ? (
                        <span className="driver-assigned">{booking.driverId.name}</span>
                      ) : (
                        <span className="driver-unassigned">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="amount-cell">K{parseFloat(booking.totalAmount || 0).toFixed(2)}</td>
                    <td>
                      {!booking.driverId && (
                        <div className="assign-driver-controls">
                          <DriverSelector
                            drivers={drivers || []}
                            value={selectedDriver[booking.id || booking._id] || ''}
                            onChange={(driverId) => {
                              setSelectedDriver({
                                ...selectedDriver,
                                [booking.id || booking._id]: driverId,
                              });
                            }}
                            placeholder="Search driver..."
                          />
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              const driverId = selectedDriver[booking.id || booking._id];
                              const driver = drivers?.find(
                                (d: any) => (d.id || d._id) === driverId
                              );
                              if (driver && driverId) {
                                handleAssignDriver(
                                  booking.id || booking._id,
                                  driverId,
                                  driver.name
                                );
                              }
                            }}
                            disabled={!selectedDriver[booking.id || booking._id]}
                          >
                            Assign
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
        variant="info"
      />
    </div>
  );
};

export default ManageBookings;
