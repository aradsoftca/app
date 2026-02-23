import React, { useState, useEffect } from 'react';
import { FaSync, FaPlug, FaSignOutAlt, FaUser } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import { apiService } from '../../services/api';

const SessionControl = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    loadTopUsers();
    const interval = setInterval(loadTopUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadTopUsers = async () => {
    try {
      setLoading(true);
      const res = await apiService.getTopSessionUsers();
      setTopUsers(res.data?.users || res.data || []);
    } catch (err) {
      console.error('Failed to load top users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSessions = async (userId) => {
    try {
      const res = await apiService.getUserSessions(userId);
      setSessions(res.data?.sessions || res.data || []);
      setSelectedUser(userId);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  const handleDisconnectAll = async (userId) => {
    try {
      await apiService.disconnectAllSessions(userId);
      loadTopUsers();
      if (selectedUser === userId) loadUserSessions(userId);
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  const handleDisconnectOne = async (connectionId) => {
    try {
      await apiService.disconnectSession(connectionId);
      if (selectedUser) loadUserSessions(selectedUser);
      loadTopUsers();
    } catch (err) {
      console.error('Failed to disconnect session:', err);
    }
  };

  if (loading && topUsers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-white">Loading sessions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaPlug className="mr-3 text-green-400" />
            Session Control
          </h2>
          <Button variant="outline" size="sm" icon={<FaSync />} onClick={loadTopUsers}>
            Refresh
          </Button>
        </div>

        <p className="text-gray-400 text-sm mb-4">Top users by active connections</p>

        {topUsers.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No active sessions</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600 text-gray-400">
                  <th className="text-left py-3 px-2">User</th>
                  <th className="text-left py-3 px-2">Active Sessions</th>
                  <th className="text-left py-3 px-2">Total Data</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u) => (
                  <tr key={u.id || u.user_id} className="border-b border-gray-700 hover:bg-white/5">
                    <td className="py-3 px-2 text-white flex items-center gap-2">
                      <FaUser className="text-gray-400" />
                      {u.email || u.user_id}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-300">
                        {u.active_connections || u.session_count || 0}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-300">{u.total_data || '—'}</td>
                    <td className="py-3 px-2 space-x-2">
                      <button onClick={() => loadUserSessions(u.id || u.user_id)}
                        className="text-xs text-blue-400 hover:text-blue-300">View</button>
                      <button onClick={() => handleDisconnectAll(u.id || u.user_id)}
                        className="text-xs text-red-400 hover:text-red-300">Disconnect All</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* User Sessions Detail */}
      {selectedUser && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Sessions — {selectedUser}</h3>
            <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          {sessions.length === 0 ? (
            <p className="text-gray-400 text-sm">No active sessions</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600 text-gray-400">
                    <th className="text-left py-2 px-2">Server</th>
                    <th className="text-left py-2 px-2">Protocol</th>
                    <th className="text-left py-2 px-2">Connected</th>
                    <th className="text-left py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-b border-gray-700">
                      <td className="py-2 px-2 text-white">{s.server_name || s.server_id || '—'}</td>
                      <td className="py-2 px-2">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">{s.protocol || '—'}</span>
                      </td>
                      <td className="py-2 px-2 text-gray-300 text-xs">
                        {s.connected_at ? new Date(s.connected_at).toLocaleString() : '—'}
                      </td>
                      <td className="py-2 px-2">
                        <button onClick={() => handleDisconnectOne(s.id)}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                          <FaSignOutAlt /> Kill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default SessionControl;
