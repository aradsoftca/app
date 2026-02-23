import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaSync, FaSearch, FaShieldAlt } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import { apiService } from '../../services/api';

const AbuseDetection = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHighRisk();
    const interval = setInterval(loadHighRisk, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadHighRisk = async () => {
    try {
      setLoading(true);
      const res = await apiService.getHighRiskUsers();
      setUsers(res.data?.users || res.data || []);
    } catch (err) {
      console.error('Failed to load high-risk users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (userId) => {
    try {
      const res = await apiService.getAbuseHistory(userId);
      setHistory(res.data?.history || res.data || []);
      setSelectedUser(userId);
    } catch (err) {
      console.error('Failed to load abuse history:', err);
    }
  };

  const handleEvaluate = async (userId) => {
    try {
      await apiService.evaluateAbuse(userId);
      loadHighRisk();
    } catch (err) {
      console.error('Failed to evaluate user:', err);
    }
  };

  const handleReset = async (userId) => {
    try {
      await apiService.resetAbuseScore(userId);
      loadHighRisk();
    } catch (err) {
      console.error('Failed to reset score:', err);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-white">Loading abuse data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaShieldAlt className="mr-3 text-red-400" />
            Abuse Detection
          </h2>
          <Button variant="outline" size="sm" icon={<FaSync />} onClick={loadHighRisk}>
            Refresh
          </Button>
        </div>

        {users.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No high-risk users detected</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600 text-gray-400">
                  <th className="text-left py-3 px-2">User</th>
                  <th className="text-left py-3 px-2">Risk Score</th>
                  <th className="text-left py-3 px-2">Flags</th>
                  <th className="text-left py-3 px-2">Last Checked</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id || u.user_id} className="border-b border-gray-700 hover:bg-white/5">
                    <td className="py-3 px-2 text-white">{u.email || u.user_id}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        (u.risk_score || 0) > 80 ? 'bg-red-500/20 text-red-300' :
                        (u.risk_score || 0) > 50 ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {u.risk_score || 0}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-300 text-xs max-w-xs truncate">
                      {Array.isArray(u.flags) ? u.flags.join(', ') : u.flags || '—'}
                    </td>
                    <td className="py-3 px-2 text-gray-400 text-xs">
                      {u.last_checked ? new Date(u.last_checked).toLocaleString() : '—'}
                    </td>
                    <td className="py-3 px-2 space-x-2">
                      <button onClick={() => loadHistory(u.id || u.user_id)}
                        className="text-xs text-blue-400 hover:text-blue-300">History</button>
                      <button onClick={() => handleEvaluate(u.id || u.user_id)}
                        className="text-xs text-yellow-400 hover:text-yellow-300">Re-evaluate</button>
                      <button onClick={() => handleReset(u.id || u.user_id)}
                        className="text-xs text-green-400 hover:text-green-300">Reset</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Abuse History Panel */}
      {selectedUser && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Abuse History — {selectedUser}</h3>
            <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          {history.length === 0 ? (
            <p className="text-gray-400 text-sm">No abuse history</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-gray-700/30 rounded text-sm">
                  <span className="text-white">{h.action || h.type || 'Event'}</span>
                  <span className="text-gray-400 text-xs">{h.created_at ? new Date(h.created_at).toLocaleString() : ''}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AbuseDetection;
