import React, { useState, useEffect, useCallback } from 'react';
import {
  FaServer, FaPlus, FaSync, FaCheckCircle, FaExclamationTriangle, FaTimesCircle,
  FaTerminal, FaHeartbeat, FaChartLine, FaPowerOff, FaEdit, FaTrash, FaEye,
  FaNetworkWired, FaGlobe, FaClock, FaShieldAlt, FaTimes, FaHistory,
} from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import { apiService } from '../../services/api';
import useConfirm from '../../hooks/useConfirm';
import ConfirmDialog from '../common/ConfirmDialog';

// ─── Health & Status Helpers ─────────────────────────────────────
const STATUS_CONFIG = {
  active:      { color: 'green', label: 'Active',      icon: FaCheckCircle },
  maintenance: { color: 'yellow', label: 'Maintenance', icon: FaExclamationTriangle },
  offline:     { color: 'red',   label: 'Offline',     icon: FaTimesCircle },
};
const HEALTH_CONFIG = {
  healthy:   { color: 'green',  label: 'Healthy' },
  degraded:  { color: 'yellow', label: 'Degraded' },
  unhealthy: { color: 'red',    label: 'Unhealthy' },
  unknown:   { color: 'gray',   label: 'Unknown' },
};

const LoadBar = ({ pct }) => {
  const c = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div className={`${c} rounded-full h-2 transition-all duration-500`}
        style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
const ServerCommandCenter = ({ onOpenServerModal, onDeleteServer, onRefreshParent }) => {
  const [servers, setServers] = useState([]);
  const [guardianData, setGuardianData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedServer, setSelectedServer] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const { confirm: confirmDialog, dialogProps } = useConfirm();

  // ─── Data Loading (merges admin server list + guardian health) ──
  const loadData = useCallback(async () => {
    try {
      const [srvRes, grdRes, stRes] = await Promise.all([
        apiService.getServers(),
        apiService.getGuardianHealth().catch(() => ({ data: { servers: [] } })),
        apiService.getServerStatsOverview().catch(() => ({ data: { stats: {} } })),
      ]);

      const serverList = Array.isArray(srvRes.data) ? srvRes.data : srvRes.data?.servers || [];
      const guardianList = grdRes.data?.servers || [];

      // Merge guardian health into server objects
      const guardianMap = {};
      guardianList.forEach(g => { guardianMap[g.id] = g; });

      const merged = serverList.map(s => ({
        ...s,
        health_status: guardianMap[s.id]?.health_status || s.health_status || 'unknown',
        consecutive_failures: guardianMap[s.id]?.consecutive_failures || 0,
        last_check: guardianMap[s.id]?.last_check || s.last_health_check,
        active_connections: s.current_load || guardianMap[s.id]?.current_load || 0,
        load_percent: parseFloat(s.load_percent) || 0,
      }));

      setServers(merged);
      setGuardianData(guardianList);
      setStats(stRes.data?.stats || null);
    } catch (err) {
      console.error('Failed to load server data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const iv = setInterval(loadData, 30000);
    return () => clearInterval(iv);
  }, [autoRefresh, loadData]);

  // ─── Actions ──────────────────────────────────────────────────
  const setAction = (id, key, val) =>
    setActionLoading(p => ({ ...p, [id]: { ...p[id], [key]: val } }));

  const handleToggleStatus = async (server) => {
    const newStatus = server.status === 'active' ? 'maintenance' : 'active';
    if (newStatus === 'maintenance' && server.active_connections > 0) {
      const ok = await confirmDialog({ title: 'Set Maintenance Mode', message: `This server has ${server.active_connections} active connections. Setting to maintenance will trigger user migration by the Guardian. Continue?`, confirmText: 'Continue', variant: 'warning' });
      if (!ok) return;
    }
    setAction(server.id, 'status', true);
    try {
      await apiService.setServerStatusOps(server.id, newStatus);
      await loadData();
      onRefreshParent?.();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setAction(server.id, 'status', false);
    }
  };

  const handleSSHTest = async (server) => {
    setAction(server.id, 'ssh', 'loading');
    try {
      const res = await apiService.testServerSSH(server.id);
      const d = res.data;
      setAction(server.id, 'ssh', d.connected ? 'ok' : 'fail');
      setAction(server.id, 'sshMsg', d.output || (d.connected ? 'Connected' : 'Failed'));
    } catch (err) {
      setAction(server.id, 'ssh', 'fail');
      setAction(server.id, 'sshMsg', err.response?.data?.error || 'SSH test failed');
    }
  };

  const handleHealthCheck = async (server) => {
    setAction(server.id, 'health', 'loading');
    try {
      const res = await apiService.triggerHealthCheck(server.id);
      const data = res.data;
      // Format protocol results
      const protos = data.protocols || data.results || {};
      const summary = Object.entries(protos).map(([p, r]) => {
        const status = typeof r === 'object' ? r.status || r.reachable : r;
        return `${p}: ${status ? '✅' : '❌'}`;
      }).join(', ');
      setAction(server.id, 'health', 'done');
      setAction(server.id, 'healthMsg', summary || (data.is_healthy ? 'All healthy' : 'Issues detected'));
    } catch (err) {
      setAction(server.id, 'health', 'done');
      setAction(server.id, 'healthMsg', err.response?.data?.error || 'Health check failed');
    }
  };

  const handleSetOffline = async (server) => {
    const ok = await confirmDialog({ title: 'Set Server Offline', message: `Set ${server.name} OFFLINE? Active users will be disconnected.`, confirmText: 'Set Offline', variant: 'danger' });
    if (!ok) return;
    setAction(server.id, 'status', true);
    try {
      await apiService.setServerStatusOps(server.id, 'offline');
      await loadData();
      onRefreshParent?.();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setAction(server.id, 'status', false);
    }
  };

  const handleDelete = async (server) => {
    if (server.active_connections > 0) {
      alert(`Cannot delete: ${server.name} has ${server.active_connections} active connections. Set it offline first and wait for connections to drain.`);
      return;
    }
    const ok = await confirmDialog({ title: 'Delete Server', message: `Permanently delete server "${server.name}" (${server.ip_address})? This cannot be undone.`, confirmText: 'Delete', variant: 'danger' });
    if (!ok) return;
    try {
      await apiService.deleteServer(server.id);
      await loadData();
      onRefreshParent?.();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  // ─── Counts ──────────────────────────────────────────────────
  const counts = {
    total: servers.length,
    active: servers.filter(s => s.status === 'active').length,
    maintenance: servers.filter(s => s.status === 'maintenance').length,
    offline: servers.filter(s => s.status === 'offline').length,
    healthy: servers.filter(s => s.health_status === 'healthy').length,
    degraded: servers.filter(s => s.health_status === 'degraded').length,
    unhealthy: servers.filter(s => s.health_status === 'unhealthy' || s.health_status === 'unknown').length,
    totalLoad: servers.reduce((a, s) => a + (s.active_connections || 0), 0),
    totalCapacity: servers.filter(s => s.status === 'active').reduce((a, s) => a + (s.capacity || 0), 0),
  };

  if (loading) return <div className="text-center text-gray-400 py-12">Loading server fleet...</div>;

  return (
    <div className="space-y-6">
      {/* ─── Fleet Overview Cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="p-4 border border-white/10">
          <p className="text-gray-400 text-xs uppercase">Fleet</p>
          <p className="text-white text-2xl font-bold">{counts.total}</p>
          <p className="text-gray-500 text-xs">servers</p>
        </Card>
        <Card className="p-4 border border-green-500/30">
          <p className="text-green-400 text-xs uppercase">Active</p>
          <p className="text-white text-2xl font-bold">{counts.active}</p>
          <p className="text-green-500/50 text-xs">{counts.healthy} healthy</p>
        </Card>
        <Card className="p-4 border border-yellow-500/30">
          <p className="text-yellow-400 text-xs uppercase">Maintenance</p>
          <p className="text-white text-2xl font-bold">{counts.maintenance}</p>
          <p className="text-yellow-500/50 text-xs">{counts.degraded} degraded</p>
        </Card>
        <Card className="p-4 border border-red-500/30">
          <p className="text-red-400 text-xs uppercase">Offline</p>
          <p className="text-white text-2xl font-bold">{counts.offline}</p>
          <p className="text-red-500/50 text-xs">{counts.unhealthy} unhealthy</p>
        </Card>
        <Card className="p-4 border border-blue-500/30">
          <p className="text-blue-400 text-xs uppercase">Connections</p>
          <p className="text-white text-2xl font-bold">{counts.totalLoad}</p>
          <p className="text-blue-500/50 text-xs">of {counts.totalCapacity} capacity</p>
        </Card>
        <Card className="p-4 border border-purple-500/30">
          <p className="text-purple-400 text-xs uppercase">Utilization</p>
          <p className="text-white text-2xl font-bold">
            {counts.totalCapacity > 0 ? ((counts.totalLoad / counts.totalCapacity) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-purple-500/50 text-xs">fleet average</p>
        </Card>
      </div>

      {/* ─── Controls ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FaServer className="text-blue-400" /> Server Fleet
        </h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="rounded" />
            Live (30s)
          </label>
          <button onClick={loadData} className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-sm flex items-center gap-1">
            <FaSync className="text-xs" /> Refresh
          </button>
          <button onClick={() => onOpenServerModal?.(null)} className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center gap-1">
            <FaPlus className="text-xs" /> Add Server
          </button>
        </div>
      </div>

      {/* ─── Server Cards ────────────────────────────────────── */}
      {servers.length === 0 ? (
        <Card className="p-12 text-center">
          <FaServer className="text-gray-600 text-4xl mx-auto mb-3" />
          <p className="text-gray-400 text-lg">No servers configured</p>
          <p className="text-gray-600 text-sm">Click "Add Server" to get started</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {servers.map(server => (
            <ServerCard
              key={server.id}
              server={server}
              actionLoading={actionLoading[server.id] || {}}
              onToggleStatus={() => handleToggleStatus(server)}
              onSetOffline={() => handleSetOffline(server)}
              onSSHTest={() => handleSSHTest(server)}
              onHealthCheck={() => handleHealthCheck(server)}
              onEdit={() => onOpenServerModal?.(server)}
              onDelete={() => handleDelete(server)}
              onSelect={() => setSelectedServer(selectedServer?.id === server.id ? null : server)}
              isSelected={selectedServer?.id === server.id}
            />
          ))}
        </div>
      )}

      {/* ─── Server Detail Panel ─────────────────────────────── */}
      {selectedServer && (
        <ServerDetailPanel
          server={selectedServer}
          onClose={() => setSelectedServer(null)}
        />
      )}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  SERVER CARD
// ═══════════════════════════════════════════════════════════════════
const ServerCard = ({ server, actionLoading, onToggleStatus, onSetOffline, onSSHTest, onHealthCheck, onEdit, onDelete, onSelect, isSelected }) => {
  const st = STATUS_CONFIG[server.status] || STATUS_CONFIG.offline;
  const hl = HEALTH_CONFIG[server.health_status] || HEALTH_CONFIG.unknown;
  const StIcon = st.icon;
  const protocols = Array.isArray(server.protocols) ? server.protocols : [];

  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="p-5">
        {/* Top row: Name, status, health */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <StIcon className={`text-${st.color}-400 text-lg`} />
            <div>
              <h3 className="text-white text-lg font-bold">{server.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FaGlobe className="text-xs" />
                <span>{server.location}</span>
                {server.country_code && <span className="text-xs">({server.country_code})</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-${st.color}-500/20 text-${st.color}-400 border border-${st.color}-500/30`}>
              {st.label}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-${hl.color}-500/20 text-${hl.color}-400 border border-${hl.color}-500/30`}>
              {hl.label}
            </span>
            {server.consecutive_failures > 0 && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                {server.consecutive_failures} fails
              </span>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
          <div>
            <p className="text-gray-500 text-xs">IP Address</p>
            <p className="text-white text-sm font-mono">{server.ip_address}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Connections</p>
            <p className="text-white text-sm font-semibold">{server.active_connections} / {server.capacity}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Load</p>
            <div className="flex items-center gap-2">
              <LoadBar pct={server.load_percent} />
              <span className="text-white text-sm font-semibold">{server.load_percent}%</span>
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-xs">SSH</p>
            <p className="text-sm">
              {server.has_ssh_password || server.has_ssh_key ? (
                <span className="text-green-400">Configured</span>
              ) : (
                <span className="text-gray-500">Not set</span>
              )}
            </p>
          </div>
        </div>

        {/* Protocols row */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-gray-500 text-xs">Protocols:</span>
          {protocols.map(p => (
            <span key={p} className="px-2 py-0.5 rounded text-xs bg-blue-500/15 text-blue-300 border border-blue-500/20">{p}</span>
          ))}
          {protocols.length === 0 && <span className="text-gray-600 text-xs">None configured</span>}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button onClick={onSelect} className="px-3 py-1.5 rounded text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 flex items-center gap-1">
            <FaEye /> {isSelected ? 'Hide Details' : 'Details'}
          </button>
          <button onClick={onSSHTest}
            disabled={actionLoading.ssh === 'loading'}
            className="px-3 py-1.5 rounded text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 flex items-center gap-1 disabled:opacity-40">
            <FaTerminal /> {actionLoading.ssh === 'loading' ? 'Testing...' : 'SSH Test'}
          </button>
          <button onClick={onHealthCheck}
            disabled={actionLoading.health === 'loading'}
            className="px-3 py-1.5 rounded text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 flex items-center gap-1 disabled:opacity-40">
            <FaHeartbeat /> {actionLoading.health === 'loading' ? 'Checking...' : 'Health Check'}
          </button>
          <button onClick={onToggleStatus}
            disabled={actionLoading.status}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 disabled:opacity-40 ${
              server.status === 'active' ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300' : 'bg-green-600/20 hover:bg-green-600/30 text-green-300'
            }`}>
            <FaPowerOff /> {server.status === 'active' ? 'Maintenance' : 'Activate'}
          </button>
          {server.status !== 'offline' && (
            <button onClick={onSetOffline}
              disabled={actionLoading.status}
              className="px-3 py-1.5 rounded text-xs font-medium bg-red-600/20 hover:bg-red-600/30 text-red-300 flex items-center gap-1 disabled:opacity-40">
              <FaTimesCircle /> Offline
            </button>
          )}
          <button onClick={onEdit}
            className="px-3 py-1.5 rounded text-xs font-medium bg-white/5 hover:bg-white/10 text-blue-300 flex items-center gap-1">
            <FaEdit /> Edit
          </button>
          <button onClick={onDelete}
            className="px-3 py-1.5 rounded text-xs font-medium bg-white/5 hover:bg-white/10 text-red-400 flex items-center gap-1">
            <FaTrash /> Delete
          </button>
        </div>

        {/* Action results */}
        {actionLoading.ssh && actionLoading.ssh !== 'loading' && (
          <div className={`mt-3 p-2.5 rounded text-xs ${actionLoading.ssh === 'ok' ? 'bg-green-500/10 text-green-300 border border-green-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>
            <span className="font-medium">SSH:</span> {actionLoading.sshMsg}
          </div>
        )}
        {actionLoading.health === 'done' && (
          <div className="mt-2 p-2.5 rounded text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20">
            <span className="font-medium">Health:</span> {actionLoading.healthMsg}
          </div>
        )}
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  SERVER DETAIL PANEL (guardian log + load prediction)
// ═══════════════════════════════════════════════════════════════════
const ServerDetailPanel = ({ server, onClose }) => {
  const [tab, setTab] = useState('guardian');
  const [guardianLog, setGuardianLog] = useState([]);
  const [prediction, setPrediction] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiService.getGuardianLog(server.id).catch(() => ({ data: { log: [] } })),
      apiService.getLoadPrediction(server.id, 8).catch(() => ({ data: { predictions: [] } })),
    ]).then(([logRes, predRes]) => {
      setGuardianLog(logRes.data?.log || []);
      setPrediction(predRes.data?.predictions || []);
    }).finally(() => setLoading(false));
  }, [server.id]);

  const ACTION_COLORS = {
    healthy: 'text-green-400',
    degraded: 'text-yellow-400',
    unhealthy: 'text-red-400',
    auto_offline: 'text-red-500',
    recovery: 'text-green-400',
    restart_requested: 'text-orange-400',
    status_change: 'text-blue-400',
  };

  return (
    <Card className="p-6 border border-blue-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FaShieldAlt className="text-blue-400" />
          {server.name} — Details
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-white">
          <FaTimes />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('guardian')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${tab === 'guardian' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
          <FaShieldAlt /> Guardian Log
        </button>
        <button onClick={() => setTab('prediction')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${tab === 'prediction' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
          <FaChartLine /> Load Prediction
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 py-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
              <div className="h-4 w-1/4 bg-gray-700/30 rounded"></div>
              <div className="h-4 w-1/3 bg-gray-700/30 rounded"></div>
              <div className="h-4 w-1/4 bg-gray-700/30 rounded"></div>
            </div>
          ))}
        </div>
      ) : tab === 'guardian' ? (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {guardianLog.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <FaCheckCircle className="text-green-500 text-3xl mx-auto mb-2" />
              No guardian events — server running smoothly
            </div>
          ) : (
            guardianLog.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded bg-white/5">
                <FaHistory className={`text-sm mt-0.5 ${ACTION_COLORS[entry.action] || 'text-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold uppercase ${ACTION_COLORS[entry.action] || 'text-gray-400'}`}>
                      {entry.action?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-gray-600 text-xs">{new Date(entry.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-300 text-sm mt-0.5">
                    {typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {prediction.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No load history data available for predictions yet
            </div>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {prediction.map((p, i) => {
                const pct = server.capacity > 0 ? ((p.predicted_load || 0) / server.capacity * 100) : 0;
                return (
                  <div key={i} className="text-center p-3 rounded bg-white/5">
                    <p className="text-gray-500 text-xs">{p.hour || `+${i + 1}h`}</p>
                    <p className="text-white text-lg font-bold">{p.predicted_load || 0}</p>
                    <LoadBar pct={pct} />
                    <p className="text-gray-600 text-xs mt-1">{pct.toFixed(0)}%</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ServerCommandCenter;
