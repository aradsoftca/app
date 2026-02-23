import React, { useState, useEffect } from 'react';
import { FaBell, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaCheck, FaHistory } from 'react-icons/fa';
import Card from '../common/Card';
import { apiService } from '../../services/api';
import useConfirm from '../../hooks/useConfirm';
import ConfirmDialog from '../common/ConfirmDialog';

const SEVERITY_CONFIG = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', icon: FaTimesCircle },
  warning: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', icon: FaExclamationTriangle },
  info: { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', icon: FaInfoCircle },
};

const AlertManager = () => {
  const [tab, setTab] = useState('active');
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyFilter, setHistoryFilter] = useState({ severity: '', limit: 50 });
  const { confirm: confirmDialog, dialogProps } = useConfirm();

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tab === 'history') loadHistory();
  }, [tab, historyFilter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await apiService.getActiveAlerts();
      setActiveAlerts(res.data.alerts || []);
      setSummary(res.data.summary || null);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setActiveAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await apiService.getAlertHistory(historyFilter);
      setAlertHistory(res.data.alerts || []);
    } catch (err) {
      console.error('Failed to load alert history:', err);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await apiService.acknowledgeAlert(alertId);
      loadAlerts();
    } catch (err) {
      alert('Failed to acknowledge: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAcknowledgeAll = async () => {
    const ok = await confirmDialog({ title: 'Acknowledge All', message: 'Acknowledge all active alerts?', confirmText: 'Acknowledge All', variant: 'warning' });
    if (!ok) return;
    try {
      await apiService.acknowledgeAllAlerts();
      loadAlerts();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleResolve = async (alertId) => {
    const resolution = prompt('Resolution note (optional):');
    if (resolution === null) return;
    try {
      await apiService.resolveAlert(alertId, resolution);
      loadAlerts();
    } catch (err) {
      alert('Failed to resolve: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatTime = (ts) => {
    if (!ts) return 'N/A';
    const d = new Date(ts);
    return d.toLocaleString();
  };

  const timeSince = (ts) => {
    if (!ts) return '';
    const mins = Math.floor((Date.now() - new Date(ts)) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  if (loading) return <div className="text-center text-gray-400 py-12">Loading alerts...</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <FaBell className="text-white text-xl" />
              <div>
                <p className="text-gray-400 text-xs">Total Active</p>
                <p className="text-white text-xl font-bold">{summary.total || activeAlerts.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-red-500/30">
            <div className="flex items-center gap-3">
              <FaTimesCircle className="text-red-400 text-xl" />
              <div>
                <p className="text-red-300 text-xs">Critical</p>
                <p className="text-white text-xl font-bold">{summary.critical || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-yellow-500/30">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-yellow-400 text-xl" />
              <div>
                <p className="text-yellow-300 text-xs">Warning</p>
                <p className="text-white text-xl font-bold">{summary.warning || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-blue-500/30">
            <div className="flex items-center gap-3">
              <FaInfoCircle className="text-blue-400 text-xl" />
              <div>
                <p className="text-blue-300 text-xs">Info</p>
                <p className="text-white text-xl font-bold">{summary.info || 0}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab Switch */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTab('active')}
          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${tab === 'active' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
        >
          <FaBell /> Active ({activeAlerts.length})
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${tab === 'history' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
        >
          <FaHistory /> History
        </button>
        {tab === 'active' && activeAlerts.length > 0 && (
          <button onClick={handleAcknowledgeAll} className="ml-auto px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium">
            Acknowledge All
          </button>
        )}
      </div>

      {/* Active Alerts */}
      {tab === 'active' && (
        <div className="space-y-3">
          {activeAlerts.length === 0 ? (
            <Card className="p-12 text-center">
              <FaCheckCircle className="text-green-400 text-4xl mx-auto mb-3" />
              <p className="text-green-300 text-lg font-medium">All Clear</p>
              <p className="text-gray-500 text-sm">No active alerts at this time</p>
            </Card>
          ) : (
            activeAlerts.map((alert) => {
              const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
              const SevIcon = sev.icon;
              return (
                <Card key={alert.id} className={`p-4 ${sev.bg} border ${sev.border}`}>
                  <div className="flex items-start gap-3">
                    <SevIcon className={`${sev.color} text-lg mt-0.5 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium uppercase ${sev.color}`}>{alert.severity}</span>
                        <span className="text-gray-500 text-xs">{alert.type}</span>
                        <span className="text-gray-600 text-xs ml-auto">{timeSince(alert.created_at || alert.timestamp)}</span>
                      </div>
                      <p className="text-white font-medium mt-1">{alert.message}</p>
                      {alert.details && <p className="text-gray-400 text-sm mt-1">{typeof alert.details === 'string' ? alert.details : JSON.stringify(alert.details)}</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleAcknowledge(alert.id)} className="px-3 py-1.5 rounded text-xs font-medium bg-yellow-600/30 text-yellow-300 hover:bg-yellow-600/50" title="Acknowledge">
                        <FaCheck />
                      </button>
                      <button onClick={() => handleResolve(alert.id)} className="px-3 py-1.5 rounded text-xs font-medium bg-green-600/30 text-green-300 hover:bg-green-600/50" title="Resolve">
                        <FaCheckCircle />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Alert History */}
      {tab === 'history' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <select
              value={historyFilter.severity}
              onChange={(e) => setHistoryFilter(p => ({ ...p, severity: e.target.value }))}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>

          <Card className="p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 text-xs uppercase">Severity</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-xs uppercase">Type</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-xs uppercase">Message</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-xs uppercase">Time</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-xs uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {alertHistory.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-500">No alert history</td></tr>
                ) : (
                  alertHistory.map((alert, i) => {
                    const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
                    return (
                      <tr key={alert.id || i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2.5 px-4">
                          <span className={`text-xs font-medium uppercase ${sev.color}`}>{alert.severity}</span>
                        </td>
                        <td className="py-2.5 px-4 text-gray-400 text-sm">{alert.type}</td>
                        <td className="py-2.5 px-4 text-white text-sm max-w-xs truncate">{alert.message}</td>
                        <td className="py-2.5 px-4 text-gray-500 text-xs">{formatTime(alert.created_at || alert.timestamp)}</td>
                        <td className="py-2.5 px-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${alert.resolved_at ? 'bg-green-500/20 text-green-300' : alert.acknowledged_at ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
                            {alert.resolved_at ? 'Resolved' : alert.acknowledged_at ? 'Acked' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

export default AlertManager;
