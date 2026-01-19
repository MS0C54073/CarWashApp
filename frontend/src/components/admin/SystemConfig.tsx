import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';
import ConfirmDialog from '../ConfirmDialog';
import './SystemConfig.css';

interface SystemConfig {
  bookingRules: {
    maxAdvanceBookingDays: number;
    cancellationWindowHours: number;
    maxConcurrentBookings: number;
  };
  platformFees: {
    commissionRate: number;
    serviceFee: number;
  };
  availability: {
    operatingHoursStart: string;
    operatingHoursEnd: string;
    allowWeekendBookings: boolean;
  };
}

const SystemConfig = () => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [configData, setConfigData] = useState<Partial<SystemConfig>>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const queryClient = useQueryClient();

  // For now, we'll use default config values
  // In production, these would come from a backend config endpoint
  const defaultConfig: SystemConfig = {
    bookingRules: {
      maxAdvanceBookingDays: 30,
      cancellationWindowHours: 2,
      maxConcurrentBookings: 5,
    },
    platformFees: {
      commissionRate: 10,
      serviceFee: 5,
    },
    availability: {
      operatingHoursStart: '08:00',
      operatingHoursEnd: '18:00',
      allowWeekendBookings: true,
    },
  };

  const [config, setConfig] = useState<SystemConfig>(defaultConfig);

  const updateConfigMutation = useMutation({
    mutationFn: async (data: Partial<SystemConfig>) => {
      // In production, this would call an API endpoint
      // For now, we'll simulate it
      return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true, data }), 500);
      });
    },
    onSuccess: (_, variables) => {
      setConfig((prev) => ({ ...prev, ...variables }));
      setEditingSection(null);
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
    },
  });

  const handleSave = (section: string, data: any) => {
    setConfirmDialog({
      open: true,
      title: 'Confirm Configuration Change',
      message: `Are you sure you want to update ${section}? This change will affect all users.`,
      onConfirm: () => {
        updateConfigMutation.mutate({ [section]: data });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  return (
    <div className="system-config">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">System Configuration</h2>
          <p className="card-subtitle">
            Manage platform settings and rules. Changes affect all users.
          </p>
        </div>

        {/* Booking Rules */}
        <div className="config-section">
          <div className="config-section-header">
            <h3>Booking Rules</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() =>
                setEditingSection(editingSection === 'bookingRules' ? null : 'bookingRules')
              }
            >
              {editingSection === 'bookingRules' ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingSection === 'bookingRules' ? (
            <div className="config-edit-form">
              <div className="form-group">
                <label>
                  Max Advance Booking Days
                  <input
                    type="number"
                    value={configData.bookingRules?.maxAdvanceBookingDays ?? config.bookingRules.maxAdvanceBookingDays}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        bookingRules: {
                          ...config.bookingRules,
                          maxAdvanceBookingDays: parseInt(e.target.value),
                        },
                      })
                    }
                    min="1"
                    max="365"
                  />
                </label>
                <small>Maximum days in advance users can book</small>
              </div>

              <div className="form-group">
                <label>
                  Cancellation Window (Hours)
                  <input
                    type="number"
                    value={configData.bookingRules?.cancellationWindowHours ?? config.bookingRules.cancellationWindowHours}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        bookingRules: {
                          ...config.bookingRules,
                          cancellationWindowHours: parseInt(e.target.value),
                        },
                      })
                    }
                    min="0"
                    max="168"
                  />
                </label>
                <small>Hours before pickup when cancellation is allowed</small>
              </div>

              <div className="form-group">
                <label>
                  Max Concurrent Bookings
                  <input
                    type="number"
                    value={configData.bookingRules?.maxConcurrentBookings ?? config.bookingRules.maxConcurrentBookings}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        bookingRules: {
                          ...config.bookingRules,
                          maxConcurrentBookings: parseInt(e.target.value),
                        },
                      })
                    }
                    min="1"
                    max="20"
                  />
                </label>
                <small>Maximum active bookings per user</small>
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleSave('bookingRules', configData.bookingRules)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="config-display">
              <div className="config-item">
                <span className="config-label">Max Advance Booking Days</span>
                <span className="config-value">{config.bookingRules.maxAdvanceBookingDays}</span>
              </div>
              <div className="config-item">
                <span className="config-label">Cancellation Window</span>
                <span className="config-value">{config.bookingRules.cancellationWindowHours} hours</span>
              </div>
              <div className="config-item">
                <span className="config-label">Max Concurrent Bookings</span>
                <span className="config-value">{config.bookingRules.maxConcurrentBookings}</span>
              </div>
            </div>
          )}
        </div>

        {/* Platform Fees */}
        <div className="config-section">
          <div className="config-section-header">
            <h3>Platform Fees</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() =>
                setEditingSection(editingSection === 'platformFees' ? null : 'platformFees')
              }
            >
              {editingSection === 'platformFees' ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingSection === 'platformFees' ? (
            <div className="config-edit-form">
              <div className="form-group">
                <label>
                  Commission Rate (%)
                  <input
                    type="number"
                    value={configData.platformFees?.commissionRate ?? config.platformFees.commissionRate}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        platformFees: {
                          ...config.platformFees,
                          commissionRate: parseFloat(e.target.value),
                        },
                      })
                    }
                    min="0"
                    max="50"
                    step="0.1"
                  />
                </label>
                <small>Percentage commission on each booking</small>
              </div>

              <div className="form-group">
                <label>
                  Service Fee (K)
                  <input
                    type="number"
                    value={configData.platformFees?.serviceFee ?? config.platformFees.serviceFee}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        platformFees: {
                          ...config.platformFees,
                          serviceFee: parseFloat(e.target.value),
                        },
                      })
                    }
                    min="0"
                    step="0.01"
                  />
                </label>
                <small>Fixed service fee per booking</small>
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleSave('platformFees', configData.platformFees)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="config-display">
              <div className="config-item">
                <span className="config-label">Commission Rate</span>
                <span className="config-value">{config.platformFees.commissionRate}%</span>
              </div>
              <div className="config-item">
                <span className="config-label">Service Fee</span>
                <span className="config-value">K{config.platformFees.serviceFee.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Availability */}
        <div className="config-section">
          <div className="config-section-header">
            <h3>Service Availability</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() =>
                setEditingSection(editingSection === 'availability' ? null : 'availability')
              }
            >
              {editingSection === 'availability' ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingSection === 'availability' ? (
            <div className="config-edit-form">
              <div className="form-group">
                <label>
                  Operating Hours Start
                  <input
                    type="time"
                    value={configData.availability?.operatingHoursStart ?? config.availability.operatingHoursStart}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        availability: {
                          ...config.availability,
                          operatingHoursStart: e.target.value,
                        },
                      })
                    }
                  />
                </label>
              </div>

              <div className="form-group">
                <label>
                  Operating Hours End
                  <input
                    type="time"
                    value={configData.availability?.operatingHoursEnd ?? config.availability.operatingHoursEnd}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        availability: {
                          ...config.availability,
                          operatingHoursEnd: e.target.value,
                        },
                      })
                    }
                  />
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={configData.availability?.allowWeekendBookings ?? config.availability.allowWeekendBookings}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        availability: {
                          ...config.availability,
                          allowWeekendBookings: e.target.checked,
                        },
                      })
                    }
                  />
                  <span>Allow Weekend Bookings</span>
                </label>
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleSave('availability', configData.availability)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="config-display">
              <div className="config-item">
                <span className="config-label">Operating Hours</span>
                <span className="config-value">
                  {config.availability.operatingHoursStart} - {config.availability.operatingHoursEnd}
                </span>
              </div>
              <div className="config-item">
                <span className="config-label">Weekend Bookings</span>
                <span className="config-value">
                  {config.availability.allowWeekendBookings ? 'Allowed' : 'Not Allowed'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
        variant="warning"
      />
    </div>
  );
};

export default SystemConfig;
