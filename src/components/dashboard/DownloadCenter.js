import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaWindows, FaApple, FaAndroid, FaDownload, FaGlobe, FaCopy, FaFileDownload } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import { apiService } from '../../services/api';

const DownloadCenter = () => {
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState('');
  const [wgConfig, setWgConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      const response = await apiService.getServers();
      setServers(response.data);
      if (response.data.length > 0) {
        setSelectedServer(response.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load servers:', err);
      setError('Failed to load servers.');
    }
  };

  const generateConfig = async () => {
    try {
      setLoadingConfig(true);
      setWgConfig(null);
      setError(null);
      const response = await apiService.getWireGuardConfig(selectedServer);
      setWgConfig(response.data);
    } catch (err) {
      console.error('Failed to generate config:', err);
      setError('Failed to generate WireGuard config. Please try again.');
    } finally {
      setLoadingConfig(false);
    }
  };

  const downloadConfig = () => {
    if (!wgConfig) return;
    const element = document.createElement("a");
    const file = new Blob([wgConfig.configFile], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `vpnxo-wg-${wgConfig.server.location.replace(/\s+/g, '-').toLowerCase()}.conf`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const copyToClipboard = () => {
    if (!wgConfig) return;
    navigator.clipboard.writeText(wgConfig.configFile);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const platforms = [
    {
      name: 'Windows',
      icon: FaWindows,
      color: 'from-blue-600 to-blue-800',
      version: '1.0.0',
      downloadUrl: '/downloads/VPN-XO-Setup.exe',
      description: 'Windows 10/11 (64-bit)',
      available: true,
    },
    {
      name: 'macOS',
      icon: FaApple,
      color: 'from-gray-600 to-gray-800',
      version: '1.0.0',
      downloadUrl: '/downloads/VPN-XO.dmg',
      description: 'macOS 12 or later',
      available: true,
    },
    {
      name: 'Android',
      icon: FaAndroid,
      color: 'from-green-600 to-green-800',
      version: '1.0.0',
      downloadUrl: 'https://play.google.com/store/apps/details?id=com.vpnxo.app',
      description: 'Android 8.0 or later',
      available: true,
      external: true,
    },
    {
      name: 'iOS',
      icon: FaApple,
      color: 'from-purple-600 to-purple-800',
      version: '1.0.0',
      downloadUrl: 'https://apps.apple.com/app/vpn-xo',
      description: 'iOS 16 or later',
      available: true,
      external: true,
    },

  ];

  const handleDownload = (platform) => {
    if (!platform.available) return;
    if (platform.external) {
      window.open(platform.downloadUrl, '_blank');
    } else {
      window.location.href = platform.downloadUrl;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Download VPN XO</h2>
            <p className="text-blue-100">
              Get our apps for all your devices and stay protected everywhere
            </p>
          </div>
          <FaDownload className="text-6xl text-white opacity-20" />
        </div>
      </Card>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Platform Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform, index) => (
          <motion.div
            key={platform.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-6 bg-gradient-to-br ${platform.color} ${!platform.available ? 'opacity-60' : ''} hover:scale-105 transition-transform`}>
              <div className="text-center">
                <platform.icon className="text-6xl text-white mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">{platform.name}</h3>
                <p className="text-sm text-gray-200 mb-1">{platform.description}</p>
                <p className="text-xs text-gray-300 mb-4">Version {platform.version}</p>

                <div className="space-y-2">
                  <Button
                    variant="solid"
                    size="md"
                    fullWidth
                    icon={<FaDownload />}
                    onClick={() => handleDownload(platform)}
                  >
                    <span className="text-gray-900 font-semibold">
                      {platform.external ? 'Get App' : 'Download'}
                    </span>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Installation Instructions */}
      <Card className="p-6">
        <h3 className="text-2xl font-bold text-white mb-4">Installation Instructions</h3>
        <div className="space-y-4 text-gray-300">
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">1. Download the App</h4>
            <p>Click the download button for your platform above.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">2. Install</h4>
            <p>Run the installer and follow the on-screen instructions.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">3. Login</h4>
            <p>Open the app and login with your VPN XO account credentials.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">4. Connect</h4>
            <p>Select a server location and click connect to start protecting your connection.</p>
          </div>
        </div>
      </Card>

      {/* Manual Configuration */}
      <Card className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-3 flex items-center">
          <FaGlobe className="mr-2 text-blue-400" />
          Manual WireGuard Configuration
        </h3>
        <p className="text-gray-300 mb-6">
          Generate configuration files for routers, Linux CLI, or third-party WireGuard clients.
        </p>

        <div className="bg-black bg-opacity-30 p-6 rounded-xl border border-white border-opacity-10">
          <div className="grid md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Select Server Location</label>
              <select
                value={selectedServer}
                onChange={(e) => setSelectedServer(e.target.value)}
                className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                {servers.map(server => (
                  <option key={server.id} value={server.id}>
                    {server.location} - {server.name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={generateConfig}
              disabled={loadingConfig || servers.length === 0}
            >
              {loadingConfig ? 'Generating...' : 'Generate Configuration'}
            </Button>
          </div>

          {wgConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 pt-6 border-t border-gray-700"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-white">Configuration File</h4>
                <div className="flex space-x-2">
                  <Button variant="secondary" size="sm" icon={<FaCopy />} onClick={copyToClipboard}>
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button variant="solid" size="sm" icon={<FaFileDownload />} onClick={downloadConfig}>
                    Download .conf
                  </Button>
                </div>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm text-green-400 overflow-x-auto border border-gray-800 relative">
                {/* QR Code placeholder could go here */}
                <pre>{wgConfig.configFile}</pre>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DownloadCenter;
