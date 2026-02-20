import React, { useState, useEffect } from 'react';
import {
  FaEnvelope,
  FaCreditCard,
  FaGoogle,
  FaShieldAlt,
  FaServer,
  FaDatabase,
  FaMobileAlt,
  FaExclamationTriangle,
  FaPaperPlane,
  FaSpinner,
  FaBell,
  FaCalendarAlt,
  FaUsers,
  FaSyncAlt,
  FaPlay,
  FaRedo,
  FaCheckCircle,
  FaTimesCircle,
  FaBullhorn
} from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import { apiService } from '../../services/api';
import useConfirm from '../../hooks/useConfirm';
import ConfirmDialog from '../common/ConfirmDialog';

const SystemSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('app');

  const tabs = [
    { id: 'app', name: 'Mobile App', icon: FaMobileAlt },
    { id: 'subscriptions', name: 'Subscriptions', icon: FaBell },
    { id: 'email', name: 'Email', icon: FaEnvelope },
    { id: 'stripe', name: 'Stripe', icon: FaCreditCard },
    { id: 'oauth', name: 'OAuth', icon: FaGoogle },
    { id: 'vpn', name: 'VPN', icon: FaServer },
    { id: 'security', name: 'Security', icon: FaShieldAlt },
    { id: 'backup', name: 'Backup', icon: FaDatabase },
    { id: 'ads', name: 'Ads', icon: FaBullhorn },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSystemSettings();
      // Convert array of {key, value} to object
      const settingsMap = {};
      response.data.forEach(item => {
        // Parse booleans and numbers
        if (item.value === 'true') settingsMap[item.key] = true;
        else if (item.value === 'false') settingsMap[item.key] = false;
        else if (!isNaN(item.value) && item.value.trim() !== '') settingsMap[item.key] = item.value;
        else settingsMap[item.key] = item.value;
      });
      setSettings(settingsMap);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (key, value) => {
    try {
      setSaving(true);
      await apiService.updateSystemSetting(key, value);
      setMessage({ type: 'success', text: 'Setting updated successfully' });

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to save setting:', error);
      setMessage({ type: 'error', text: 'Failed to save setting' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-white text-center py-10">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">System Settings</h2>
        {message.text && (
          <div className={`px-4 py-2 rounded-lg ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-black bg-opacity-30 p-2 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-lg transition whitespace-nowrap ${activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
              }`}
          >
            <tab.icon className="mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* App Configuration (Mobile App) */}
      {activeTab === 'app' && (
        <Card className="p-6">
          <h3 className="text-2xl font-bold text-white mb-6">Mobile App Configuration</h3>
          <div className="space-y-6">

            {/* Maintenance Mode */}
            <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-red-400 font-bold text-lg">
                  <FaExclamationTriangle className="mr-2" />
                  Maintenance Mode
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenance_mode || false}
                    onChange={(e) => {
                      handleChange('maintenance_mode', e.target.checked);
                      handleSave('maintenance_mode', e.target.checked);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
              <p className="text-gray-300 text-sm">
                If enabled, the mobile app will block user access and show a "Under Maintenance" screen. Use this during server upgrades.
              </p>
            </div>

            {/* Min Version */}
            <div>
              <label className="block text-gray-300 mb-2">Minimum App Version</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={settings.min_app_version || '1.0.0'}
                  onChange={(e) => handleChange('min_app_version', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 1.0.5"
                />
                <Button
                  variant="primary"
                  onClick={() => handleSave('min_app_version', settings.min_app_version)}
                  disabled={saving}
                >
                  Save
                </Button>
              </div>
              <p className="text-gray-400 text-sm mt-1">Users with older versions will be forced to update.</p>
            </div>

            {/* Support Email */}
            <div>
              <label className="block text-gray-300 mb-2">Support Email</label>
              <div className="flex gap-4">
                <input
                  type="email"
                  value={settings.support_email || ''}
                  onChange={(e) => handleChange('support_email', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  variant="primary"
                  onClick={() => handleSave('support_email', settings.support_email)}
                  disabled={saving}
                >
                  Save
                </Button>
              </div>
            </div>

            {/* Privacy Policy */}
            <div>
              <label className="block text-gray-300 mb-2">Privacy Policy URL</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={settings.privacy_policy_url || ''}
                  onChange={(e) => handleChange('privacy_policy_url', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  variant="primary"
                  onClick={() => handleSave('privacy_policy_url', settings.privacy_policy_url)}
                  disabled={saving}
                >
                  Save
                </Button>
              </div>
            </div>

          </div>
        </Card>
      )}

      {/* Email Settings */}
      {activeTab === 'email' && (
        <EmailSettingsPanel />
      )}

      {/* Subscription Reminder Settings */}
      {activeTab === 'subscriptions' && (
        <SubscriptionSettingsPanel />
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <Card className="p-6">
          <h3 className="text-2xl font-bold text-white mb-6">Security Configuration</h3>
          <div className="space-y-4">

            {/* Free User Limit */}
            <div>
              <label className="block text-gray-300 mb-2">Max Connections (Free Tier)</label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={settings.free_tier_limit || '1'}
                  onChange={(e) => handleChange('free_tier_limit', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  variant="primary"
                  onClick={() => handleSave('free_tier_limit', settings.free_tier_limit)}
                  disabled={saving}
                >
                  Save
                </Button>
              </div>
            </div>

            {/* Server Capacity */}
            <div>
              <label className="block text-gray-300 mb-2">Server Capacity Limit</label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={settings.server_capacity_limit || '250'}
                  onChange={(e) => handleChange('server_capacity_limit', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  variant="primary"
                  onClick={() => handleSave('server_capacity_limit', settings.server_capacity_limit)}
                  disabled={saving}
                >
                  Save
                </Button>
              </div>
              <p className="text-gray-400 text-sm mt-1">Global default capacity for new servers.</p>
            </div>

            <div className="bg-green-600 bg-opacity-20 border border-green-500 rounded-lg p-4 mt-6">
              <p className="text-green-200 text-sm">
                <strong>Current Security Status:</strong>
              </p>
              <ul className="text-green-200 text-sm mt-2 space-y-1">
                <li>✓ JWT Authentication Active</li>
                <li>✓ Password Hashing (bcrypt)</li>
                <li>✓ Rate Limiting Enabled</li>
                <li>✓ CORS Configured</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Other tabs placeholders */}
      {activeTab === 'stripe' && (
        <Card className="p-6">
          <h3 className="text-2xl font-bold text-white mb-6">Stripe Configuration</h3>
          <div className="space-y-4">
            <div className="bg-blue-600 bg-opacity-20 border border-blue-500 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                <strong>Note:</strong> Stripe API keys must be configured in the backend <code>.env</code> file for security. Never expose keys in the admin UI.
              </p>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Stripe Mode</label>
              <div className="flex gap-4">
                <input type="text" readOnly value={settings.stripe_mode || 'test'}
                  className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none"
                />
              </div>
              <p className="text-gray-400 text-sm mt-1">Change in .env: STRIPE_SECRET_KEY (sk_test_ vs sk_live_)</p>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Success Redirect URL</label>
              <div className="flex gap-4">
                <input type="text" value={settings.stripe_success_url || 'https://vpn-xo.com/payment-success'}
                  onChange={(e) => handleChange('stripe_success_url', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <Button variant="primary" onClick={() => handleSave('stripe_success_url', settings.stripe_success_url)} disabled={saving}>Save</Button>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Cancel Redirect URL</label>
              <div className="flex gap-4">
                <input type="text" value={settings.stripe_cancel_url || 'https://vpn-xo.com/payment-cancel'}
                  onChange={(e) => handleChange('stripe_cancel_url', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <Button variant="primary" onClick={() => handleSave('stripe_cancel_url', settings.stripe_cancel_url)} disabled={saving}>Save</Button>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Webhook Endpoint</label>
              <input type="text" readOnly value="/api/subscriptions/webhook"
                className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10 text-gray-400" />
              <p className="text-gray-400 text-sm mt-1">Configure this in Stripe Dashboard → Developers → Webhooks</p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'oauth' && (
        <Card className="p-6">
          <h3 className="text-2xl font-bold text-white mb-6">OAuth Configuration</h3>
          <div className="space-y-4">
            <div className="bg-blue-600 bg-opacity-20 border border-blue-500 rounded-lg p-4">
              <p className="text-blue-200 text-sm"><strong>Note:</strong> OAuth credentials must be set in backend <code>.env</code> for security.</p>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Google OAuth Status</label>
              <div className="bg-green-600 bg-opacity-20 border border-green-500 rounded-lg p-3">
                <p className="text-green-200 text-sm">✓ Google OAuth is configured and active</p>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Google OAuth Callback URL</label>
              <input type="text" readOnly value="https://api.vpn-xo.com/api/auth/google/callback"
                className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10 text-gray-400" />
              <p className="text-gray-400 text-sm mt-1">Set this in Google Cloud Console → Authorized redirect URIs</p>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Allowed Login Methods</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center text-gray-300"><input type="checkbox" checked readOnly className="mr-2" /> Email/Password</label>
                <label className="flex items-center text-gray-300"><input type="checkbox" checked readOnly className="mr-2" /> Google OAuth</label>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'vpn' && (
        <Card className="p-6">
          <h3 className="text-2xl font-bold text-white mb-6">VPN Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Default Protocol</label>
              <div className="flex gap-4">
                <select value={settings.default_protocol || 'shadowsocks'}
                  onChange={(e) => handleChange('default_protocol', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="shadowsocks">Shadowsocks</option>
                  <option value="trojan">Trojan</option>
                  <option value="v2ray">V2Ray (VMess)</option>
                  <option value="vless">VLESS + Reality</option>
                  <option value="wireguard">WireGuard</option>
                  <option value="hysteria2">Hysteria2</option>
                </select>
                <Button variant="primary" onClick={() => handleSave('default_protocol', settings.default_protocol)} disabled={saving}>Save</Button>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Max Devices (Premium)</label>
              <div className="flex gap-4">
                <input type="number" value={settings.max_devices_premium || '5'}
                  onChange={(e) => handleChange('max_devices_premium', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <Button variant="primary" onClick={() => handleSave('max_devices_premium', settings.max_devices_premium)} disabled={saving}>Save</Button>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Max Devices (Free)</label>
              <div className="flex gap-4">
                <input type="number" value={settings.max_devices_free || '1'}
                  onChange={(e) => handleChange('max_devices_free', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <Button variant="primary" onClick={() => handleSave('max_devices_free', settings.max_devices_free)} disabled={saving}>Save</Button>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Connection Timeout (seconds)</label>
              <div className="flex gap-4">
                <input type="number" value={settings.connection_timeout || '30'}
                  onChange={(e) => handleChange('connection_timeout', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <Button variant="primary" onClick={() => handleSave('connection_timeout', settings.connection_timeout)} disabled={saving}>Save</Button>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Heartbeat Interval (seconds)</label>
              <div className="flex gap-4">
                <input type="number" value={settings.heartbeat_interval || '120'}
                  onChange={(e) => handleChange('heartbeat_interval', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <Button variant="primary" onClick={() => handleSave('heartbeat_interval', settings.heartbeat_interval)} disabled={saving}>Save</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'backup' && (
        <Card className="p-6">
          <h3 className="text-2xl font-bold text-white mb-6">Backup & Recovery</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Auto-Backup</label>
              <div className="flex items-center justify-between bg-white bg-opacity-5 rounded-lg p-4">
                <div>
                  <p className="text-white font-medium">Enable Automatic Database Backups</p>
                  <p className="text-gray-400 text-sm">Backs up PostgreSQL database daily</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.auto_backup || false}
                    onChange={(e) => { handleChange('auto_backup', e.target.checked); handleSave('auto_backup', e.target.checked); }}
                    className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Backup Retention (days)</label>
              <div className="flex gap-4">
                <input type="number" value={settings.backup_retention_days || '30'}
                  onChange={(e) => handleChange('backup_retention_days', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <Button variant="primary" onClick={() => handleSave('backup_retention_days', settings.backup_retention_days)} disabled={saving}>Save</Button>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Backup Storage Path</label>
              <div className="flex gap-4">
                <input type="text" value={settings.backup_path || '/var/backups/vpnxo'}
                  onChange={(e) => handleChange('backup_path', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <Button variant="primary" onClick={() => handleSave('backup_path', settings.backup_path)} disabled={saving}>Save</Button>
              </div>
            </div>
            <div className="bg-yellow-600 bg-opacity-20 border border-yellow-500 rounded-lg p-4">
              <p className="text-yellow-200 text-sm"><strong>Tip:</strong> Configure pg_dump cron on the server: <code>0 2 * * * pg_dump vpnxo_production | gzip &gt; /var/backups/vpnxo/backup_$(date +%Y%m%d).sql.gz</code></p>
            </div>
          </div>
        </Card>
      )}

      {/* ────────────────────────────────────────────────────────────────────
           Ads Tab
           Controls the desktop ad box (Windows / macOS) and shows info
           about the mobile ad configuration (handled via ad SDK dashboards).
      ──────────────────────────────────────────────────────────────────── */}
      {activeTab === 'ads' && (
        <Card className="p-6">
          <h3 className="text-2xl font-bold text-white mb-2">Ad Configuration</h3>
          <p className="text-gray-400 text-sm mb-6">
            Desktop ad box is fully controlled here. Mobile ads (Android / iOS) are managed
            via your <strong style={{color:'#93c5fd'}}>AdMob dashboard</strong> (add mediation partners — AppLovin, Meta, etc. — directly
            inside AdMob Mediation). Update ad unit IDs in the app source code.
          </p>

          {/* ── Desktop Ad Box ────────────────────────────────────────── */}
          <div className="space-y-6">
            <div className="border border-white border-opacity-10 rounded-xl p-5">
              <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <FaBullhorn className="text-blue-400" />
                Desktop Ad Box (Windows &amp; macOS)
              </h4>
              <p className="text-gray-400 text-sm mb-5">
                Shows an image, animated GIF, or video ad below the connection button on Windows and macOS apps.
                Appears for all users unless you enable &ldquo;Hide for premium&rdquo;.
              </p>

              {/* Master toggle */}
              <div className="flex items-center justify-between bg-white bg-opacity-5 rounded-lg p-4 mb-4">
                <div>
                  <p className="text-white font-medium">Enable Desktop Ad Box</p>
                  <p className="text-gray-400 text-sm">Show the ad box on Windows / macOS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.ad_desktop_enabled || false}
                    onChange={(e) => { handleChange('ad_desktop_enabled', e.target.checked); handleSave('ad_desktop_enabled', e.target.checked); }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Media URL */}
              <div className="mb-4">
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  Media URL <span className="text-gray-500">(image, animated GIF, or video)</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={settings.ad_desktop_media_url || ''}
                    onChange={(e) => handleChange('ad_desktop_media_url', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://cdn.example.com/ad-banner.gif"
                  />
                  <Button variant="primary" onClick={() => handleSave('ad_desktop_media_url', settings.ad_desktop_media_url)} disabled={saving}>Save</Button>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Supported: .jpg .png .gif .mp4 .webm — GIFs auto-loop. Videos are muted and looped.
                </p>
              </div>

              {/* Media type override */}
              <div className="mb-4">
                <label className="block text-gray-300 mb-2 text-sm font-medium">Media Type Override</label>
                <div className="flex gap-3">
                  <select
                    value={settings.ad_desktop_media_type || ''}
                    onChange={(e) => handleChange('ad_desktop_media_type', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Auto-detect from URL</option>
                    <option value="image">Image (.jpg / .png)</option>
                    <option value="gif">Animated GIF</option>
                    <option value="video">Video (.mp4 / .webm)</option>
                  </select>
                  <Button variant="primary" onClick={() => handleSave('ad_desktop_media_type', settings.ad_desktop_media_type)} disabled={saving}>Save</Button>
                </div>
              </div>

              {/* Click URL */}
              <div className="mb-4">
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  Click-through URL <span className="text-gray-500">(optional)</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={settings.ad_desktop_click_url || ''}
                    onChange={(e) => handleChange('ad_desktop_click_url', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/promo"
                  />
                  <Button variant="primary" onClick={() => handleSave('ad_desktop_click_url', settings.ad_desktop_click_url)} disabled={saving}>Save</Button>
                </div>
                <p className="text-gray-500 text-xs mt-1">Opens in the user\'s browser when they click the ad. Leave blank to disable click-through.</p>
              </div>

              {/* Hide for premium toggle */}
              <div className="flex items-center justify-between bg-white bg-opacity-5 rounded-lg p-4">
                <div>
                  <p className="text-white font-medium">Hide for Premium Users</p>
                  <p className="text-gray-400 text-sm">If enabled, paid / admin users won\'t see the desktop ad box</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.ad_desktop_hide_premium || false}
                    onChange={(e) => { handleChange('ad_desktop_hide_premium', e.target.checked); handleSave('ad_desktop_hide_premium', e.target.checked); }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* ── Mobile Ads Info ────────────────────────────────────── */}
            <div className="border border-white border-opacity-10 rounded-xl p-5">
              <h4 className="text-white font-bold text-lg mb-3">Mobile Ads (Android &amp; iOS — Free Users)</h4>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="bg-white bg-opacity-5 rounded-lg p-4">
                  <p className="font-semibold text-white mb-1">Ad Logic</p>
                  <ul className="space-y-1 list-disc list-inside text-gray-400">
                    <li><strong className="text-white">1st connection:</strong> Free — no ad shown.</li>
                    <li><strong className="text-white">2nd connection:</strong> Rewarded video — user must watch to connect.</li>
                    <li><strong className="text-white">3rd+ connections:</strong> Interstitial ad shown before connecting.</li>
                    <li><strong className="text-white">Premium / admin users:</strong> Never see any ads.</li>
                  </ul>
                </div>
                <div className="bg-white bg-opacity-5 rounded-lg p-4">
                  <p className="font-semibold text-white mb-1">Ad Counter Reset</p>
                  <p className="text-gray-400">
                    The ad gate counter (<em>1st free → 2nd rewarded → 3rd+ interstitial</em>) automatically
                    resets to zero after <strong className="text-white">8 hours</strong> of inactivity.
                    Each user gets a fresh session every 8 hours.
                  </p>
                </div>
                <div className="bg-white bg-opacity-5 rounded-lg p-4">
                  <p className="font-semibold text-white mb-1">Ad Networks</p>
                  <p className="text-gray-400">
                    <strong className="text-white">AdMob</strong> is the primary SDK.
                    Add demand partners (AppLovin, Meta Audience Network, Unity Ads, etc.) through
                    <strong className="text-white"> AdMob Mediation</strong> — no extra Flutter packages needed.
                    Configure ad unit IDs in <code className="text-blue-300">lib/core/services/ad_service.dart</code>.
                  </p>
                </div>
                <div className="bg-white bg-opacity-5 rounded-lg p-4">
                  <p className="font-semibold text-white mb-2">Quick Links</p>
                  <div className="flex flex-wrap gap-3">
                    <a href="https://admob.google.com" target="_blank" rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 rounded text-white text-xs">
                      AdMob Dashboard
                    </a>
                    <a href="https://admob.google.com/home/mediation/" target="_blank" rel="noreferrer"
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 rounded text-white text-xs">
                      AdMob Mediation Setup
                    </a>
                  </div>
                </div>
                <div className="bg-yellow-900 bg-opacity-40 border border-yellow-600 rounded-lg p-4">
                  <p className="text-yellow-200 text-sm">
                    <strong>App Store / Play Store notes:</strong> iOS and Android app listings should
                    include <em>"No ads for Premium subscribers"</em> in the app description to comply
                    with store policies and set user expectations before purchase.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
};

// ========== Subscription Reminder Settings Panel ==========
const SubscriptionSettingsPanel = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [daysInput, setDaysInput] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [expiringUsers, setExpiringUsers] = useState(null);

  const { confirm: confirmDialog, dialogProps } = useConfirm();

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 5000);
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await apiService.getSubscriptionSettings();
      const d = res.data;
      setConfig(d);
      setDaysInput(d.reminder_days.join(', '));
      setReminderEnabled(d.reminder_enabled !== false);
    } catch (err) {
      console.error('Failed to load subscription settings:', err);
      showMsg('error', 'Failed to load subscription settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const days = daysInput
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n) && n > 0);

      if (days.length === 0) {
        showMsg('error', 'Enter at least one valid reminder day');
        return;
      }

      await apiService.updateSubscriptionSettings({
        reminder_days: days,
        reminder_enabled: reminderEnabled,
      });
      showMsg('success', 'Settings saved — will take effect on next cron run');
      await loadConfig();
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDryRun = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await apiService.testReminders(true);
      setTestResult(res.data);
      showMsg('success', `Dry run complete: ${res.data.would_send} emails would be sent`);
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Dry run failed');
    } finally {
      setTesting(false);
    }
  };

  const handleLiveRun = async () => {
    const ok = await confirmDialog({ title: 'Send Live Emails', message: 'This will send real emails to users with expiring subscriptions. Continue?', confirmText: 'Send Now', variant: 'warning' });
    if (!ok) return;
    try {
      setTesting(true);
      const res = await apiService.testReminders(false);
      setTestResult(null);
      showMsg('success', `Live run complete: ${res.data.sent} emails sent, ${res.data.skipped} skipped`);
      await loadConfig();
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Live run failed');
    } finally {
      setTesting(false);
    }
  };

  const handleResetDedup = async () => {
    const ok = await confirmDialog({ title: 'Reset Dedup Tracking', message: 'Reset dedup tracking for all users? This will allow re-sending all reminders.', confirmText: 'Reset', variant: 'danger' });
    if (!ok) return;
    try {
      setResetting(true);
      const res = await apiService.resetReminderDedup();
      showMsg('success', res.data.message);
      await loadConfig();
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Reset failed');
    } finally {
      setResetting(false);
    }
  };

  const handleLoadExpiring = async () => {
    try {
      const res = await apiService.getExpiringUsers(30);
      setExpiringUsers(res.data);
    } catch (err) {
      showMsg('error', 'Failed to load expiring users');
    }
  };

  const inputClass = "px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  if (loading) return <div className="text-gray-400 text-center py-10"><FaSpinner className="animate-spin inline mr-2" />Loading subscription settings...</div>;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card className="p-6">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <FaUsers className="text-blue-400" /> Subscription Overview
        </h3>
        {config?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-300">{config.stats.paid_users}</div>
              <div className="text-gray-400 text-sm mt-1">Paid Users</div>
            </div>
            <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-300">{config.stats.auto_renew_on}</div>
              <div className="text-gray-400 text-sm mt-1">Auto-Renew ON</div>
            </div>
            <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-yellow-300">{config.stats.auto_renew_off}</div>
              <div className="text-gray-400 text-sm mt-1">Auto-Renew OFF</div>
            </div>
            <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-300">{config.stats.expired_pending}</div>
              <div className="text-gray-400 text-sm mt-1">Expired Pending</div>
            </div>
          </div>
        )}
        {config?.stats && (
          <div className="flex gap-4 mt-4 text-sm">
            <span className="text-yellow-300">Expiring 7d: <strong>{config.stats.expiring_7d}</strong></span>
            <span className="text-orange-300">Expiring 3d: <strong>{config.stats.expiring_3d}</strong></span>
            <span className="text-red-300">Expiring 1d: <strong>{config.stats.expiring_1d}</strong></span>
          </div>
        )}
      </Card>

      {/* Reminder Configuration */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaBell className="text-yellow-400" /> Expiry Reminder Settings
          </h3>
          {msg.text && (
            <div className={`px-4 py-2 rounded-lg text-sm text-white ${msg.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
              {msg.text}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between bg-white bg-opacity-5 rounded-lg p-4">
            <div>
              <p className="text-white font-medium">Enable Expiry Reminders</p>
              <p className="text-gray-400 text-sm">Send email reminders to users before subscription expires</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Reminder Days */}
          <div>
            <label className="block text-gray-300 mb-2 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-400" /> Reminder Days Before Expiry
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={daysInput}
                onChange={(e) => setDaysInput(e.target.value)}
                placeholder="7, 3, 1"
                className={inputClass + ' flex-1'}
              />
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? <FaSpinner className="animate-spin mr-1" /> : <FaBell className="mr-1" />}
                Save
              </Button>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              Comma-separated days (e.g., <code className="text-gray-300">14, 7, 3, 1</code>). Users receive ONE email per threshold, never duplicates.
            </p>
          </div>

          {/* Current Schedule Info */}
          <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4">
            <p className="text-blue-200 text-sm">
              <strong>Schedule:</strong> {config?.cron_schedule || 'Daily at midnight UTC'}
            </p>
            <p className="text-blue-200 text-sm mt-1">
              <strong>Current reminders:</strong> {config?.reminder_days?.map(d => `${d} day${d > 1 ? 's' : ''}`).join(' → ') || 'Not configured'}
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Deduplication is built-in — each user receives at most one email per reminder threshold per subscription period.
              Auto-renew users whose Stripe renewal succeeds will NOT be downgraded.
            </p>
          </div>

          {/* Actions: Dry Run / Live / Reset */}
          <div className="border-t border-white border-opacity-10 pt-5">
            <h4 className="text-white font-bold mb-3">Manual Actions</h4>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={handleDryRun}
                disabled={testing}
                className="!bg-purple-700 hover:!bg-purple-600"
              >
                {testing ? <FaSpinner className="animate-spin mr-1" /> : <FaPlay className="mr-1" />}
                Dry Run (Preview)
              </Button>
              <Button
                variant="primary"
                onClick={handleLiveRun}
                disabled={testing}
              >
                {testing ? <FaSpinner className="animate-spin mr-1" /> : <FaPaperPlane className="mr-1" />}
                Send Now (Live)
              </Button>
              <Button
                variant="secondary"
                onClick={handleResetDedup}
                disabled={resetting}
                className="!bg-orange-700 hover:!bg-orange-600"
              >
                {resetting ? <FaSpinner className="animate-spin mr-1" /> : <FaRedo className="mr-1" />}
                Reset Dedup Tracking
              </Button>
              <Button
                variant="secondary"
                onClick={handleLoadExpiring}
                className="!bg-gray-700 hover:!bg-gray-600"
              >
                <FaUsers className="mr-1" /> View Expiring Users
              </Button>
            </div>
          </div>

          {/* Dry Run Results */}
          {testResult && (
            <div className="bg-purple-900 bg-opacity-20 border border-purple-600 rounded-lg p-4">
              <h4 className="text-purple-200 font-bold mb-2">Dry Run Results</h4>
              <div className="flex gap-4 mb-3 text-sm">
                <span className="text-green-300">Would Send: <strong>{testResult.would_send}</strong></span>
                <span className="text-gray-400">Would Skip: <strong>{testResult.would_skip}</strong></span>
                <span className="text-blue-300">Reminder Days: <strong>{testResult.reminder_days?.join(', ')}</strong></span>
              </div>
              {testResult.details?.length > 0 && (
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="text-gray-400">
                      <tr>
                        <th className="text-left py-1 px-2">Email</th>
                        <th className="text-center py-1 px-2">Days Left</th>
                        <th className="text-center py-1 px-2">Reminder</th>
                        <th className="text-center py-1 px-2">Last Sent</th>
                        <th className="text-center py-1 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      {testResult.details.map((d, i) => (
                        <tr key={i} className="border-t border-white border-opacity-5">
                          <td className="py-1 px-2">{d.email}</td>
                          <td className="text-center py-1 px-2">{d.days_until_expiry}</td>
                          <td className="text-center py-1 px-2">{d.matched_reminder_day}d</td>
                          <td className="text-center py-1 px-2">{d.last_reminder_sent ?? '—'}</td>
                          <td className="text-center py-1 px-2">
                            {d.would_send
                              ? <FaCheckCircle className="inline text-green-400" title="Will send" />
                              : <FaTimesCircle className="inline text-gray-500" title="Skipped (already sent)" />
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Expiring Users List */}
          {expiringUsers && (
            <div className="bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded-lg p-4">
              <h4 className="text-yellow-200 font-bold mb-2">
                Expiring Users ({expiringUsers.total} within {expiringUsers.days_window} days)
              </h4>
              {expiringUsers.users.length === 0 ? (
                <p className="text-gray-400 text-sm">No users with expiring subscriptions.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="text-gray-400">
                      <tr>
                        <th className="text-left py-1 px-2">Email</th>
                        <th className="text-center py-1 px-2">Plan</th>
                        <th className="text-center py-1 px-2">Expires</th>
                        <th className="text-center py-1 px-2">Days Left</th>
                        <th className="text-center py-1 px-2">Auto-Renew</th>
                        <th className="text-center py-1 px-2">Last Reminder</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      {expiringUsers.users.map((u, i) => (
                        <tr key={i} className="border-t border-white border-opacity-5">
                          <td className="py-1 px-2">{u.email}</td>
                          <td className="text-center py-1 px-2">{u.plan_type || '—'}</td>
                          <td className="text-center py-1 px-2">{u.subscription_end_date ? new Date(u.subscription_end_date).toLocaleDateString() : '—'}</td>
                          <td className="text-center py-1 px-2">
                            <span className={u.days_until_expiry <= 1 ? 'text-red-400 font-bold' : u.days_until_expiry <= 3 ? 'text-orange-400' : 'text-yellow-300'}>
                              {u.days_until_expiry}
                            </span>
                          </td>
                          <td className="text-center py-1 px-2">
                            {u.auto_renew
                              ? <span className="text-green-400">ON</span>
                              : <span className="text-red-400">OFF</span>
                            }
                          </td>
                          <td className="text-center py-1 px-2">{u.last_expiry_reminder_days ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Recent Logs */}
          {config?.recent_logs?.length > 0 && (
            <div className="border-t border-white border-opacity-10 pt-5">
              <h4 className="text-white font-bold mb-3">Recent Activity</h4>
              <div className="max-h-48 overflow-y-auto">
                {config.recent_logs.map((log, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-white border-opacity-5 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                      log.action === 'payment_failed' ? 'bg-red-800 text-red-200' :
                      log.action === 'subscription_expired' ? 'bg-orange-800 text-orange-200' :
                      'bg-blue-800 text-blue-200'
                    }`}>{log.action}</span>
                    <span className="text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                    <span className="text-gray-500 text-xs truncate">{JSON.stringify(log.details)?.slice(0, 80)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* How It Works */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaSyncAlt className="text-green-400" /> How Auto-Renewal Works
        </h3>
        <div className="space-y-3 text-gray-300 text-sm">
          <div className="bg-green-900 bg-opacity-20 border border-green-700 rounded-lg p-4">
            <p><strong className="text-green-300">Auto-Renewal = ON:</strong> Stripe automatically charges the user at the end of their billing period. No action needed — the user's subscription renews seamlessly.</p>
          </div>
          <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg p-4">
            <p><strong className="text-yellow-300">Auto-Renewal = OFF:</strong> When the subscription end date passes, the daily cron downgrades the user to free tier and sends a "subscription expired" email. Reminder emails are sent at the configured intervals before this happens.</p>
          </div>
          <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4">
            <p><strong className="text-red-300">Payment Failed:</strong> If Stripe cannot charge the renewal, a "payment failed" email is sent automatically via webhook. The user keeps access until Stripe exhausts retry attempts, then the subscription is cancelled.</p>
          </div>
          <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4">
            <p><strong className="text-blue-300">Deduplication:</strong> Each user receives only one email per reminder threshold per subscription period (e.g., one "7 days left" email, one "3 days left" email). The tracker resets when a subscription expires or renews.</p>
          </div>
        </div>
      </Card>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

// ========== Email Settings Panel (Postal + SMTP unified) ==========
const EmailSettingsPanel = () => {
  const [config, setConfig] = useState({
    provider: 'postal',
    postal_api_url: '', postal_api_key: '',
    smtp_host: '', smtp_port: 587, smtp_secure: false, smtp_user: '', smtp_password: '',
    from_name: '', from_email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 5000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiService.getEmailConfig();
        const d = res.data;
        setConfig({
          provider: d.provider || 'postal',
          postal_api_url: d.postal_api_url || '',
          postal_api_key: d.has_postal_key ? d.postal_api_key : '',
          smtp_host: d.smtp_host || '',
          smtp_port: d.smtp_port || 587,
          smtp_secure: d.smtp_secure || false,
          smtp_user: d.smtp_user || '',
          smtp_password: d.has_smtp_password ? '••••••••' : '',
          from_name: d.from_name || '',
          from_email: d.from_email || '',
        });
      } catch (err) {
        console.error('Failed to load email config:', err);
        showMsg('error', 'Failed to load email settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiService.updateEmailConfig(config);
      showMsg('success', 'Email settings saved successfully');
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Failed to save email settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) { showMsg('error', 'Enter a test email address'); return; }
    try {
      setTesting(true);
      const res = await apiService.testEmailConfig(testEmail);
      const provider = res.data?.provider === 'postal' ? 'Postal' : 'SMTP';
      showMsg('success', `Test email sent via ${provider} to ${testEmail}`);
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Email test failed');
    } finally {
      setTesting(false);
    }
  };

  const inputClass = "flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  if (loading) return <div className="text-gray-400 text-center py-10"><FaSpinner className="animate-spin inline mr-2" />Loading email settings...</div>;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h3 className="text-2xl font-bold text-white">Email Configuration</h3>
        {msg.text && (
          <div className={`px-4 py-2 rounded-lg text-sm text-white ${msg.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {msg.text}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Provider Selector */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 bg-opacity-40 border border-blue-500 rounded-lg p-5">
          <label className="block text-white font-bold mb-3 text-lg">Email Provider</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Postal Option */}
            <button
              onClick={() => setConfig(c => ({ ...c, provider: 'postal' }))}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                config.provider === 'postal'
                  ? 'border-blue-400 bg-blue-600 bg-opacity-30 shadow-lg shadow-blue-500/20'
                  : 'border-gray-600 bg-white bg-opacity-5 hover:border-gray-400'
              }`}
            >
              {config.provider === 'postal' && (
                <span className="absolute top-2 right-2 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
              )}
              <div className="text-white font-bold text-lg mb-1">Postal API</div>
              <p className="text-gray-300 text-sm">Direct HTTP API to your Postal mail server. No SMTP relay needed. Fast and reliable.</p>
              <div className="mt-2 text-xs text-blue-300">mail.oioxo.com</div>
            </button>
            {/* SMTP Option */}
            <button
              onClick={() => setConfig(c => ({ ...c, provider: 'smtp' }))}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                config.provider === 'smtp'
                  ? 'border-green-400 bg-green-600 bg-opacity-30 shadow-lg shadow-green-500/20'
                  : 'border-gray-600 bg-white bg-opacity-5 hover:border-gray-400'
              }`}
            >
              {config.provider === 'smtp' && (
                <span className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              )}
              <div className="text-white font-bold text-lg mb-1">SMTP Relay</div>
              <p className="text-gray-300 text-sm">Traditional SMTP server (Gmail, SendPulse, Mailgun, etc). Uses nodemailer.</p>
              <div className="mt-2 text-xs text-green-300">Any SMTP provider</div>
            </button>
          </div>
        </div>

        {/* Postal Settings */}
        {config.provider === 'postal' && (
          <div className="space-y-4 border border-blue-700 rounded-lg p-5 bg-blue-900 bg-opacity-20">
            <h4 className="text-white font-bold flex items-center gap-2">
              <FaServer className="text-blue-400" /> Postal API Settings
            </h4>
            <div>
              <label className="block text-gray-300 mb-2">API URL</label>
              <input
                type="text"
                value={config.postal_api_url}
                onChange={(e) => setConfig(c => ({ ...c, postal_api_url: e.target.value }))}
                placeholder="http://mail.oioxo.com:5000"
                className={inputClass + ' w-full'}
              />
              <p className="text-gray-500 text-xs mt-1">Base URL of your Postal server (without /api/v1)</p>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Server API Key</label>
              <input
                type="password"
                value={config.postal_api_key}
                onChange={(e) => setConfig(c => ({ ...c, postal_api_key: e.target.value }))}
                placeholder="Enter Postal API key"
                className={inputClass + ' w-full'}
              />
              <p className="text-gray-500 text-xs mt-1">Found in Postal admin → Credentials → Server API Keys</p>
            </div>
          </div>
        )}

        {/* SMTP Settings */}
        {config.provider === 'smtp' && (
          <div className="space-y-4 border border-green-700 rounded-lg p-5 bg-green-900 bg-opacity-20">
            <h4 className="text-white font-bold flex items-center gap-2">
              <FaEnvelope className="text-green-400" /> SMTP Server Settings
            </h4>
            {/* Host + Port */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-300 mb-2">SMTP Host</label>
                <input
                  type="text"
                  value={config.smtp_host}
                  onChange={(e) => setConfig(c => ({ ...c, smtp_host: e.target.value }))}
                  placeholder="smtp.gmail.com"
                  className={inputClass + ' w-full'}
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Port</label>
                <input
                  type="number"
                  value={config.smtp_port}
                  onChange={(e) => setConfig(c => ({ ...c, smtp_port: parseInt(e.target.value) || 587 }))}
                  className={inputClass + ' w-full'}
                />
              </div>
            </div>
            {/* Secure Toggle */}
            <div className="flex items-center gap-4">
              <label className="text-gray-300">Use SSL/TLS</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.smtp_secure}
                  onChange={(e) => setConfig(c => ({ ...c, smtp_secure: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <span className="text-gray-500 text-sm">Enable for port 465, disable for port 587 (STARTTLS)</span>
            </div>
            {/* Username + Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Username / Email</label>
                <input
                  type="text"
                  value={config.smtp_user}
                  onChange={(e) => setConfig(c => ({ ...c, smtp_user: e.target.value }))}
                  placeholder="you@domain.com"
                  className={inputClass + ' w-full'}
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Password / App Password</label>
                <input
                  type="password"
                  value={config.smtp_password}
                  onChange={(e) => setConfig(c => ({ ...c, smtp_password: e.target.value }))}
                  placeholder="••••••••"
                  className={inputClass + ' w-full'}
                />
              </div>
            </div>
          </div>
        )}

        {/* Shared: From Name + From Email */}
        <div className="border border-gray-700 rounded-lg p-5 bg-white bg-opacity-5">
          <h4 className="text-white font-bold mb-4">Sender Identity</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">From Name</label>
              <input
                type="text"
                value={config.from_name}
                onChange={(e) => setConfig(c => ({ ...c, from_name: e.target.value }))}
                placeholder="VPN XO"
                className={inputClass + ' w-full'}
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">From Email</label>
              <input
                type="email"
                value={config.from_email}
                onChange={(e) => setConfig(c => ({ ...c, from_email: e.target.value }))}
                placeholder="noreply@vpn-xo.com"
                className={inputClass + ' w-full'}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <FaSpinner className="animate-spin mr-1" /> : <FaEnvelope className="mr-1" />}
            Save Email Settings
          </Button>
        </div>

        {/* Test Email */}
        <div className="border-t border-white border-opacity-10 pt-5">
          <h4 className="text-white font-bold mb-3">
            <FaPaperPlane className="inline mr-2" />
            Test Email ({config.provider === 'postal' ? 'Postal API' : 'SMTP'})
          </h4>
          <div className="flex gap-3">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className={inputClass}
            />
            <Button variant="primary" onClick={handleTest} disabled={testing || !testEmail}>
              {testing ? <FaSpinner className="animate-spin" /> : 'Send Test'}
            </Button>
          </div>
          <p className="text-gray-500 text-xs mt-1">
            Sends a test email using the <strong>{config.provider === 'postal' ? 'Postal API' : 'SMTP'}</strong> provider to verify your configuration.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SystemSettings;
