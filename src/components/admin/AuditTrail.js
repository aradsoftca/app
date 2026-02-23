import React, { useState, useEffect } from 'react';
import { FaHistory, FaUser, FaServer, FaFilter, FaSync, FaCalendarAlt } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import { apiService } from '../../services/api';

const ACTION_COLORS = {
  create: 'bg-green-500',
  update: 'bg-blue-500',
  delete: 'bg-red-500',
  login: 'bg-purple-500',
  bulk_activate: 'bg-green-500',
  bulk_suspend: 'bg-yellow-500',
  bulk_upgrade: 'bg-purple-500',
  bulk_downgrade: 'bg-orange-500',
  bulk_delete: 'bg-red-500',
};

const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ action: '', target_type: '', start_date: '', end_date: '' });

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const handleExportCsv = async () => {
    try {
      const response = await apiService.exportAuditCsv();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit-trail-export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAuditLogs(filter);
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaHistory className="mr-3 text-blue-400" />
            Audit Trail
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={<FaSync />} onClick={loadLogs}>
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={filter.action}
            onChange={(e) => setFilter({ ...filter, action: e.target.value })}
            className="px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="bulk_activate">Bulk Activate</option>
            <option value="bulk_suspend">Bulk Suspend</option>
            <option value="bulk_upgrade">Bulk Upgrade</option>
          </select>
          <select
            value={filter.target_type}
            onChange={(e) => setFilter({ ...filter, target_type: e.target.value })}
            className="px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Targets</option>
            <option value="user">Users</option>
            <option value="server">Servers</option>
            <option value="subscription">Subscriptions</option>
            <option value="users">Bulk Users</option>
          </select>
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" />
            <input
              type="date"
              value={filter.start_date}
              onChange={(e) => setFilter({ ...filter, start_date: e.target.value })}
              className="px-3 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
              placeholder="Start date"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={filter.end_date}
              onChange={(e) => setFilter({ ...filter, end_date: e.target.value })}
              className="px-3 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
              placeholder="End date"
            />
          </div>
          {(filter.start_date || filter.end_date) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter({ ...filter, start_date: '', end_date: '' })}
            >
              Clear dates
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No audit logs found</div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg bg-white bg-opacity-5 hover:bg-opacity-10 transition">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${ACTION_COLORS[log.action] || 'bg-gray-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium">{log.admin_email || 'System'}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ACTION_COLORS[log.action] || 'bg-gray-500'} text-white`}>
                      {log.action}
                    </span>
                    {log.target_type && (
                      <span className="text-gray-400 text-sm">
                        {log.target_type} {log.target_id ? `#${log.target_id}` : ''}
                      </span>
                    )}
                  </div>
                  {log.details && (
                    <p className="text-gray-400 text-sm mt-1 truncate">
                      {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                    {log.ip_address && <span>IP: {log.ip_address}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuditTrail;
