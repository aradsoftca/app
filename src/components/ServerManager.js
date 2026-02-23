import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaServer, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, 
  FaCheck, FaExclamationTriangle, FaDownload, FaUpload,
  FaSync, FaGlobe, FaNetworkWired
} from 'react-icons/fa';
import { apiService } from '../services/api';
import useConfirm from '../hooks/useConfirm';
import ConfirmDialog from './common/ConfirmDialog';

const ServerManager = () => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingServer, setEditingServer] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { confirm: confirmDialog, dialogProps } = useConfirm();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    location: '',
    country_code: '',
    ip_address: '',
    capacity: 500,
    protocols: ['shadowsocks', 'trojan', 'v2ray', 'hysteria'],
    status: 'active',
  });

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getServers();
      const data = response.data;
      setServers(Array.isArray(data) ? data : data?.servers || []);
      setError(null);
    } catch (err) {
      setError('Failed to load servers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddServer = async () => {
    try {
      await apiService.addServer(formData);
      setSuccess('Server added successfully!');
      setTimeout(() => setSuccess(null), 3000);
      setShowAddForm(false);
      resetForm();
      loadServers();
    } catch (err) {
      setError('Failed to add server: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdateServer = async () => {
    try {
      await apiService.updateServer(editingServer.id, formData);
      setSuccess('Server updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      setEditingServer(null);
      resetForm();
      loadServers();
    } catch (err) {
      setError('Failed to update server: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteServer = async (serverId) => {
    const ok = await confirmDialog({ title: 'Delete Server', message: 'Are you sure you want to delete this server?', confirmText: 'Delete', variant: 'danger' });
    if (!ok) return;
    try {
      await apiService.deleteServer(serverId);
      setSuccess('Server deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
      loadServers();
    } catch (err) {
      setError('Failed to delete server: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleToggleStatus = async (serverId) => {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;
    try {
      await apiService.updateServer(serverId, {
        status: server.status === 'active' ? 'inactive' : 'active'
      });
      loadServers();
    } catch (err) {
      setError('Failed to toggle status: ' + (err.response?.data?.error || err.message));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      city: '',
      location: '',
      country_code: '',
      ip_address: '',
      capacity: 500,
      protocols: ['shadowsocks', 'trojan', 'v2ray', 'hysteria'],
      status: 'active',
    });
  };

  const startEdit = (server) => {
    setEditingServer(server);
    setFormData({
      name: server.name,
      country: server.country,
      city: server.city,
      location: server.location,
      country_code: server.country_code,
      ip_address: server.ip_address,
      capacity: server.capacity,
      protocols: server.protocols,
      status: server.status,
    });
  };

  const exportServers = () => {
    const dataStr = JSON.stringify({ version: 1, updated: new Date().toISOString(), servers }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'servers.json';
    link.click();
  };

  const importServers = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const serverList = data.servers || (Array.isArray(data) ? data : null);
        if (serverList) {
          for (const srv of serverList) {
            try {
              await apiService.addServer(srv);
            } catch (err) {
              console.warn('Import skip server:', srv.name, err.message);
            }
          }
          setSuccess(`Imported ${serverList.length} servers!`);
          setTimeout(() => setSuccess(null), 3000);
          loadServers();
        } else {
          setError('Invalid server file format');
        }
      } catch (err) {
        setError('Failed to import servers: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const getCountryFlag = (countryCode) => {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    const codePoints = countryCode.toUpperCase().split('').map(char => 
      127397 + char.charCodeAt(0)
    );
    return String.fromCodePoint(...codePoints);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Server Management</h2>
          <p className="text-gray-600 mt-1">Manage VPN servers and configurations</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadServers}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={exportServers}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2"
          >
            <FaDownload />
            Export
          </button>
          <label className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-2 cursor-pointer">
            <FaUpload />
            Import
            <input type="file" accept=".json" onChange={importServers} className="hidden" />
          </label>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus />
            Add Server
          </button>
        </div>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2"
          >
            <FaExclamationTriangle />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <FaTimes />
            </button>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2"
          >
            <FaCheck />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(showAddForm || editingServer) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
          >
            <h3 className="text-xl font-bold mb-4">
              {editingServer ? 'Edit Server' : 'Add New Server'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Server Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Canada Server"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IP Address
                </label>
                <input
                  type="text"
                  value={formData.ip_address}
                  onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="51.222.9.219"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="CA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country Code
                </label>
                <input
                  type="text"
                  value={formData.country_code}
                  onChange={(e) => setFormData({ ...formData, country_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="CA"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Montreal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Montreal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingServer(null);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={editingServer ? handleUpdateServer : handleAddServer}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FaSave />
                {editingServer ? 'Update' : 'Add'} Server
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Servers List */}
      <div className="grid gap-4">
        {servers.map((server) => (
          <motion.div
            key={server.id}
            layout
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="text-4xl">
                  {getCountryFlag(server.country_code)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{server.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      server.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : server.status === 'inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {server.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaGlobe className="text-gray-400" />
                      <span>{server.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaNetworkWired className="text-gray-400" />
                      <span>{server.ip_address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaServer className="text-gray-400" />
                      <span>Capacity: {server.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Load:</span>
                      <span>{server.current_load || 0}/{server.capacity}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {server.protocols.map((protocol) => (
                      <span
                        key={protocol}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                      >
                        {protocol}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleStatus(server.id)}
                  className={`p-2 rounded-lg ${
                    server.status === 'active'
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  title={server.status === 'active' ? 'Deactivate' : 'Activate'}
                >
                  <FaCheck />
                </button>
                <button
                  onClick={() => startEdit(server)}
                  className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteServer(server.id)}
                  className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {servers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FaServer className="mx-auto text-6xl mb-4 opacity-20" />
          <p className="text-lg">No servers configured</p>
          <p className="text-sm">Click "Add Server" to get started</p>
        </div>
      )}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

export default ServerManager;
