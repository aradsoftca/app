import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaMobileAlt,
  FaDesktop,
  FaTabletAlt,
  FaShieldAlt,
  FaTrash,
  FaSignOutAlt,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';
import api from '../../services/api';
import useConfirm from '../../hooks/useConfirm';
import ConfirmDialog from '../common/ConfirmDialog';

const MAX_DEVICES = 3;

const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [deviceLimit, setDeviceLimit] = useState(null);
  const { confirm, dialogProps } = useConfirm();

  useEffect(() => {
    fetchDevices();
    fetchDeviceLimit();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/devices');
      setDevices(response.data.devices);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      setError('Failed to load devices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceLimit = async () => {
    try {
      const response = await api.get('/api/devices/limit');
      setDeviceLimit(response.data);
    } catch (e) { /* non-critical */ }
  };

  const getDeviceIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'mobile':
      case 'android':
      case 'ios':
        return <FaMobileAlt className="text-3xl text-blue-500" />;
      case 'tablet':
        return <FaTabletAlt className="text-3xl text-purple-500" />;
      default:
        return <FaDesktop className="text-3xl text-gray-500" />;
    }
  };

  const toggleTrust = async (deviceId, currentTrust) => {
    try {
      setActionError(null);
      await api.put(`/api/devices/${deviceId}/trust`, {
        is_trusted: !currentTrust
      });
      fetchDevices();
    } catch (error) {
      console.error('Failed to toggle trust:', error);
      setActionError('Failed to update device trust status.');
    }
  };

  const logoutDevice = async (deviceId) => {
    const ok = await confirm({
      title: 'Logout Device',
      message: 'Are you sure you want to logout this device?',
      confirmText: 'Logout',
      variant: 'warning',
    });
    if (!ok) return;

    try {
      setActionError(null);
      await api.post(`/api/devices/${deviceId}/logout`);
      fetchDevices();
    } catch (error) {
      console.error('Failed to logout device:', error);
      setActionError('Failed to logout device.');
    }
  };

  const removeDevice = async (deviceId) => {
    const ok = await confirm({
      title: 'Remove Device',
      message: 'Are you sure you want to remove this device? This action cannot be undone.',
      confirmText: 'Remove',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      setActionError(null);
      await api.delete(`/api/devices/${deviceId}`);
      fetchDevices();
    } catch (error) {
      console.error('Failed to remove device:', error);
      setActionError('Failed to remove device.');
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaDesktop className="text-blue-400" />
            Device Management
          </h1>
          <p className="text-gray-400 mt-1">Manage your logged-in devices and security settings</p>
        </div>

        {(error || actionError) && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error || actionError}
          </div>
        )}

        {/* Device Limit Bar */}
        {(() => {
          const activeCount = devices.filter(d => d.is_active).length;
          const atLimit = activeCount >= MAX_DEVICES;
          return (
            <div className={`rounded-lg shadow-sm p-6 mb-6 ${atLimit ? 'bg-red-900/30 border border-red-500/50' : 'bg-gray-800'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {atLimit && <FaExclamationTriangle className="text-red-400" />}
                  <span className="text-gray-300 font-medium">Active Devices</span>
                </div>
                <span className={`text-lg font-bold ${atLimit ? 'text-red-400' : 'text-white'}`}>
                  {activeCount} / {MAX_DEVICES}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    atLimit ? 'bg-red-500' : activeCount >= 2 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (activeCount / MAX_DEVICES) * 100)}%` }}
                />
              </div>
              {atLimit && (
                <p className="text-red-300 text-sm mt-2">
                  You've reached the maximum device limit. Log out or remove a device to use a new one.
                </p>
              )}
              <div className="flex items-center justify-between mt-3">
                <div>
                  <span className="text-gray-500 text-sm">Total: </span>
                  <span className="text-white text-sm font-medium">{devices.length}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Trusted: </span>
                  <span className="text-blue-400 text-sm font-medium">{devices.filter(d => d.is_trusted).length}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Devices Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading devices...</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <FaDesktop className="text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No devices found</h3>
            <p className="text-gray-400">Your devices will appear here once you log in</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-gray-800 rounded-lg shadow-sm p-6 border-2 ${
                  device.is_active ? 'border-green-500' : 'border-gray-700'
                }`}
              >
                {/* Device Icon and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(device.device_type)}
                    <div>
                      <h3 className="font-semibold text-white">{device.device_name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{device.device_type}</p>
                    </div>
                  </div>
                  {device.is_trusted && (
                    <FaShieldAlt className="text-blue-500" title="Trusted Device" />
                  )}
                </div>

                {/* Device Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">OS Version:</span>
                    <span className="font-medium text-white">{device.os_version || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">App Version:</span>
                    <span className="font-medium text-white">{device.app_version || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Last IP:</span>
                    <span className="font-medium text-white">{device.last_ip || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FaClock className="text-gray-500" />
                    <span className="text-gray-400">
                      Last seen: {getTimeAgo(device.last_seen_at)}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    device.is_active
                      ? 'bg-green-900 text-green-300'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {device.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleTrust(device.id, device.is_trusted)}
                    className={`flex-1 px-4 py-2 rounded-lg transition text-sm font-medium ${
                      device.is_trusted
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {device.is_trusted ? 'Untrust' : 'Trust'}
                  </button>
                  {device.is_active && (
                    <button
                      onClick={() => logoutDevice(device.id)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                      title="Logout Device"
                    >
                      <FaSignOutAlt />
                    </button>
                  )}
                  <button
                    onClick={() => removeDevice(device.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    title="Remove Device"
                  >
                    <FaTrash />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-300 mb-2">Device Security</h4>
          <ul className="text-sm text-blue-400 space-y-1">
            <li>• Maximum {MAX_DEVICES} devices can be active at the same time</li>
            <li>• Log out from old devices to free up device slots</li>
            <li>• Trust only devices you personally use</li>
            <li>• Keep your app updated to the latest version</li>
          </ul>
        </div>
      </div>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

export default DeviceManagement;
