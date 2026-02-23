import React, { useState, useEffect } from 'react';
import {
  FaChartBar,
  FaDownload,
  FaUpload,
  FaClock,
  FaServer,
  FaShieldAlt,
  FaSync,
  FaCalendarAlt,
} from 'react-icons/fa';
import Card from '../common/Card';
import { apiService } from '../../services/api';

const UsageStatistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.getUsageStats();
      setStats(res.data);
    } catch (err) {
      setError('Failed to load usage statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSync className="animate-spin text-blue-400 text-2xl mr-3" />
        <span className="text-gray-400">Loading usage statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-400">{error}</p>
        <button onClick={loadStats} className="mt-2 text-blue-400 hover:text-blue-300 text-sm">Retry</button>
      </Card>
    );
  }

  const maxDaily = Math.max(...(stats?.dailyUsage || []).map(d => Number(d.bytes) || 0), 1);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-lg bg-blue-500/20 mr-3">
              <FaChartBar className="text-blue-400" />
            </div>
            <span className="text-gray-400 text-sm">Total Connections</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.totalConnections || 0}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-lg bg-green-500/20 mr-3">
              <FaDownload className="text-green-400" />
            </div>
            <span className="text-gray-400 text-sm">Total Bandwidth</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatBytes(stats?.totalBytes)}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20 mr-3">
              <FaClock className="text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">Avg Session</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatDuration(stats?.avgSessionSeconds)}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-lg bg-yellow-500/20 mr-3">
              <FaCalendarAlt className="text-yellow-400" />
            </div>
            <span className="text-gray-400 text-sm">Last 30 Days</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.dailyUsage?.length || 0} <span className="text-sm text-gray-400">active days</span></p>
        </Card>
      </div>

      {/* Daily Usage Chart */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center">
            <FaChartBar className="mr-2 text-blue-400" />
            Daily Usage (Last 30 Days)
          </h3>
          <button onClick={loadStats} className="text-gray-400 hover:text-white transition-colors">
            <FaSync />
          </button>
        </div>

        <div className="flex items-end gap-1 h-48">
          {(stats?.dailyUsage || []).map((day, i) => {
            const height = Math.max(4, (Number(day.bytes) / maxDaily) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center group relative">
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white whitespace-nowrap z-10">
                  {new Date(day.date).toLocaleDateString()}: {formatBytes(day.bytes)} ({day.connections} conn)
                </div>
                <div
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-400 transition-colors cursor-pointer"
                  style={{ height: `${height}%` }}
                />
              </div>
            );
          })}
        </div>
        {stats?.dailyUsage?.length === 0 && (
          <p className="text-gray-500 text-center py-8">No usage data for the last 30 days</p>
        )}
      </Card>

      {/* Top Servers & Protocol Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <FaServer className="mr-2 text-green-400" />
            Top Servers
          </h3>
          <div className="space-y-3">
            {(stats?.topServers || []).map((server, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm w-6">{i + 1}.</span>
                  <span className="text-white">{server.server_name || `Server #${server.server_id}`}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">{server.connections} conn</span>
                  <span className="text-blue-400 text-sm font-medium">{formatBytes(server.total_bytes)}</span>
                </div>
              </div>
            ))}
            {(!stats?.topServers || stats.topServers.length === 0) && (
              <p className="text-gray-500 text-sm">No server data available</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <FaShieldAlt className="mr-2 text-purple-400" />
            Protocol Usage
          </h3>
          <div className="space-y-3">
            {(stats?.protocolBreakdown || []).map((proto, i) => {
              const total = stats.protocolBreakdown.reduce((a, b) => a + Number(b.count), 0);
              const pct = total > 0 ? (Number(proto.count) / total * 100) : 0;
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-pink-500'];
              return (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-white capitalize">{proto.protocol || 'Unknown'}</span>
                    <span className="text-gray-400 text-sm">{proto.count} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${colors[i % colors.length]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {(!stats?.protocolBreakdown || stats.protocolBreakdown.length === 0) && (
              <p className="text-gray-500 text-sm">No protocol data available</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UsageStatistics;
