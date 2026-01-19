import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';
import './QueueDisplay.css';

interface QueueDisplayProps {
  bookingId: string;
  carWashId: string;
}

const QueueDisplay = ({ bookingId, carWashId }: QueueDisplayProps) => {
  // Get queue position for this booking
  const { data: queuePosition, isLoading } = useQuery({
    queryKey: ['queue-position', bookingId],
    queryFn: async () => {
      const response = await api.get(`/queue/booking/${bookingId}`);
      return response.data.data;
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Get full queue for wait time calculation
  const { data: fullQueue } = useQuery({
    queryKey: ['queue', carWashId],
    queryFn: async () => {
      const response = await api.get(`/queue/carwash/${carWashId}`);
      return response.data.data || [];
    },
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="queue-display">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (!queuePosition) {
    return (
      <div className="queue-display">
        <p className="queue-message">Not in queue</p>
      </div>
    );
  }

  const position = queuePosition.position;
  const estimatedStart = queuePosition.estimated_start_time
    ? new Date(queuePosition.estimated_start_time)
    : null;
  const estimatedCompletion = queuePosition.estimated_completion_time
    ? new Date(queuePosition.estimated_completion_time)
    : null;

  // Calculate wait time
  const now = new Date();
  const waitMinutes = estimatedStart
    ? Math.max(0, Math.ceil((estimatedStart.getTime() - now.getTime()) / 60000))
    : 0;

  // Count cars ahead
  const carsAhead = position - 1;

  return (
    <div className="queue-display">
      <div className="queue-header">
        <h3>Queue Status</h3>
        <span className={`queue-status-badge status-${queuePosition.status}`}>
          {queuePosition.status.replace('_', ' ')}
        </span>
      </div>

      <div className="queue-info">
        <div className="queue-stat">
          <div className="stat-label">Position in Queue</div>
          <div className="stat-value position">{position}</div>
        </div>

        {carsAhead > 0 && (
          <div className="queue-stat">
            <div className="stat-label">Cars Ahead</div>
            <div className="stat-value">{carsAhead}</div>
          </div>
        )}

        {waitMinutes > 0 && (
          <div className="queue-stat">
            <div className="stat-label">Estimated Wait</div>
            <div className="stat-value wait-time">
              {waitMinutes < 60
                ? `${waitMinutes} min`
                : `${Math.floor(waitMinutes / 60)}h ${waitMinutes % 60}m`}
            </div>
          </div>
        )}

        {estimatedStart && (
          <div className="queue-stat">
            <div className="stat-label">Service Start</div>
            <div className="stat-value time">
              {estimatedStart.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        )}

        {estimatedCompletion && queuePosition.status === 'in_progress' && (
          <div className="queue-stat">
            <div className="stat-label">Estimated Completion</div>
            <div className="stat-value time">
              {estimatedCompletion.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        )}
      </div>

      {queuePosition.status === 'waiting' && (
        <div className="queue-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.max(0, Math.min(100, ((fullQueue?.length || 0) - position) / (fullQueue?.length || 1)) * 100)}%`,
              }}
            />
          </div>
          <p className="progress-text">
            {carsAhead > 0
              ? `${carsAhead} ${carsAhead === 1 ? 'car' : 'cars'} ahead of you`
              : 'You are next!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default QueueDisplay;
