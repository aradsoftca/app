import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { FaBan, FaMobileAlt, FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import useConfirm from '../../hooks/useConfirm';
import ConfirmDialog from '../common/ConfirmDialog';

const IPDeviceBanManager = () => {
  const [activeTab, setActiveTab] = useState('ips');
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [bannedDevices, setBannedDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddIP, setShowAddIP] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newIP, setNewIP] = useState({ ip_address: '', reason: '', expires_at: '' });
  const [newDevice, setNewDevice] = useState({ device_id: '', reason: '', user_id: '' });
  const [message, setMessage] = useState(null);
  const { confirm: confirmDialog, dialogProps } = useConfirm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ipsRes, devicesRes] = await Promise.all([
        apiService.getBlockedIPs(),
        apiService.getBannedDevices(),
      ]);
      setBlockedIPs(ipsRes.data.blocked_ips || []);
      setBannedDevices(devicesRes.data.banned_devices || []);
    } catch (err) {
      console.error('Failed to load ban data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockIP = async () => {
    if (!newIP.ip_address.trim()) return;
    try {
      await apiService.blockIP(newIP);
      setMessage({ type: 'success', text: `IP ${newIP.ip_address} blocked` });
      setNewIP({ ip_address: '', reason: '', expires_at: '' });
      setShowAddIP(false);
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to block IP' });
    }
  };

  const handleUnblockIP = async (ip) => {
    const ok = await confirmDialog({ title: 'Unblock IP', message: `Unblock IP ${ip}?`, confirmText: 'Unblock', variant: 'warning' });
    if (!ok) return;
    try {
      await apiService.unblockIP(ip);
      setMessage({ type: 'success', text: `IP ${ip} unblocked` });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to unblock IP' });
    }
  };

  const handleBanDevice = async () => {
    if (!newDevice.device_id.trim()) return;
    try {
      await apiService.banDevice(newDevice);
      setMessage({ type: 'success', text: `Device ${newDevice.device_id} banned` });
      setNewDevice({ device_id: '', reason: '', user_id: '' });
      setShowAddDevice(false);
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to ban device' });
    }
  };

  const handleUnbanDevice = async (deviceId) => {
    const ok = await confirmDialog({ title: 'Unban Device', message: `Unban device ${deviceId}?`, confirmText: 'Unban', variant: 'warning' });
    if (!ok) return;
    try {
      await apiService.unbanDevice(deviceId);
      setMessage({ type: 'success', text: `Device ${deviceId} unbanned` });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to unban device' });
    }
  };

  const filteredIPs = blockedIPs.filter(ip =>
    ip.ip_address?.toLowerCase().includes(search.toLowerCase()) ||
    ip.reason?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDevices = bannedDevices.filter(d =>
    d.device_id?.toLowerCase().includes(search.toLowerCase()) ||
    d.reason?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-3 font-bold">×</button>
        </div>
      )}

      {/* Tab Switch */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => setActiveTab('ips')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${activeTab === 'ips' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
          <FaBan /> Blocked IPs ({blockedIPs.length})
        </button>
        <button onClick={() => setActiveTab('devices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${activeTab === 'devices' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
          <FaMobileAlt /> Banned Devices ({bannedDevices.length})
        </button>
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button onClick={() => activeTab === 'ips' ? setShowAddIP(!showAddIP) : setShowAddDevice(!showAddDevice)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">
          <FaPlus /> Add {activeTab === 'ips' ? 'IP Block' : 'Device Ban'}
        </button>
      </div>

      {/* Add IP Form */}
      {showAddIP && activeTab === 'ips' && (
        <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input type="text" placeholder="IP Address (e.g. 192.168.1.1)" value={newIP.ip_address}
              onChange={e => setNewIP(f => ({ ...f, ip_address: e.target.value }))}
              className="px-3 py-2 rounded bg-gray-600 text-white text-sm border border-gray-500" />
            <input type="text" placeholder="Reason" value={newIP.reason}
              onChange={e => setNewIP(f => ({ ...f, reason: e.target.value }))}
              className="px-3 py-2 rounded bg-gray-600 text-white text-sm border border-gray-500" />
            <input type="datetime-local" placeholder="Expires at (optional)" value={newIP.expires_at}
              onChange={e => setNewIP(f => ({ ...f, expires_at: e.target.value }))}
              className="px-3 py-2 rounded bg-gray-600 text-white text-sm border border-gray-500" />
          </div>
          <button onClick={handleBlockIP} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium">
            Block IP
          </button>
        </div>
      )}

      {/* Add Device Form */}
      {showAddDevice && activeTab === 'devices' && (
        <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input type="text" placeholder="Device ID" value={newDevice.device_id}
              onChange={e => setNewDevice(f => ({ ...f, device_id: e.target.value }))}
              className="px-3 py-2 rounded bg-gray-600 text-white text-sm border border-gray-500" />
            <input type="text" placeholder="Reason" value={newDevice.reason}
              onChange={e => setNewDevice(f => ({ ...f, reason: e.target.value }))}
              className="px-3 py-2 rounded bg-gray-600 text-white text-sm border border-gray-500" />
            <input type="text" placeholder="User ID (optional)" value={newDevice.user_id}
              onChange={e => setNewDevice(f => ({ ...f, user_id: e.target.value }))}
              className="px-3 py-2 rounded bg-gray-600 text-white text-sm border border-gray-500" />
          </div>
          <button onClick={handleBanDevice} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium">
            Ban Device
          </button>
        </div>
      )}

      {/* IP List */}
      {activeTab === 'ips' && (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-700/30 rounded animate-pulse" />)}
            </div>
          ) : filteredIPs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No blocked IPs</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="text-left py-3 px-4">IP Address</th>
                  <th className="text-left py-3 px-4">Reason</th>
                  <th className="text-left py-3 px-4">Blocked At</th>
                  <th className="text-left py-3 px-4">Expires</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIPs.map(ip => (
                  <tr key={ip.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="py-3 px-4 text-white font-mono">{ip.ip_address}</td>
                    <td className="py-3 px-4 text-gray-300">{ip.reason || '-'}</td>
                    <td className="py-3 px-4 text-gray-400">{new Date(ip.created_at).toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-400">{ip.expires_at ? new Date(ip.expires_at).toLocaleString() : 'Never'}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleUnblockIP(ip.ip_address)} className="text-red-400 hover:text-red-300 flex items-center gap-1">
                        <FaTrash size={12} /> Unblock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Device List */}
      {activeTab === 'devices' && (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-700/30 rounded animate-pulse" />)}
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No banned devices</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="text-left py-3 px-4">Device ID</th>
                  <th className="text-left py-3 px-4">Reason</th>
                  <th className="text-left py-3 px-4">User ID</th>
                  <th className="text-left py-3 px-4">Banned At</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map(d => (
                  <tr key={d.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="py-3 px-4 text-white font-mono text-xs">{d.device_id}</td>
                    <td className="py-3 px-4 text-gray-300">{d.reason || '-'}</td>
                    <td className="py-3 px-4 text-gray-400 font-mono text-xs">{d.user_id || '-'}</td>
                    <td className="py-3 px-4 text-gray-400">{new Date(d.created_at).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleUnbanDevice(d.device_id)} className="text-red-400 hover:text-red-300 flex items-center gap-1">
                        <FaTrash size={12} /> Unban
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

export default IPDeviceBanManager;
