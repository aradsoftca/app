import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import {
  FaServer,
  FaMapMarkerAlt,
  FaGlobe,
  FaNetworkWired,
  FaUsers,
  FaCheckCircle,
  FaExclamationTriangle,
  FaKey,
  FaTerminal,
  FaShieldAlt,
  FaCog,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import { apiService } from '../../../services/api';

/**
 * Comprehensive Server Management Modal
 * Manages ALL 25+ DB columns organized in tabbed sections:
 *  - Basic Info: name, location, country_code, ip_address, capacity, status
 *  - Protocols & Ports: protocol toggles + per-protocol port config
 *  - SSH Config: ssh_host, ssh_port, ssh_user, key/password
 *  - Advanced: REALITY keys, WireGuard pubkey, V2Ray UUID, bandwidth
 */
const ServerModal = ({ isOpen, onClose, server, onSuccess }) => {
  const isEditMode = !!server;
  const [activeSection, setActiveSection] = useState('basic');
  const [showSshKey, setShowSshKey] = useState(false);
  const [showSshPassword, setShowSshPassword] = useState(false);
  
  const defaultForm = {
    // Basic
    name: '', location: '', country_code: '', ip_address: '',
    capacity: 250, status: 'active',
    // Protocols
    protocols: ['shadowsocks', 'trojan', 'v2ray', 'hysteria'],
    // Ports
    ss_port: 8388, ss_api_port: 8389,
    trojan_api_port: 10443,
    v2ray_api_port: 9443,
    xray_api_port: 0,
    // SSH
    ssh_host: '', ssh_port: 22, ssh_user: 'root',
    ssh_private_key: '', ssh_password: '',
    // Advanced
    wireguard_public_key: '',
    v2ray_uuid: '',
    reality_server_name: '',
    reality_public_key: '',
    reality_short_id: '',
    bandwidth_limit: 0,
  };

  const [formData, setFormData] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Populate form when server prop changes
  useEffect(() => {
    if (server) {
      setFormData({
        name: server.name || '',
        location: server.location || '',
        country_code: server.country_code || '',
        ip_address: server.ip_address || '',
        capacity: server.capacity || 250,
        status: server.status || 'active',
        protocols: server.protocols || ['shadowsocks'],
        ss_port: server.ss_port || 8388,
        ss_api_port: server.ss_api_port || 8389,
        trojan_api_port: server.trojan_api_port || 10443,
        v2ray_api_port: server.v2ray_api_port || 9443,
        xray_api_port: server.xray_api_port || 0,
        ssh_host: server.ssh_host || '',
        ssh_port: server.ssh_port || 22,
        ssh_user: server.ssh_user || 'root',
        ssh_private_key: '', // Never pre-filled (security)
        ssh_password: '',    // Never pre-filled (security)
        wireguard_public_key: server.wireguard_public_key || '',
        v2ray_uuid: server.v2ray_uuid || '',
        reality_server_name: server.reality_server_name || '',
        reality_public_key: server.reality_public_key || '',
        reality_short_id: server.reality_short_id || '',
        bandwidth_limit: server.bandwidth_limit || 0,
      });
    } else {
      setFormData(defaultForm);
    }
    setActiveSection('basic');
    setError(null);
    setSuccess(false);
  }, [server, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const toggleProtocol = (protocol) => {
    setFormData((prev) => ({
      ...prev,
      protocols: prev.protocols.includes(protocol)
        ? prev.protocols.filter((p) => p !== protocol)
        : [...prev.protocols, protocol],
    }));
  };

  const validateIP = (ip) => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;
    return ip.split('.').every((p) => parseInt(p) >= 0 && parseInt(p) <= 255);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return setError('Server name is required') || false;
    if (!formData.location.trim()) return setError('Location is required') || false;
    if (!formData.country_code.trim() || formData.country_code.length !== 2)
      return setError('Country code must be 2 characters') || false;
    if (!validateIP(formData.ip_address)) return setError('Invalid IP address') || false;
    if (formData.capacity < 1) return setError('Capacity must be at least 1') || false;
    if (formData.protocols.length === 0) return setError('Select at least one protocol') || false;
    return true;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    // Build payload — only send non-empty SSH fields in edit mode
    const payload = { ...formData };
    if (isEditMode) {
      if (!payload.ssh_private_key) delete payload.ssh_private_key;
      if (!payload.ssh_password) delete payload.ssh_password;
    }

    try {
      if (isEditMode) {
        await apiService.updateServer(server.id, payload);
      } else {
        await apiService.addServer(payload);
      }
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 800);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'add'} server`);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic', icon: FaServer },
    { id: 'protocols', label: 'Protocols', icon: FaShieldAlt },
    { id: 'ssh', label: 'SSH', icon: FaTerminal },
    { id: 'advanced', label: 'Advanced', icon: FaCog },
  ];

  const protocolOptions = [
    { value: 'shadowsocks', label: 'Shadowsocks', color: 'text-blue-400' },
    { value: 'trojan', label: 'Trojan', color: 'text-purple-400' },
    { value: 'v2ray', label: 'V2Ray/VMess', color: 'text-green-400' },
    { value: 'vless', label: 'VLESS+Reality', color: 'text-cyan-400' },
    { value: 'wireguard', label: 'WireGuard', color: 'text-yellow-400' },
    { value: 'hysteria', label: 'Hysteria', color: 'text-orange-400' },
  ];

  const inputCls = 'w-full px-4 py-2.5 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm';
  const labelCls = 'block text-sm font-semibold text-gray-300 mb-1.5';

  return (
    <Modal isOpen={isOpen} onClose={onClose}
      title={isEditMode ? `Edit: ${server?.name}` : 'Add New Server'} size="xl"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} disabled={success}>
            {success ? 'Saved!' : isEditMode ? 'Update Server' : 'Add Server'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Alerts */}
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-3">
            <p className="text-green-400 text-sm flex items-center">
              <FaCheckCircle className="mr-2" />
              Server {isEditMode ? 'updated' : 'added'} successfully!
            </p>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex gap-1 bg-black bg-opacity-20 p-1 rounded-lg">
          {sections.map((s) => (
            <button key={s.id} type="button" onClick={() => setActiveSection(s.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                activeSection === s.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-white hover:bg-white hover:bg-opacity-5'
              }`}
            >
              <s.icon className="text-xs" />
              {s.label}
            </button>
          ))}
        </div>

        {/* ========== BASIC INFO ========== */}
        {activeSection === 'basic' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Server Name *</label>
                <input type="text" value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={inputCls} placeholder="Canada OVH" required />
              </div>
              <div>
                <label className={labelCls}>IP Address *</label>
                <input type="text" value={formData.ip_address}
                  onChange={(e) => handleChange('ip_address', e.target.value)}
                  className={`${inputCls} font-mono`} placeholder="51.222.9.219" required />
              </div>
              <div>
                <label className={labelCls}>Location *</label>
                <input type="text" value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className={inputCls} placeholder="Montreal, Canada" required />
              </div>
              <div>
                <label className={labelCls}>Country Code *</label>
                <input type="text" value={formData.country_code}
                  onChange={(e) => handleChange('country_code', e.target.value.toUpperCase())}
                  className={`${inputCls} uppercase`} placeholder="CA" maxLength={2} required />
                <p className="text-xs text-gray-500 mt-1">ISO 3166 (US, CA, FR, DE...)</p>
              </div>
              <div>
                <label className={labelCls}>Capacity (Max Users)</label>
                <input type="number" value={formData.capacity}
                  onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 0)}
                  className={inputCls} min="1" max="10000" />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className={inputCls}>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ========== PROTOCOLS & PORTS ========== */}
        {activeSection === 'protocols' && (
          <div className="space-y-5">
            <div>
              <label className={labelCls}>Enabled Protocols</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {protocolOptions.map((p) => {
                  const on = formData.protocols.includes(p.value);
                  return (
                    <button key={p.value} type="button" onClick={() => toggleProtocol(p.value)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        on ? 'border-blue-500 bg-blue-500 bg-opacity-10' : 'border-white border-opacity-10 hover:border-opacity-30'
                      }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${on ? 'bg-green-400' : 'bg-gray-600'}`} />
                        <span className={`text-sm font-semibold ${on ? p.color : 'text-gray-500'}`}>{p.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white border-opacity-10 pt-4">
              <label className={labelCls}>Protocol Ports</label>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Shadowsocks Port</label>
                  <input type="number" value={formData.ss_port}
                    onChange={(e) => handleChange('ss_port', parseInt(e.target.value) || 0)}
                    className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-gray-500">SS API Port</label>
                  <input type="number" value={formData.ss_api_port}
                    onChange={(e) => handleChange('ss_api_port', parseInt(e.target.value) || 0)}
                    className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Trojan API Port</label>
                  <input type="number" value={formData.trojan_api_port}
                    onChange={(e) => handleChange('trojan_api_port', parseInt(e.target.value) || 0)}
                    className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-gray-500">V2Ray API Port</label>
                  <input type="number" value={formData.v2ray_api_port}
                    onChange={(e) => handleChange('v2ray_api_port', parseInt(e.target.value) || 0)}
                    className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-gray-500">XRay API Port</label>
                  <input type="number" value={formData.xray_api_port}
                    onChange={(e) => handleChange('xray_api_port', parseInt(e.target.value) || 0)}
                    className={inputCls} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== SSH CONFIG ========== */}
        {activeSection === 'ssh' && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">SSH credentials for remote server management. Used for health checks and configuration deployment.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>SSH Host</label>
                <input type="text" value={formData.ssh_host}
                  onChange={(e) => handleChange('ssh_host', e.target.value)}
                  className={`${inputCls} font-mono`} placeholder="Same as IP if empty" />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use server IP</p>
              </div>
              <div>
                <label className={labelCls}>SSH Port</label>
                <input type="number" value={formData.ssh_port}
                  onChange={(e) => handleChange('ssh_port', parseInt(e.target.value) || 22)}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>SSH User</label>
                <input type="text" value={formData.ssh_user}
                  onChange={(e) => handleChange('ssh_user', e.target.value)}
                  className={inputCls} placeholder="root" />
              </div>
            </div>

            <div className="border-t border-white border-opacity-10 pt-4">
              <label className={labelCls}>
                SSH Private Key {isEditMode && server?.has_ssh_key && <span className="text-green-400 text-xs font-normal ml-2">(key stored)</span>}
              </label>
              <div className="relative">
                <textarea value={formData.ssh_private_key}
                  onChange={(e) => handleChange('ssh_private_key', e.target.value)}
                  className={`${inputCls} font-mono text-xs h-28 resize-none`}
                  placeholder={isEditMode ? 'Leave empty to keep existing key' : '-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----'}
                  style={{ fontFamily: 'monospace' }} />
              </div>
            </div>

            <div>
              <label className={labelCls}>
                SSH Password {isEditMode && server?.has_ssh_password && <span className="text-green-400 text-xs font-normal ml-2">(password stored)</span>}
              </label>
              <div className="relative">
                <input type={showSshPassword ? 'text' : 'password'} value={formData.ssh_password}
                  onChange={(e) => handleChange('ssh_password', e.target.value)}
                  className={`${inputCls} pr-10 font-mono`}
                  placeholder={isEditMode ? 'Leave empty to keep existing' : 'Enter SSH password'} />
                <button type="button" onClick={() => setShowSshPassword(!showSshPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showSshPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== ADVANCED ========== */}
        {activeSection === 'advanced' && (
          <div className="space-y-4">
            <div className="border border-white border-opacity-10 rounded-lg p-4">
              <h4 className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-2">
                <FaShieldAlt /> VLESS + REALITY
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Server Name (SNI)</label>
                  <input type="text" value={formData.reality_server_name}
                    onChange={(e) => handleChange('reality_server_name', e.target.value)}
                    className={inputCls} placeholder="www.google.com" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Short ID</label>
                  <input type="text" value={formData.reality_short_id}
                    onChange={(e) => handleChange('reality_short_id', e.target.value)}
                    className={`${inputCls} font-mono`} placeholder="abcdef01" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500">Public Key</label>
                  <input type="text" value={formData.reality_public_key}
                    onChange={(e) => handleChange('reality_public_key', e.target.value)}
                    className={`${inputCls} font-mono text-xs`} placeholder="Base64 public key..." />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-white border-opacity-10 rounded-lg p-4">
                <h4 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
                  <FaKey /> WireGuard
                </h4>
                <label className="text-xs text-gray-500">Public Key</label>
                <input type="text" value={formData.wireguard_public_key}
                  onChange={(e) => handleChange('wireguard_public_key', e.target.value)}
                  className={`${inputCls} font-mono text-xs`} placeholder="Base64 WG public key..." />
              </div>

              <div className="border border-white border-opacity-10 rounded-lg p-4">
                <h4 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
                  <FaNetworkWired /> V2Ray
                </h4>
                <label className="text-xs text-gray-500">UUID</label>
                <input type="text" value={formData.v2ray_uuid}
                  onChange={(e) => handleChange('v2ray_uuid', e.target.value)}
                  className={`${inputCls} font-mono text-xs`} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
              </div>
            </div>

            <div>
              <label className={labelCls}>Bandwidth Limit (Mbps)</label>
              <input type="number" value={formData.bandwidth_limit}
                onChange={(e) => handleChange('bandwidth_limit', parseInt(e.target.value) || 0)}
                className={inputCls} min="0" />
              <p className="text-xs text-gray-500 mt-1">0 = unlimited</p>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default ServerModal;
