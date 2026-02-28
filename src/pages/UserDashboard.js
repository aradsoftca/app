import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSignOutAlt,
  FaHome,
  FaDownload,
  FaTicketAlt,
  FaCreditCard,
  FaCog,
  FaCrown,
  FaShieldAlt,
  FaUserCircle,
  FaQuestionCircle,
  FaMobileAlt,
  FaGift,
  FaSun,
  FaMoon,
  FaTelegramPlane,
  FaHeadset,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SubscriptionCard from '../components/dashboard/SubscriptionCard';
import DownloadCenter from '../components/dashboard/DownloadCenter';
import TicketList from '../components/dashboard/TicketList';
import TicketDetail from '../components/dashboard/TicketDetail';
import CreateTicketModal from '../components/dashboard/CreateTicketModal';
import BillingSection from '../components/dashboard/BillingSection';
import AccountSettings from '../components/dashboard/AccountSettings';
import DeviceManagement from '../components/dashboard/DeviceManagement';
import ReferralDashboard from '../components/dashboard/ReferralDashboard';
import ServerCapacityDisplay from '../components/ServerCapacityDisplay';
import { useTheme } from '../contexts/ThemeContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useConfirm from '../hooks/useConfirm';
import ConfirmDialog from '../components/common/ConfirmDialog';

const UserDashboard = () => {
  useDocumentTitle('Dashboard');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { confirm, dialogProps } = useConfirm();
  const tabListRef = useRef(null);
  const [activeTab, setActiveTab] = useState(() => {
    // Allow deep-linking to a specific tab via ?tab=support etc.
    const tabParam = searchParams.get('tab');
    const validTabs = ['overview', 'downloads', 'devices', 'billing', 'support', 'referrals', 'settings'];
    return validTabs.includes(tabParam) ? tabParam : 'overview';
  });
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [error, setError] = useState(null);
  const [cancelMsg, setCancelMsg] = useState(null);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FaHome, description: 'Dashboard home' },
    { id: 'downloads', name: 'Downloads', icon: FaDownload, description: 'Get our apps' },
    { id: 'devices', name: 'Devices', icon: FaMobileAlt, description: 'Manage devices' },
    { id: 'billing', name: 'Billing', icon: FaCreditCard, description: 'Payments' },
    { id: 'support', name: 'Support', icon: FaTicketAlt, description: 'Get help' },
    { id: 'referrals', name: 'Referrals', icon: FaGift, description: 'Refer friends' },
    { id: 'settings', name: 'Settings', icon: FaCog, description: 'Account settings' },
  ];

  const handleTabKeyDown = useCallback((e) => {
    const currentIdx = tabs.findIndex(t => t.id === activeTab);
    let newIdx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      newIdx = (currentIdx + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      newIdx = (currentIdx - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIdx = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIdx = tabs.length - 1;
    } else {
      return;
    }
    setActiveTab(tabs[newIdx].id);
    setSelectedTicket(null);
    const buttons = tabListRef.current?.querySelectorAll('[role="tab"]');
    buttons?.[newIdx]?.focus();
  }, [activeTab, tabs]);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSubscriptionStatus();
      setSubscription(response.data);
    } catch (err) {
      console.error('Failed to load subscription:', err);
      setError('Failed to load subscription data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Log Out',
      message: 'Are you sure you want to logout?',
      confirmText: 'Log Out',
      variant: 'warning',
    });
    if (ok) {
      await logout();
      navigate('/login');
    }
  };

  const handleCancelSubscription = async () => {
    const ok = await confirm({
      title: 'Cancel Subscription',
      message: 'Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.',
      confirmText: 'Cancel Subscription',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await apiService.cancelSubscription();
      await loadSubscriptionData();
      setCancelMsg({ type: 'success', text: 'Subscription cancelled. You will retain access until the end of your billing period.' });
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      setCancelMsg({ type: 'error', text: 'Failed to cancel subscription. Please try again or contact support.' });
    }
  };

  const getLogo = () => {
    return '/logos/logo_vpnxo_green.png';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <motion.div
            className="spinner mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <div className="text-2xl font-semibold">Loading your dashboard...</div>
          <p className="text-gray-300 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-black bg-opacity-30 backdrop-blur-md border-b border-white border-opacity-10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <Link to="/">
                <motion.img
                  src={getLogo()}
                  alt="VPN XO"
                  className="h-12 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                />
              </Link>
              <div className="hidden md:block">
                <span className="text-white text-xl font-bold">Dashboard</span>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="hidden lg:flex items-center space-x-3 px-4 py-2 bg-white bg-opacity-10 rounded-lg">
                <FaUserCircle className="text-2xl text-gray-300" />
                <div>
                  <div className="text-xs text-gray-400">Logged in as</div>
                  <div className="text-sm text-white font-semibold truncate max-w-[150px]">
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Admin Panel Link */}
              {user?.tier === 'admin' && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    <FaShieldAlt className="mr-2" />
                    Admin Panel
                  </Button>
                </Link>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center px-3 py-2 text-white hover:text-yellow-400 transition rounded-lg hover:bg-white hover:bg-opacity-10"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-white hover:text-red-400 transition rounded-lg hover:bg-white hover:bg-opacity-10"
                title="Logout"
              >
                <FaSignOutAlt className="mr-2" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {getGreeting()}, {user?.email?.split('@')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-300">
            Welcome to your VPN XO dashboard. Manage your account and get support.
          </p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-200"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center">
              <FaQuestionCircle className="mr-2" />
              {error}
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div ref={tabListRef} role="tablist" aria-label="Dashboard sections" className="flex space-x-2 bg-black bg-opacity-30 p-2 rounded-lg overflow-x-auto">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onKeyDown={handleTabKeyDown}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedTicket(null);
                }}
                className={`flex items-center px-6 py-3 rounded-lg transition whitespace-nowrap font-medium ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <tab.icon className="mr-2" />
                <span>{tab.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Subscription Card */}
                <SubscriptionCard
                  subscription={subscription}
                  onCancelSubscription={handleCancelSubscription}
                />

                {/* Server Status */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <FaShieldAlt className="mr-2 text-green-400" />
                    Server Status
                  </h3>
                  <ServerCapacityDisplay />
                  {user?.tier === 'free' && (
                    <div className="mt-4 p-4 bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-20 rounded-lg">
                      <h4 className="text-white font-semibold text-sm mb-2">How Free Access Works</h4>
                      <ul className="text-gray-300 text-xs space-y-1.5">
                        <li>• Each server has <span className="text-white font-medium">250 safe slots</span> for free users</li>
                        <li>• If a server is full, new connections get a <span className="text-white font-medium">20-minute grace period</span></li>
                        <li>• After 20 minutes, the oldest overflow user is replaced by the newest</li>
                        <li>• <span className="text-yellow-400 font-medium">Premium users</span> are never disconnected and get priority access</li>
                      </ul>
                    </div>
                  )}
                </Card>

                {/* How to Connect */}
                <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600">
                  <h3 className="text-xl font-bold text-white mb-3 flex items-center">
                    <FaShieldAlt className="mr-2" />
                    How to Connect
                  </h3>
                  <p className="text-white mb-4">
                    Download our app and connect with one tap. VPN connections are managed through the app, not this website.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="solid"
                      size="md"
                      icon={<FaDownload />}
                      onClick={() => setActiveTab('downloads')}
                    >
                      <span className="text-blue-900 font-semibold">Download Apps</span>
                    </Button>
                    {user?.tier === 'free' && (
                      <Link to="/subscribe">
                        <Button variant="warning" size="md" icon={<FaCrown />}>
                          Upgrade to Premium
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Account Info */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <FaUserCircle className="mr-2" />
                    Account Info
                  </h3>
                  <div className="space-y-3 text-white">
                    <div>
                      <div className="text-gray-300 text-sm">Email</div>
                      <div className="font-medium break-all">{user?.email}</div>
                    </div>
                    <div>
                      <div className="text-gray-300 text-sm">Account Type</div>
                      <div className="font-medium flex items-center">
                        {user?.tier === 'paid' ? (
                          <>
                            <FaCrown className="text-yellow-400 mr-2" />
                            Premium
                          </>
                        ) : user?.tier === 'admin' ? (
                          <>
                            <FaShieldAlt className="text-red-400 mr-2" />
                            Administrator
                          </>
                        ) : (
                          <>
                            <FaUserCircle className="text-gray-400 mr-2" />
                            Free
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-300 text-sm">Member Since</div>
                      <div className="font-medium">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Need Help */}
                <Card className="p-6 bg-gradient-to-br from-purple-600 to-pink-600">
                  <h3 className="text-xl font-bold text-white mb-3">Need Help?</h3>
                  <p className="text-purple-100 mb-4 text-sm">
                    Our support team is here to help you 24/7
                  </p>
                  <Button
                    variant="solid"
                    size="md"
                    fullWidth
                    icon={<FaTicketAlt />}
                    onClick={() => {
                      setActiveTab('support');
                      setShowCreateTicket(true);
                    }}
                  >
                    <span className="text-purple-900 font-semibold">Create Ticket</span>
                  </Button>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'devices' && (
            <motion.div
              key="devices"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DeviceManagement />
            </motion.div>
          )}

          {activeTab === 'downloads' && (
            <motion.div
              key="downloads"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DownloadCenter />
            </motion.div>
          )}

          {activeTab === 'support' && (
            <motion.div
              key="support"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Support Channel Chooser */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center">
                  <FaHeadset className="mr-2 text-blue-400" />
                  Choose Your Support Channel
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Telegram Bot Card */}
                  <a
                    href="https://t.me/vpn_xobot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <Card className="p-5 border border-blue-500 border-opacity-30 hover:border-opacity-60 transition-all group-hover:shadow-lg group-hover:shadow-blue-500/10">
                      <div className="flex items-center mb-3">
                        <div className="bg-blue-500 bg-opacity-20 p-3 rounded-lg mr-3">
                          <FaTelegramPlane className="text-2xl text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold">Telegram Bot</h3>
                          <p className="text-gray-400 text-sm">@vpn_xobot</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Instant support via Telegram. Create tickets, check status, manage your account — all from your phone.
                      </p>
                      <div className="mt-3 text-blue-400 text-sm font-medium flex items-center">
                        Open in Telegram →
                      </div>
                    </Card>
                  </a>

                  {/* Web Ticket Card */}
                  <div
                    className="cursor-pointer block group"
                    onClick={() => setShowCreateTicket(true)}
                  >
                    <Card className="p-5 border border-purple-500 border-opacity-30 hover:border-opacity-60 transition-all group-hover:shadow-lg group-hover:shadow-purple-500/10 h-full">
                      <div className="flex items-center mb-3">
                        <div className="bg-purple-500 bg-opacity-20 p-3 rounded-lg mr-3">
                          <FaTicketAlt className="text-2xl text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold">Web Ticket</h3>
                          <p className="text-gray-400 text-sm">Create & track here</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Create a support ticket right here. Attach files, track progress, and get email notifications.
                      </p>
                      <div className="mt-3 text-purple-400 text-sm font-medium flex items-center">
                        Create new ticket →
                      </div>
                    </Card>
                  </div>
                </div>
                <p className="text-gray-500 text-xs mt-2 text-center">Both channels share the same ticket system — your requests are synced.</p>
              </div>

              {/* Ticket list / detail below */}
              {selectedTicket ? (
                <TicketDetail
                  ticketId={selectedTicket.id}
                  onBack={() => setSelectedTicket(null)}
                />
              ) : (
                <TicketList
                  onSelectTicket={setSelectedTicket}
                  onCreateTicket={() => setShowCreateTicket(true)}
                />
              )}
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {cancelMsg && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${cancelMsg.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'}`}>
                  {cancelMsg.text}
                </div>
              )}
              <BillingSection
                subscription={subscription}
                onCancelSubscription={handleCancelSubscription}
                onNavigateToSupport={() => setActiveTab('support')}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AccountSettings />
            </motion.div>
          )}

          {activeTab === 'referrals' && (
            <motion.div
              key="referrals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ReferralDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={showCreateTicket}
        onClose={() => setShowCreateTicket(false)}
        onSuccess={() => {
          setShowCreateTicket(false);
          if (activeTab === 'support') {
            // Refresh ticket list
            window.location.reload();
          }
        }}
      />
    </div>
    <ConfirmDialog {...dialogProps} />
    </>
  );
};

export default UserDashboard;
