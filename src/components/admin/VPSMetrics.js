import React, { useState, useEffect } from 'react';
import { FaMicrochip, FaMemory, FaHdd, FaClock, FaPlug, FaSync, FaGlobe, FaServer } from 'react-icons/fa';
import Card from '../common/Card';
import { apiService } from '../../services/api';

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatUptime = (seconds) => {
  if (!seconds) return '0s';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const GaugeBar = ({ value, max, color, label }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const barColor = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : color || 'bg-green-500';
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{pct.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div className={`${barColor} rounded-full h-3 transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const VPSMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [vpnServers, setVpnServers] = useState([]);
  const [vpnLoading, setVpnLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    loadVPNMetrics();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => { loadMetrics(); loadVPNMetrics(); }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadMetrics = async () => {
    try {
      const res = await apiService.getVPSMetrics();
      setMetrics(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load VPS metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadVPNMetrics = async () => {
    try {
      const res = await apiService.getVPNServerMetrics();
      setVpnServers(res.data?.servers || []);
    } catch (err) {
      console.error('VPN server metrics:', err);
    } finally {
      setVpnLoading(false);
    }
  };

  if (loading) return <div className="text-center text-gray-400 py-12">Loading VPS metrics...</div>;
  if (error) return <div className="text-center text-red-400 py-12">{error}</div>;
  if (!metrics) return null;

  const cpu = metrics.cpu || {};
  const mem = metrics.memory || {};
  const disk = metrics.disk || {};
  const services = metrics.services || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">VPS Metrics</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh (10s)
          </label>
          <button onClick={loadMetrics} className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center gap-1">
            <FaSync className="text-xs" /> Refresh
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <FaMicrochip className="text-blue-400 text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase">CPU Usage</p>
              <p className="text-white text-xl font-bold">{parseFloat(cpu.usage).toFixed(1)}%</p>
              <p className="text-gray-500 text-xs">{cpu.cores} cores</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <FaMemory className="text-purple-400 text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase">Memory</p>
              <p className="text-white text-xl font-bold">{parseFloat(mem.usagePercent).toFixed(1)}%</p>
              <p className="text-gray-500 text-xs">{formatBytes(mem.used)} / {formatBytes(mem.total)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-yellow-500/20">
              <FaHdd className="text-yellow-400 text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase">Disk</p>
              <p className="text-white text-xl font-bold">{parseFloat(disk.usagePercent).toFixed(1)}%</p>
              <p className="text-gray-500 text-xs">{formatBytes(disk.used)} / {formatBytes(disk.total)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/20">
              <FaClock className="text-green-400 text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase">Uptime</p>
              <p className="text-white text-xl font-bold">{formatUptime(metrics.uptime)}</p>
              <p className="text-gray-500 text-xs">{metrics.activeConnections} connections</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gauge bars */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Resource Usage</h3>
        <div className="space-y-4">
          <GaugeBar value={parseFloat(cpu.usage)} max={100} color="bg-blue-500" label={`CPU (${cpu.cores} cores)`} />
          <GaugeBar value={mem.used} max={mem.total} color="bg-purple-500" label={`Memory (${formatBytes(mem.free)} free)`} />
          <GaugeBar value={disk.used} max={disk.total} color="bg-yellow-500" label={`Disk (${formatBytes(disk.free)} free)`} />
        </div>
      </Card>

      {/* Services */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Service Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(services).map(([name, status]) => (
            <div key={name} className={`flex items-center gap-2 p-3 rounded-lg ${status === 'active' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <div>
                <p className="text-white text-sm font-medium capitalize">{name}</p>
                <p className={`text-xs ${status === 'active' ? 'text-green-400' : 'text-red-400'}`}>{status}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── VPN Servers ── */}
      <div className="pt-4">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <FaGlobe className="text-indigo-400" /> VPN Servers
        </h2>
        {vpnLoading ? (
          <div className="text-center text-gray-400 py-8">Loading VPN server metrics…</div>
        ) : vpnServers.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No active VPN servers found</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {vpnServers.map((srv) => (
              <Card key={srv.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/20">
                      <FaServer className="text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{srv.name}</h3>
                      <p className="text-gray-400 text-xs">{srv.location} · {srv.ip_address}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    srv.online ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {srv.online ? 'Online' : 'Offline'}
                  </span>
                </div>

                {srv.online && srv.health ? (
                  <>
                    {/* Quick stats */}
                    <div className="grid grid-cols-4 gap-3 mb-4 text-center">
                      <div>
                        <p className="text-blue-400 font-bold text-lg">{srv.health.system?.load_1m?.toFixed(2) ?? '—'}</p>
                        <p className="text-gray-500 text-xs">Load 1m</p>
                      </div>
                      <div>
                        <p className="text-purple-400 font-bold text-lg">{srv.health.system?.memory_used_pct ?? '—'}%</p>
                        <p className="text-gray-500 text-xs">Memory</p>
                      </div>
                      <div>
                        <p className="text-yellow-400 font-bold text-lg">{srv.health.system?.disk_used_pct ?? '—'}%</p>
                        <p className="text-gray-500 text-xs">Disk</p>
                      </div>
                      <div>
                        <p className="text-green-400 font-bold text-lg">{formatUptime(srv.health.system?.uptime_seconds)}</p>
                        <p className="text-gray-500 text-xs">Uptime</p>
                      </div>
                    </div>

                    {/* Gauge bars */}
                    <div className="space-y-2 mb-4">
                      <GaugeBar
                        value={Math.min((srv.health.system?.load_1m || 0) / (srv.health.system?.cpus || 1) * 100, 100)}
                        max={100} color="bg-blue-500"
                        label={`CPU load (${srv.health.system?.cpus ?? '?'} cores)`}
                      />
                      <GaugeBar value={srv.health.system?.memory_used_pct || 0} max={100} color="bg-purple-500" label="Memory" />
                      <GaugeBar value={Math.max(0, srv.health.system?.disk_used_pct || 0)} max={100} color="bg-yellow-500" label="Disk" />
                    </div>

                    {/* Services */}
                    {srv.health.services && (
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Services</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(srv.health.services).map(([proto, svcInfo]) => (
                            <div key={proto} className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs border ${
                              svcInfo.active
                                ? 'bg-green-500/10 border-green-500/30 text-green-300'
                                : 'bg-gray-700 border-gray-600 text-gray-500'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                svcInfo.active ? 'bg-green-400' : 'bg-gray-500'
                              }`} />
                              {proto}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-500 text-sm py-4 text-center">
                    {srv.error || 'Could not reach health agent'}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VPSMetrics;
