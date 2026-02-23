import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaWindows, FaApple, FaAndroid, FaDownload, FaChrome } from 'react-icons/fa';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SEO from '../components/SEO';
import api from '../services/api';

// Fallback URLs if API is unreachable
const DEFAULT_DOWNLOAD_URLS = {
  windows: '/downloads/VPN-XO-Setup.exe',
  macos: '/downloads/VPN-XO.dmg',
  android: 'https://play.google.com/store/apps/details?id=com.vpnxo.app',
  ios: 'https://apps.apple.com/app/vpn-xo',
  chrome: 'https://chromewebstore.google.com',
};

const VPNXODownload = () => {
  useDocumentTitle('Download');
  const [downloadUrls, setDownloadUrls] = useState(DEFAULT_DOWNLOAD_URLS);

  useEffect(() => {
    api.get('/api/config/downloads').then(res => {
      if (res.data) setDownloadUrls(prev => ({ ...prev, ...res.data }));
    }).catch(() => { /* use defaults */ });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <SEO
        title="Download VPN XO — Windows, macOS, Android, iOS & Chrome"
        description="Download VPN XO for Windows, macOS, Android, iOS, and the Chrome extension. One-click install, instant connection to secure VPN servers worldwide."
        path="/download"
      />
      <nav className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="text-white hover:text-gray-300 transition">
              &larr; Back to Home
            </Link>
            <img src="/logos/logo_vpnxo_original.png" alt="VPN XO" className="h-12" />
            <Link to="/login" className="text-white hover:text-blue-300 transition">
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <FaDownload className="text-blue-400 text-6xl mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-white mb-4">Download VPN XO</h1>
          <p className="text-xl text-gray-300">Available for all your devices — Android, iOS, Windows, macOS &amp; Chrome</p>
        </div>

        {/* Download Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Windows */}
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-center">
            <FaWindows className="text-blue-400 text-6xl mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Windows</h3>
            <p className="text-gray-300 mb-6">Windows 10/11</p>
            <a
              href={downloadUrls.windows}
              download
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition text-center"
            >
              <FaDownload className="inline mr-2" /> Download
            </a>
            <p className="text-gray-400 text-sm mt-2">Version 1.0.0 &bull; ~50 MB</p>
          </div>

          {/* macOS */}
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-center">
            <FaApple className="text-gray-200 text-6xl mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">macOS</h3>
            <p className="text-gray-300 mb-6">macOS 12+</p>
            <a
              href={downloadUrls.macos}
              download
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition text-center"
            >
              <FaDownload className="inline mr-2" /> Download
            </a>
            <p className="text-gray-400 text-sm mt-2">Version 1.0.0 &bull; ~60 MB</p>
          </div>

          {/* Android */}
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-center">
            <FaAndroid className="text-green-400 text-6xl mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Android</h3>
            <p className="text-gray-300 mb-6">Android 8.0+</p>
            <a
              href={downloadUrls.android}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition text-center"
            >
              Google Play
            </a>
            <p className="text-gray-400 text-sm mt-2">Also available as APK</p>
          </div>

          {/* iOS */}
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-center">
            <FaApple className="text-gray-200 text-6xl mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">iOS</h3>
            <p className="text-gray-300 mb-6">iOS 16+</p>
            <a
              href={downloadUrls.ios}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition text-center"
            >
              App Store
            </a>
            <p className="text-gray-400 text-sm mt-2">Version 1.0.0</p>
          </div>

          {/* Chrome Extension */}
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-center">
            <FaChrome className="text-yellow-400 text-6xl mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Chrome</h3>
            <p className="text-gray-300 mb-6">Browser Extension</p>
            <a
              href={downloadUrls.chrome}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold transition text-center"
            >
              Add to Chrome
            </a>
            <p className="text-gray-400 text-sm mt-2">Chrome Web Store</p>
          </div>

        </div>

        {/* Installation Instructions */}
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Installation Instructions</h2>
          
          <div className="space-y-6">
            {/* Windows */}
            <div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center">
                <FaWindows className="mr-2 text-blue-400" />
                Windows
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-4">
                <li>Download the Windows installer</li>
                <li>Run the .exe file</li>
                <li>Follow the installation wizard</li>
                <li>Launch VPN XO and login with your account</li>
              </ol>
            </div>

            {/* macOS */}
            <div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center">
                <FaApple className="mr-2 text-gray-300" />
                macOS
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-4">
                <li>Download the .dmg file</li>
                <li>Open the .dmg and drag VPN XO to Applications</li>
                <li>Launch VPN XO and log in with your account</li>
              </ol>
            </div>

            {/* Android */}
            <div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center">
                <FaAndroid className="mr-2 text-green-400" />
                Android
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-4">
                <li>Open Google Play and search for VPN XO, or tap the Google Play button above</li>
                <li>Tap Install</li>
                <li>Launch VPN XO and log in with your account</li>
              </ol>
            </div>

            {/* iOS */}
            <div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center">
                <FaApple className="mr-2 text-gray-300" />
                iOS
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-4">
                <li>Open the App Store and search for VPN XO, or tap the App Store button above</li>
                <li>Tap Get to install</li>
                <li>Launch VPN XO and log in with your account</li>
              </ol>
            </div>

          </div>
        </div>

        {/* System Requirements */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-2xl border border-white border-opacity-20">
          <h2 className="text-3xl font-bold text-white mb-6">System Requirements</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Windows</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Windows 10 / 11 (64-bit)</li>
                <li>• 100 MB free disk space</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">macOS</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• macOS 12 Monterey or later</li>
                <li>• 80 MB free disk space</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Android</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Android 8.0 or later</li>
                <li>• 50 MB free disk space</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">iOS</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• iOS 16 or later</li>
                <li>• 50 MB free disk space</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Chrome Extension</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Chrome 100 or later</li>
                <li>• Any OS that runs Chrome</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-300 mb-4">Don't have an account yet?</p>
          <Link 
            to="/register" 
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-full font-bold text-lg transition transform hover:scale-105"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VPNXODownload;
