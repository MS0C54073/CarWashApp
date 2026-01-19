import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';
import ConfirmDialog from '../ConfirmDialog';
import './Compliance.css';

interface RetentionPolicy {
  id: string;
  entityType: string;
  retentionDays: number;
  autoDelete: boolean;
  description?: string;
}

interface UserDataSummary {
  user: any;
  dataCounts: {
    bookings: number;
    vehicles: number;
  };
  consents: any[];
  anonymizations: any[];
}

const Compliance = () => {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState<'policies' | 'user-data'>('policies');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const queryClient = useQueryClient();

  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ['admin-retention-policies'],
    queryFn: async () => {
      const response = await api.get('/admin/compliance/retention-policies');
      return response.data.data;
    },
  });

  const { data: userData, isLoading: userDataLoading } = useQuery({
    queryKey: ['admin-user-data', selectedUser],
    queryFn: async () => {
      if (!selectedUser) return null;
      const response = await api.get(`/admin/compliance/user-data/${selectedUser}`);
      return response.data.data;
    },
    enabled: !!selectedUser,
  });

  const updatePolicyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return api.put(`/admin/compliance/retention-policies/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-retention-policies'] });
      setConfirmDialog({ ...confirmDialog, open: false });
    },
  });

  const anonymizeMutation = useMutation({
    mutationFn: async ({ userId, reason, fields }: { userId: string; reason: string; fields: string[] }) => {
      return api.post(`/admin/compliance/anonymize/${userId}`, { reason, fields });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-data'] });
      setConfirmDialog({ ...confirmDialog, open: false });
    },
  });

  const handleAnonymize = (userId: string, fields: string[]) => {
    setConfirmDialog({
      open: true,
      title: 'Anonymize User Data',
      message: `This will permanently anonymize the following fields: ${fields.join(', ')}. This action cannot be undone.`,
      variant: 'danger',
      onConfirm: () => {
        anonymizeMutation.mutate({
          userId,
          reason: 'GDPR compliance request',
          fields,
        });
      },
    });
  };

  if (policiesLoading || (activeTab === 'user-data' && userDataLoading)) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="compliance">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Compliance & Data Governance</h2>
          <p className="card-subtitle">Manage data retention, privacy, and user data</p>
        </div>

        <div className="compliance-tabs">
          <button
            className={`tab-button ${activeTab === 'policies' ? 'active' : ''}`}
            onClick={() => setActiveTab('policies')}
          >
            Data Retention Policies
          </button>
          <button
            className={`tab-button ${activeTab === 'user-data' ? 'active' : ''}`}
            onClick={() => setActiveTab('user-data')}
          >
            User Data Review
          </button>
        </div>

        {activeTab === 'policies' && (
          <div className="policies-section">
            <div className="section-header">
              <h3>Data Retention Policies</h3>
              <p className="section-description">
                Configure how long different types of data are retained in the system
              </p>
            </div>

            {policies && policies.length > 0 ? (
              <div className="policies-list">
                {policies.map((policy: RetentionPolicy) => (
                  <div key={policy.id} className="policy-card">
                    <div className="policy-header">
                      <h4 className="policy-entity">{policy.entityType}</h4>
                      <span className={`auto-delete-badge ${policy.autoDelete ? 'enabled' : 'disabled'}`}>
                        {policy.autoDelete ? 'Auto-Delete' : 'Manual'}
                      </span>
                    </div>
                    {policy.description && (
                      <p className="policy-description">{policy.description}</p>
                    )}
                    <div className="policy-details">
                      <div className="policy-detail">
                        <span className="detail-label">Retention Period:</span>
                        <span className="detail-value">{policy.retentionDays} days</span>
                      </div>
                      <div className="policy-detail">
                        <span className="detail-label">Auto Delete:</span>
                        <span className="detail-value">{policy.autoDelete ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No retention policies configured</div>
            )}
          </div>
        )}

        {activeTab === 'user-data' && (
          <div className="user-data-section">
            <div className="section-header">
              <h3>User Data Review</h3>
              <p className="section-description">
                Review and manage user data for compliance purposes
              </p>
            </div>

            <div className="user-search">
              <input
                type="text"
                placeholder="Enter user ID or email..."
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="search-input"
              />
              <button
                className="btn btn-primary"
                onClick={() => {
                  // Trigger query
                }}
              >
                Search
              </button>
            </div>

            {userData && (
              <div className="user-data-summary">
                <div className="data-section">
                  <h4>User Information</h4>
                  <div className="data-grid">
                    <div className="data-item">
                      <span className="data-label">Name:</span>
                      <span className="data-value">{userData.user?.name || 'N/A'}</span>
                    </div>
                    <div className="data-item">
                      <span className="data-label">Email:</span>
                      <span className="data-value">{userData.user?.email || 'N/A'}</span>
                    </div>
                    <div className="data-item">
                      <span className="data-label">Phone:</span>
                      <span className="data-value">{userData.user?.phone || 'N/A'}</span>
                    </div>
                    <div className="data-item">
                      <span className="data-label">Role:</span>
                      <span className="data-value">{userData.user?.role || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="data-section">
                  <h4>Data Counts</h4>
                  <div className="data-grid">
                    <div className="data-item">
                      <span className="data-label">Bookings:</span>
                      <span className="data-value">{userData.dataCounts?.bookings || 0}</span>
                    </div>
                    <div className="data-item">
                      <span className="data-label">Vehicles:</span>
                      <span className="data-value">{userData.dataCounts?.vehicles || 0}</span>
                    </div>
                  </div>
                </div>

                {userData.anonymizations && userData.anonymizations.length > 0 && (
                  <div className="data-section">
                    <h4>Anonymization History</h4>
                    <div className="anonymization-list">
                      {userData.anonymizations.map((anon: any, index: number) => (
                        <div key={index} className="anonymization-item">
                          <div className="anon-reason">{anon.reason}</div>
                          <div className="anon-fields">Fields: {anon.anonymizedFields?.join(', ')}</div>
                          <div className="anon-date">
                            {new Date(anon.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="data-actions">
                  <h4>Data Actions</h4>
                  <div className="action-buttons">
                    <button
                      className="btn btn-warning"
                      onClick={() => handleAnonymize(selectedUser, ['email', 'name', 'phone'])}
                    >
                      Anonymize Personal Data
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        setConfirmDialog({
                          open: true,
                          title: 'Delete User Data',
                          message: 'This will permanently delete all user data. This action cannot be undone.',
                          variant: 'danger',
                          onConfirm: () => {
                            // Implement delete
                          },
                        });
                      }}
                    >
                      Delete All Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
        variant={confirmDialog.variant}
      />
    </div>
  );
};

export default Compliance;
