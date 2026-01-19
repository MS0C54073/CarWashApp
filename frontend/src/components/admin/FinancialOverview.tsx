import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';
import './FinancialOverview.css';

const FinancialOverview = () => {
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const { data: financial, isLoading } = useQuery({
    queryKey: ['admin-financial', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      const response = await api.get(`/admin/financial?${params.toString()}`);
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="financial-overview">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Financial Overview</h2>
          <div className="date-range-selector">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="date-input"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="date-input"
            />
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="financial-section">
          <h3 className="section-title">Revenue Summary</h3>
          <div className="revenue-grid">
            <div className="revenue-card total">
              <div className="revenue-label">Total Revenue</div>
              <div className="revenue-value">
                K{(financial?.totalRevenue || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="revenue-card pending">
              <div className="revenue-label">Pending Revenue</div>
              <div className="revenue-value">
                K{(financial?.pendingRevenue || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="financial-section">
          <h3 className="section-title">Payment Status</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Paid</div>
              <div className="metric-value success">
                {financial?.paymentStatus?.paid || 0}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Pending</div>
              <div className="metric-value warning">
                {financial?.paymentStatus?.pending || 0}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Failed</div>
              <div className="metric-value error">
                {financial?.paymentStatus?.failed || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue by Car Wash */}
        {financial?.revenueByCarWash && financial.revenueByCarWash.length > 0 && (
          <div className="financial-section">
            <h3 className="section-title">Revenue by Car Wash Provider</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Car Wash</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {financial.revenueByCarWash
                    .sort((a: any, b: any) => b.revenue - a.revenue)
                    .map((item: any, index: number) => (
                      <tr key={index}>
                        <td>{item.carWashName || 'Unknown'}</td>
                        <td>{item.bookingCount || 0}</td>
                        <td className="revenue-cell">
                          K{parseFloat(item.revenue || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialOverview;
