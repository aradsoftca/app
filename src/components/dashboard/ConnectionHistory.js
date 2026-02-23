import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaHistory,
  FaServer,
  FaClock,
  FaDownload,
  FaChartLine,
  FaFilter
} from 'react-icons/fa';
import api from '../../services/api';

const ConnectionHistory = () => {
  const [connections, setConnections] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ server_id: '', protocol: '' });
  const [period, setPeriod] = useState('30');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConnectionHistory();
    fetchStats();
  }, [filter, period]);

  const fetchConnectionHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { limit: 50, ...filter };
      const response = await api.get('/api/connection-history', { params });
      setConnections(response.data.connections);
    } catch (error) {
      console.error('Failed to fetch connection history:', error);
      setError('Failed to load connection history.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/connection-history/stats', {
        params: { period }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await api.get('/api/connection-history/export', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'connection-history.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Failed to export connection history. Please try again.');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FaHistory className="text-blue-400" />
              Connection History
            </h1>
            <p className="text-gray-400 mt-1">View your VPN connection history and statistics</p>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <FaDownload /> Export CSV
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Connections</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {stats.stats.total_connections || 0}
                  </p>
                </div>
                <FaChartLine className="text-4xl text-blue-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Duration</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {formatDuration(stats.stats.total_duration_seconds)}
                  </p>
                </div>
                <FaClock className="text-4xl text-green-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Data</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {formatBytes(stats.stats.total_data)}
                  </p>
                </div>
                <FaDownload className="text-4xl text-purple-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Unique Servers</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {stats.stats.unique_servers || 0}
                  </p>
                </div>
                <FaServer className="text-4xl text-orange-500" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Most Used */}
        {stats && (stats.most_used_server || stats.most_used_protocol) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {stats.most_used_server && (
              <div className="bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Most Used Server</h3>
                <p className="text-2xl font-bold text-blue-400">
                  {stats.most_used_server.name}
                </p>
                <p className="text-gray-400">{stats.most_used_server.location}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {stats.most_used_server.connection_count} connections
                </p>
              </div>
            )}

            {stats.most_used_protocol && (
              <div className="bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Most Used Protocol</h3>
                <p className="text-2xl font-bold text-green-600 uppercase">
                  {stats.most_used_protocol.protocol}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {stats.most_used_protocol.usage_count} connections
                </p>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <FaFilter className="text-gray-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-700 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        {/* Connection List */}
        <div className="bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Server
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Protocol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Connected At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quality
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-gray-400 mt-4">Loading connections...</p>
                    </td>
                  </tr>
                ) : connections.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FaHistory className="text-6xl text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No connection history yet</p>
                    </td>
                  </tr>
                ) : (
                  connections.map((conn) => (
                    <tr key={conn.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaServer className="text-blue-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-white">
                              {conn.server_name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {conn.server_location || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900 text-blue-300 uppercase">
                          {conn.protocol}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(conn.connected_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDuration(conn.duration_seconds)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatBytes(conn.total_data)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {conn.connection_quality ? (
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${
                                  i < conn.connection_quality
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionHistory;
