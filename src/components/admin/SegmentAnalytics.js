import React, { useState, useEffect, useCallback } from 'react';
import {
  FaUsers, FaUserCheck, FaUserPlus, FaCrown, FaGlobe, FaNetworkWired,
  FaChartBar, FaSync, FaCamera, FaHistory, FaExchangeAlt, FaArrowUp,
  FaArrowDown, FaDatabase, FaClock, FaServer,
} from 'react-icons/fa';
import Card from '../common/Card';
import { apiService } from '../../services/api';

// ── Helpers ─────────────────────────────────────────────────────
const fmt = (n) => (n || 0).toLocaleString();
const fmtBytes = (b) => {
  const n = parseInt(b) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1073741824) return `${(n / 1048576).toFixed(1)} MB`;
  return `${(n / 1073741824).toFixed(2)} GB`;
};
const pct = (a, b) => b > 0 ? ((a / b) * 100).toFixed(1) : '0.0';

// ── Mini bar chart (inline, CSS only) ───────────────────────────
const MiniBar = ({ free, paid, label }) => {
  const total = (free || 0) + (paid || 0);
  const fPct = total > 0 ? (free / total) * 100 : 50;
  return (
    <div className="mb-1">
      {label && <p className="text-gray-500 text-xs mb-0.5">{label}</p>}
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-700 w-full">
        <div className="bg-blue-500 transition-all" style={{ width: `${fPct}%` }}
          title={`Free: ${fmt(free)}`} />
        <div className="bg-amber-500 transition-all" style={{ width: `${100 - fPct}%` }}
          title={`Paid: ${fmt(paid)}`} />
      </div>
      <div className="flex justify-between text-[10px] mt-0.5">
        <span className="text-blue-400">{fmt(free)} free</span>
        <span className="text-amber-400">{fmt(paid)} paid</span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const SegmentAnalytics = () => {
  const [view, setView] = useState('live');   // 'live' | 'history'
  const [live, setLive] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyDays, setHistoryDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [snapshotStatus, setSnapshotStatus] = useState(null);

  // ── Load live data ───────────────────────────────────────────
  const loadLive = useCallback(async () => {
    try {
      const res = await apiService.getSegmentLive();
      setLive(res.data);
    } catch (err) {
      console.error('Segment live error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load history ─────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.getSegmentHistory(historyDays);
      setHistory(res.data?.data || []);
    } catch (err) {
      console.error('Segment history error:', err);
    } finally {
      setLoading(false);
    }
  }, [historyDays]);

  useEffect(() => {
    if (view === 'live') loadLive();
    else loadHistory();
  }, [view, loadLive, loadHistory]);

  useEffect(() => {
    if (!autoRefresh || view !== 'live') return;
    const iv = setInterval(loadLive, 30000);
    return () => clearInterval(iv);
  }, [autoRefresh, view, loadLive]);

  const handleSnapshot = async () => {
    setSnapshotStatus('taking...');
    try {
      await apiService.takeSegmentSnapshot();
      setSnapshotStatus('done ✓');
      if (view === 'history') loadHistory();
    } catch {
      setSnapshotStatus('failed');
    }
    setTimeout(() => setSnapshotStatus(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* ── Controls ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FaChartBar className="text-indigo-400" /> User Segment Analytics
        </h2>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            <button onClick={() => setView('live')}
              className={`px-4 py-1.5 text-sm font-medium flex items-center gap-1 ${view === 'live' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              <FaNetworkWired className="text-xs" /> Live
            </button>
            <button onClick={() => setView('history')}
              className={`px-4 py-1.5 text-sm font-medium flex items-center gap-1 ${view === 'history' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              <FaHistory className="text-xs" /> History
            </button>
          </div>
          {/* Auto-refresh (live only) */}
          {view === 'live' && (
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="rounded" />
              Live (30s)
            </label>
          )}
          {/* History range */}
          {view === 'history' && (
            <select value={historyDays} onChange={e => setHistoryDays(Number(e.target.value))}
              className="bg-white/5 border border-white/10 text-gray-300 rounded px-3 py-1.5 text-sm">
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={365}>1 year</option>
            </select>
          )}
          <button onClick={view === 'live' ? loadLive : loadHistory}
            className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-sm flex items-center gap-1">
            <FaSync className="text-xs" /> Refresh
          </button>
          <button onClick={handleSnapshot}
            className="px-3 py-1.5 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-sm flex items-center gap-1">
            <FaCamera className="text-xs" /> {snapshotStatus || 'Snapshot'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Free users</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Paid users</span>
      </div>

      {loading && !live && !history.length ? (
        <div className="text-center text-gray-400 py-12">Loading segment data...</div>
      ) : view === 'live' ? (
        <LiveView data={live} />
      ) : (
        <HistoryView data={history} />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  LIVE VIEW
// ═══════════════════════════════════════════════════════════════
const LiveView = ({ data }) => {
  if (!data) return null;
  const u = data.users || {};
  const lv = data.live || {};
  const td = data.today || {};

  return (
    <div className="space-y-6">
      {/* ── KPI Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <KPICard icon={FaUsers} iconColor="blue" label="Free Users"
          value={u.free_total} sub={`${u.free_active} active (30d)`} />
        <KPICard icon={FaCrown} iconColor="amber" label="Paid Users"
          value={u.paid_total} sub={`${u.paid_active} active (30d)`} />
        <KPICard icon={FaUserPlus} iconColor="green" label="New Today"
          value={(parseInt(u.free_new_24h) || 0) + (parseInt(u.paid_new_24h) || 0)}
          sub={`F:${u.free_new_24h || 0} P:${u.paid_new_24h || 0}`} />
        <KPICard icon={FaUserCheck} iconColor="purple" label="Online Now"
          value={(parseInt(lv.free_online) || 0) + (parseInt(lv.paid_online) || 0)}
          sub={`F:${lv.free_online || 0} P:${lv.paid_online || 0}`} />
        <KPICard icon={FaExchangeAlt} iconColor="cyan" label="Connections Today"
          value={(parseInt(td.free_connections_today) || 0) + (parseInt(td.paid_connections_today) || 0)}
          sub={`F:${td.free_connections_today || 0} P:${td.paid_connections_today || 0}`} />
        <KPICard icon={FaDatabase} iconColor="pink" label="Data Today"
          value={fmtBytes((parseInt(td.free_data_today) || 0) + (parseInt(td.paid_data_today) || 0))}
          sub={`F:${fmtBytes(td.free_data_today)} P:${fmtBytes(td.paid_data_today)}`} />
      </div>

      {/* ── Segment ratio bar ─────────────────────────────── */}
      <Card className="p-5 border border-white/10">
        <h3 className="text-white font-semibold mb-3">User Composition</h3>
        <MiniBar free={parseInt(u.free_total) || 0} paid={parseInt(u.paid_total) || 0} label="Total users" />
        <MiniBar free={parseInt(u.free_active) || 0} paid={parseInt(u.paid_active) || 0} label="Active users (30d)" />
        <MiniBar free={parseInt(lv.free_online) || 0} paid={parseInt(lv.paid_online) || 0} label="Online now" />
        <MiniBar free={parseInt(td.free_connections_today) || 0} paid={parseInt(td.paid_connections_today) || 0} label="Connections today" />
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Conversion Rate</p>
            <p className="text-white font-bold">{pct(u.paid_total, u.total_users)}%</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">New This Week</p>
            <p className="text-white font-bold">F:{fmt(u.free_new_7d)} / P:{fmt(u.paid_new_7d)}</p>
          </div>
        </div>
      </Card>

      {/* ── 3-column detail grid ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Regions */}
        <Card className="p-5 border border-white/10">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FaGlobe className="text-green-400 text-sm" /> Regions (Live)
          </h3>
          {(data.regions || []).length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No active connections</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.regions.map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{r.country_name || r.country_code}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-blue-400">{r.free_count} F</span>
                    <span className="text-amber-400">{r.paid_count} P</span>
                    <span className="text-gray-500">{r.total_count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Protocols */}
        <Card className="p-5 border border-white/10">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FaNetworkWired className="text-blue-400 text-sm" /> Protocols (Live)
          </h3>
          {(data.protocols || []).length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No active connections</p>
          ) : (
            <div className="space-y-2">
              {data.protocols.map((p, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-gray-300 text-sm font-mono">{p.protocol}</span>
                    <span className="text-gray-500 text-xs">{p.total_count}</span>
                  </div>
                  <MiniBar free={parseInt(p.free_count)} paid={parseInt(p.paid_count)} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Servers */}
        <Card className="p-5 border border-white/10">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FaServer className="text-purple-400 text-sm" /> Servers (Live)
          </h3>
          {(data.servers || []).length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No active connections</p>
          ) : (
            <div className="space-y-2">
              {data.servers.map((s, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-gray-300 text-sm">{s.server_name} <span className="text-gray-600 text-xs">({s.country_code})</span></span>
                    <span className="text-gray-500 text-xs">{s.total_count}/{s.capacity}</span>
                  </div>
                  <MiniBar free={parseInt(s.free_count)} paid={parseInt(s.paid_count)} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Plan Distribution ─────────────────────────────── */}
      {data.plans && data.plans.length > 0 && (
        <Card className="p-5 border border-white/10">
          <h3 className="text-white font-semibold mb-3">Paid Plan Distribution</h3>
          <div className="flex flex-wrap gap-3">
            {data.plans.map((p, i) => (
              <div key={i} className="bg-white/5 rounded-lg px-4 py-2 text-center min-w-[100px]">
                <p className="text-amber-400 text-lg font-bold">{p.count}</p>
                <p className="text-gray-400 text-xs">{p.plan || 'unset'}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Hourly Trend (last 24h) ──────────────────────── */}
      {data.hourly_trend && data.hourly_trend.length > 0 && (
        <Card className="p-5 border border-white/10">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FaClock className="text-cyan-400 text-sm" /> 24h Connection Trend
          </h3>
          <div className="flex items-end gap-1 h-32 overflow-x-auto">
            {data.hourly_trend.map((h, i) => {
              const freeC = parseInt(h.free_count) || 0;
              const paidC = parseInt(h.paid_count) || 0;
              const total = freeC + paidC;
              const maxVal = Math.max(...data.hourly_trend.map(x => (parseInt(x.free_count) || 0) + (parseInt(x.paid_count) || 0)), 1);
              const height = (total / maxVal) * 100;
              const freeH = total > 0 ? (freeC / total) * height : 0;
              const paidH = total > 0 ? (paidC / total) * height : 0;
              const hour = new Date(h.hour).getHours();
              return (
                <div key={i} className="flex flex-col items-center flex-shrink-0" style={{ width: '28px' }}
                  title={`${hour}:00 — Free: ${freeC}, Paid: ${paidC}`}>
                  <div className="flex flex-col justify-end" style={{ height: '100px' }}>
                    <div className="bg-amber-500 w-5 rounded-t-sm" style={{ height: `${paidH}%`, minHeight: paidC > 0 ? '2px' : 0 }} />
                    <div className="bg-blue-500 w-5 rounded-b-sm" style={{ height: `${freeH}%`, minHeight: freeC > 0 ? '2px' : 0 }} />
                  </div>
                  <span className="text-gray-600 text-[9px] mt-1">{hour}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Session duration ──────────────────────────────── */}
      <Card className="p-5 border border-white/10">
        <h3 className="text-white font-semibold mb-3">Today's Session Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-500 text-xs">Free Avg Duration</p>
            <p className="text-blue-400 text-lg font-bold">
              {Math.round((parseFloat(td?.free_avg_duration) || 0) / 60)}m
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Paid Avg Duration</p>
            <p className="text-amber-400 text-lg font-bold">
              {Math.round((parseFloat(td?.paid_avg_duration) || 0) / 60)}m
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Free Data Today</p>
            <p className="text-blue-400 text-lg font-bold">{fmtBytes(td?.free_data_today)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Paid Data Today</p>
            <p className="text-amber-400 text-lg font-bold">{fmtBytes(td?.paid_data_today)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  HISTORY VIEW
// ═══════════════════════════════════════════════════════════════
const HistoryView = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FaHistory className="text-gray-600 text-4xl mx-auto mb-3" />
        <p className="text-gray-400 text-lg">No historical data yet</p>
        <p className="text-gray-600 text-sm">Daily snapshots are taken at 23:55 UTC. Click "Snapshot" to take one now.</p>
      </Card>
    );
  }

  // Compute trends (latest vs previous)
  const latest = data[0];
  const prev = data.length > 1 ? data[1] : null;
  const trend = (cur, prv) => {
    if (!prv) return null;
    const diff = cur - prv;
    return diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '=';
  };

  // Chart data — reverse to chronological
  const chartData = [...data].reverse();

  return (
    <div className="space-y-6">
      {/* ── Latest Snapshot Summary ───────────────────────── */}
      <Card className="p-5 border border-indigo-500/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Latest: {latest.snapshot_date?.split('T')[0]}</h3>
          {prev && <span className="text-gray-500 text-xs">vs {prev.snapshot_date?.split('T')[0]}</span>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <HistKPI label="Free Total" value={latest.free_total} trend={trend(latest.free_total, prev?.free_total)} color="blue" />
          <HistKPI label="Paid Total" value={latest.paid_total} trend={trend(latest.paid_total, prev?.paid_total)} color="amber" />
          <HistKPI label="Free Active" value={latest.free_active} trend={trend(latest.free_active, prev?.free_active)} color="blue" />
          <HistKPI label="Paid Active" value={latest.paid_active} trend={trend(latest.paid_active, prev?.paid_active)} color="amber" />
          <HistKPI label="Conversions" value={latest.conversions} trend={trend(latest.conversions, prev?.conversions)} color="green" />
          <HistKPI label="Churns" value={latest.churns} trend={trend(latest.churns, prev?.churns)} color="red" />
        </div>
      </Card>

      {/* ── User Growth Chart ────────────────────────────── */}
      <Card className="p-5 border border-white/10">
        <h3 className="text-white font-semibold mb-3">User Growth Trend</h3>
        <div className="flex items-end gap-1 h-40 overflow-x-auto pb-6 relative">
          {chartData.map((d, i) => {
            const maxVal = Math.max(...chartData.map(x => Math.max(x.free_total || 0, x.paid_total || 0)), 1);
            const freeH = ((d.free_total || 0) / maxVal) * 100;
            const paidH = ((d.paid_total || 0) / maxVal) * 100;
            const date = d.snapshot_date?.split('T')[0]?.slice(5);
            return (
              <div key={i} className="flex flex-col items-center flex-shrink-0" style={{ width: '36px' }}
                title={`${d.snapshot_date?.split('T')[0]}\nFree: ${d.free_total}\nPaid: ${d.paid_total}`}>
                <div className="flex gap-0.5 items-end" style={{ height: '120px' }}>
                  <div className="bg-blue-500/80 w-3 rounded-t-sm transition-all" style={{ height: `${freeH}%`, minHeight: '2px' }} />
                  <div className="bg-amber-500/80 w-3 rounded-t-sm transition-all" style={{ height: `${paidH}%`, minHeight: '2px' }} />
                </div>
                <span className="text-gray-600 text-[9px] mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">{date}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Connection / Data Chart ──────────────────────── */}
      <Card className="p-5 border border-white/10">
        <h3 className="text-white font-semibold mb-3">Daily Connections</h3>
        <div className="flex items-end gap-1 h-32 overflow-x-auto pb-6">
          {chartData.map((d, i) => {
            const freeC = d.free_connections || 0;
            const paidC = d.paid_connections || 0;
            const total = freeC + paidC;
            const maxVal = Math.max(...chartData.map(x => (x.free_connections || 0) + (x.paid_connections || 0)), 1);
            const height = (total / maxVal) * 100;
            const freeH = total > 0 ? (freeC / total) * height : 0;
            const paidH = total > 0 ? (paidC / total) * height : 0;
            const date = d.snapshot_date?.split('T')[0]?.slice(5);
            return (
              <div key={i} className="flex flex-col items-center flex-shrink-0" style={{ width: '36px' }}
                title={`${d.snapshot_date?.split('T')[0]}\nFree: ${freeC}\nPaid: ${paidC}`}>
                <div className="flex flex-col justify-end" style={{ height: '100px' }}>
                  <div className="bg-amber-500 w-5 rounded-t-sm" style={{ height: `${paidH}%`, minHeight: paidC > 0 ? '2px' : 0 }} />
                  <div className="bg-blue-500 w-5" style={{ height: `${freeH}%`, minHeight: freeC > 0 ? '2px' : 0 }} />
                </div>
                <span className="text-gray-600 text-[9px] mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">{date}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Data Transfer Chart ──────────────────────────── */}
      <Card className="p-5 border border-white/10">
        <h3 className="text-white font-semibold mb-3">Daily Data Transfer</h3>
        <div className="flex items-end gap-1 h-32 overflow-x-auto pb-6">
          {chartData.map((d, i) => {
            const freeB = parseInt(d.free_data_bytes) || 0;
            const paidB = parseInt(d.paid_data_bytes) || 0;
            const total = freeB + paidB;
            const maxVal = Math.max(...chartData.map(x => (parseInt(x.free_data_bytes) || 0) + (parseInt(x.paid_data_bytes) || 0)), 1);
            const height = (total / maxVal) * 100;
            const freeH = total > 0 ? (freeB / total) * height : 0;
            const paidH = total > 0 ? (paidB / total) * height : 0;
            const date = d.snapshot_date?.split('T')[0]?.slice(5);
            return (
              <div key={i} className="flex flex-col items-center flex-shrink-0" style={{ width: '36px' }}
                title={`${d.snapshot_date?.split('T')[0]}\nFree: ${fmtBytes(freeB)}\nPaid: ${fmtBytes(paidB)}`}>
                <div className="flex flex-col justify-end" style={{ height: '100px' }}>
                  <div className="bg-amber-500/70 w-5 rounded-t-sm" style={{ height: `${paidH}%`, minHeight: paidB > 0 ? '2px' : 0 }} />
                  <div className="bg-blue-500/70 w-5" style={{ height: `${freeH}%`, minHeight: freeB > 0 ? '2px' : 0 }} />
                </div>
                <span className="text-gray-600 text-[9px] mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">{date}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── History Table ────────────────────────────────── */}
      <Card className="p-5 border border-white/10 overflow-x-auto">
        <h3 className="text-white font-semibold mb-3">Daily Breakdown</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs border-b border-white/10">
              <th className="text-left py-2 pr-3">Date</th>
              <th className="text-right py-2 px-2">Free</th>
              <th className="text-right py-2 px-2">Paid</th>
              <th className="text-right py-2 px-2">F Active</th>
              <th className="text-right py-2 px-2">P Active</th>
              <th className="text-right py-2 px-2">F Conn</th>
              <th className="text-right py-2 px-2">P Conn</th>
              <th className="text-right py-2 px-2">F Data</th>
              <th className="text-right py-2 px-2">P Data</th>
              <th className="text-right py-2 px-2">Conv</th>
              <th className="text-right py-2 px-2">Churn</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-2 pr-3 text-gray-300 whitespace-nowrap">{d.snapshot_date?.split('T')[0]}</td>
                <td className="py-2 px-2 text-right text-blue-400">{fmt(d.free_total)}</td>
                <td className="py-2 px-2 text-right text-amber-400">{fmt(d.paid_total)}</td>
                <td className="py-2 px-2 text-right text-blue-300">{fmt(d.free_active)}</td>
                <td className="py-2 px-2 text-right text-amber-300">{fmt(d.paid_active)}</td>
                <td className="py-2 px-2 text-right text-blue-400">{fmt(d.free_connections)}</td>
                <td className="py-2 px-2 text-right text-amber-400">{fmt(d.paid_connections)}</td>
                <td className="py-2 px-2 text-right text-blue-300 whitespace-nowrap">{fmtBytes(d.free_data_bytes)}</td>
                <td className="py-2 px-2 text-right text-amber-300 whitespace-nowrap">{fmtBytes(d.paid_data_bytes)}</td>
                <td className="py-2 px-2 text-right text-green-400">{d.conversions || 0}</td>
                <td className="py-2 px-2 text-right text-red-400">{d.churns || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ── Shared sub-components ──────────────────────────────────────
const KPICard = ({ icon: Icon, iconColor, label, value, sub }) => (
  <Card className={`p-4 border border-${iconColor}-500/20`}>
    <div className="flex items-center gap-2 mb-1">
      <Icon className={`text-${iconColor}-400 text-sm`} />
      <p className={`text-${iconColor}-400 text-xs uppercase`}>{label}</p>
    </div>
    <p className="text-white text-2xl font-bold">{typeof value === 'number' ? fmt(value) : value}</p>
    {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
  </Card>
);

const HistKPI = ({ label, value, trend, color }) => (
  <div className={`bg-white/5 rounded-lg p-3 border border-${color}-500/20`}>
    <p className="text-gray-500 text-xs">{label}</p>
    <div className="flex items-center gap-2">
      <p className={`text-${color}-400 text-xl font-bold`}>{fmt(value)}</p>
      {trend && trend !== '=' && (
        <span className={`text-xs flex items-center gap-0.5 ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
          {trend.startsWith('+') ? <FaArrowUp className="text-[8px]" /> : <FaArrowDown className="text-[8px]" />}
          {trend}
        </span>
      )}
    </div>
  </div>
);

export default SegmentAnalytics;
