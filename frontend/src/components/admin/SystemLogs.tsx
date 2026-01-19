import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';
import './SystemLogs.css';

interface LogEntry {
    id: string;
    action: string;
    resource: string;
    resource_id: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    details: any;
    created_at: string;
    user?: {
        name: string;
        email: string;
        role: string;
    };
}

const SystemLogs = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['system-logs'],
        queryFn: async () => {
            const response = await api.get('/admin/logs');
            return response.data.data;
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    const logs: LogEntry[] = data?.logs || [];

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="system-logs-container">
            <h3>System Logs</h3>
            <div className="logs-table-wrapper">
                <table className="logs-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Resource</th>
                            <th>Severity</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="empty-logs">No logs found</td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className={`severity-${log.severity}`}>
                                    <td>{new Date(log.created_at).toLocaleString()}</td>
                                    <td>
                                        {log.user ? (
                                            <div className="log-user">
                                                <span className="user-name">{log.user.name}</span>
                                                <span className="user-role-badge">{log.user.role}</span>
                                            </div>
                                        ) : 'System'}
                                    </td>
                                    <td><span className="action-tag">{log.action}</span></td>
                                    <td>{log.resource} {log.resource_id && `(${log.resource_id})`}</td>
                                    <td><span className={`severity-badge ${log.severity}`}>{log.severity}</span></td>
                                    <td>
                                        <pre className="log-details">
                                            {JSON.stringify(log.details, null, 2)}
                                        </pre>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SystemLogs;
