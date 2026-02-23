import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaServer,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaUserShield,
  FaNetworkWired,
  FaDollarSign,
  FaExclamationTriangle,
  FaCrown,
  FaDatabase,
  FaTicketAlt,
  FaHistory,
  FaGlobe,
  FaHeartbeat,
  FaEnvelope,
  FaBullhorn,
  FaChartBar,
  FaShieldAlt,
  FaPlug,
  FaBalanceScale,
  FaTachometerAlt,
  FaLock,
  FaChevronDown,
  FaChevronRight,
  FaBars,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import UserEditModal from '../components/admin/modals/UserEditModal';
import ServerModal from '../components/admin/modals/ServerModal';
import DeleteConfirmModal from '../components/admin/modals/DeleteConfirmModal';
import PaymentManagement from '../components/admin/PaymentManagement';
import SystemSettings from '../components/admin/SystemSettings';
import TicketManagement from '../components/admin/TicketManagement';
import ContactMessages from '../components/admin/ContactMessages';
import ErrorTracking from '../components/admin/ErrorTracking';
import DiscountCampaignManager from '../components/admin/DiscountCampaignManager';
import AuditTrail from '../components/admin/AuditTrail';
import GeoAnalytics from '../components/admin/GeoAnalytics';
import EmailTemplateManager from '../components/admin/EmailTemplateManager';
import AnnouncementManager from '../components/admin/AnnouncementManager';
import UserDetailModal from '../components/admin/UserDetailModal';
import IPDeviceBanManager from '../components/admin/IPDeviceBanManager';
import VPSMetrics from '../components/admin/VPSMetrics';
import AlertManager from '../components/admin/AlertManager';
import ServerCommandCenter from '../components/admin/ServerCommandCenter';
import SegmentAnalytics from '../components/admin/SegmentAnalytics';
import AbuseDetection from '../components/admin/AbuseDetection';
import SessionControl from '../components/admin/SessionControl';
import LoadBalancer from '../components/admin/LoadBalancer';
import QoSManagement from '../components/admin/QoSManagement';
import GDPRCompliance from '../components/admin/GDPRCompliance';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useConfirm from '../hooks/useConfirm';
import ConfirmDialog from '../components/common/ConfirmDialog';

// Lazy-load recharts-heavy components — only fetched when these tabs are active (~450KB savings)
const RevenueDashboard = lazy(() => import('../components/admin/RevenueDashboard'));
const RevenueForecasting = lazy(() => import('../components/admin/RevenueForecasting'));

const ChartFallback = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-gray-400">Loading charts...</span>
  </div>
);

const AdminDashboard = () => {
  useDocumentTitle('Admin Dashboard');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  const sidebarGroups = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartLine, items: [
      { id: 'overview', name: 'Overview', icon: FaChartLine },
    ]},
    { id: 'user-mgmt', label: 'User Management', icon: FaUsers, items: [
      { id: 'users', name: 'Users', icon: FaUsers },
      { id: 'sessions', name: 'Session Control', icon: FaPlug },
      { id: 'abuse', name: 'Abuse Detection', icon: FaShieldAlt },
    ]},
    { id: 'servers', label: 'Servers & Network', icon: FaServer, items: [
      { id: 'servers', name: 'Command Center', icon: FaServer },
      { id: 'connections', name: 'Connections', icon: FaNetworkWired },
      { id: 'vps', name: 'VPS Metrics', icon: FaDatabase },
      { id: 'loadbalancer', name: 'Load Balancer', icon: FaBalanceScale },
      { id: 'qos', name: 'QoS', icon: FaTachometerAlt },
    ]},
    { id: 'financial', label: 'Financial', icon: FaDollarSign, items: [
      { id: 'payments', name: 'Payments', icon: FaDollarSign },
      { id: 'revenue', name: 'Revenue', icon: FaChartLine },
      { id: 'forecasting', name: 'Forecasting', icon: FaChartBar },
      { id: 'discounts', name: 'Discounts', icon: FaDollarSign },
    ]},
    { id: 'communication', label: 'Communication', icon: FaEnvelope, items: [
      { id: 'tickets', name: 'Support Tickets', icon: FaTicketAlt },
      { id: 'contact', name: 'Messages', icon: FaEnvelope },
      { id: 'emails', name: 'Email Templates', icon: FaEnvelope },
      { id: 'announcements', name: 'Announcements', icon: FaBullhorn },
    ]},
    { id: 'monitoring', label: 'Monitoring', icon: FaHeartbeat, items: [
      { id: 'errors', name: 'Errors', icon: FaExclamationTriangle },
      { id: 'alerts', name: 'Alerts', icon: FaExclamationTriangle },
      { id: 'audit', name: 'Audit Trail', icon: FaHistory },
    ]},
    { id: 'analytics', label: 'Analytics', icon: FaGlobe, items: [
      { id: 'geo', name: 'Geo Analytics', icon: FaGlobe },
      { id: 'segments', name: 'Segments', icon: FaChartBar },
    ]},
    { id: 'security', label: 'Security', icon: FaShieldAlt, items: [
      { id: 'bans', name: 'IP/Device Bans', icon: FaUserShield },
      { id: 'gdpr', name: 'GDPR', icon: FaLock },
    ]},
    { id: 'settings', label: 'Settings', icon: FaCog, items: [
      { id: 'system', name: 'System Settings', icon: FaCog },
    ]},
  ];
  const [expandedGroups, setExpandedGroups] = useState(['dashboard']);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };
  const { confirm: confirmDialog, dialogProps: logoutDialogProps } = useConfirm();
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUserModal, setEditUserModal] = useState({ isOpen: false, user: null });
  const [serverModal, setServerModal] = useState({ isOpen: false, server: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, item: null, onConfirm: null });
  const [createUserModal, setCreateUserModal] = useState(false);
  const [userDetailModal, setUserDetailModal] = useState({ isOpen: false, userId: null });
  const [newUserData, setNewUserData] = useState({ email: '', password: '', tier: 'free' });
  const [createUserError, setCreateUserError] = useState('');

  useEffect(() => {
    // Load admin data
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, usersRes, connectionsRes] = await Promise.all([
        apiService.getAnalytics(),
        apiService.getUsers(),
        apiService.getConnections(),
      ]);

      setAnalytics(analyticsRes.data || {});
      setUsers(usersRes.data || []);
      setConnections(connectionsRes.data || []);
    } catch (err) {
      setError('Failed to load admin data');
      console.error('Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-expand sidebar group when active tab changes
  useEffect(() => {
    const group = sidebarGroups.find(g => g.items.some(i => i.id === activeTab));
    if (group && !expandedGroups.includes(group.id)) {
      setExpandedGroups(prev => [...prev, group.id]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleLogout = async () => {
    const ok = await confirmDialog({
      title: 'Logout',
      message: 'Are you sure you want to logout from the admin panel?',
      confirmText: 'Logout',
      variant: 'warning'
    });
    if (!ok) return;
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="spinner mx-auto mb-4"></div>
          <div className="text-2xl">Loading Admin Panel...</div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-black/50 backdrop-blur-md border-b border-white/10 flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-gray-300 hover:text-white p-1">
                <FaBars className="text-lg" />
              </button>
              <FaUserShield className="text-yellow-400 text-xl" />
              <h1 className="text-white text-lg font-bold">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-300 hover:text-white transition text-sm">User View</Link>
              <span className="text-gray-400 text-sm hidden sm:inline">{user?.email}</span>
              <button onClick={handleLogout} className="text-gray-300 hover:text-red-400 transition" title="Logout">
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-30 md:z-auto w-56 h-[calc(100vh-56px)] bg-gray-900 md:bg-transparent border-r border-white/10 overflow-y-auto transition-transform duration-200 flex-shrink-0`}>
          <nav className="py-2">
            {sidebarGroups.map((group) => {
              const isExpanded = expandedGroups.includes(group.id);
              const isGroupActive = group.items.some(item => item.id === activeTab);
              return (
                <div key={group.id} className="mb-0.5">
                  <button
                    onClick={() => { if (group.items.length === 1) { setActiveTab(group.items[0].id); setSidebarOpen(false); } else { toggleGroup(group.id); } }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${isGroupActive ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <span className="flex items-center"><group.icon className="mr-2 text-sm" />{group.label}</span>
                    {group.items.length > 1 && (isExpanded ? <FaChevronDown className="text-[10px]" /> : <FaChevronRight className="text-[10px]" />)}
                  </button>
                  {(isExpanded || group.items.length === 1) && (
                    <div className={group.items.length > 1 ? 'border-l border-white/5 ml-6' : ''}>
                      {group.items.map((item) => (
                        <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                          className={`w-full flex items-center px-4 py-1.5 text-sm transition ${activeTab === item.id ? 'text-white bg-blue-600/20 border-r-2 border-blue-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                          <item.icon className="mr-2 text-xs opacity-75" />{item.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>
        {sidebarOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-20" onClick={() => setSidebarOpen(false)} />}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {activeTab === 'overview' && <OverviewTab analytics={analytics} onNavigate={setActiveTab} />}
            {activeTab === 'users' && <UsersTab users={users} onRefresh={loadData} onEdit={(user) => setEditUserModal({ isOpen: true, user })} onDelete={(user) => setDeleteModal({ isOpen: true, type: 'user', item: user, onConfirm: () => handleDeleteUser(user.id) })} onCreateUser={() => setCreateUserModal(true)} onViewUser={(user) => setUserDetailModal({ isOpen: true, userId: user.id })} />}
            {activeTab === 'connections' && <ConnectionsTab connections={connections} onRefresh={loadData} onDisconnect={(conn) => handleDisconnect(conn.id)} />}
            {activeTab === 'servers' && <ServerCommandCenter onOpenServerModal={(server) => setServerModal({ isOpen: true, server: server || null })} onDeleteServer={(server) => setDeleteModal({ isOpen: true, type: 'server', item: server, onConfirm: () => handleDeleteServer(server.id) })} onRefreshParent={loadData} />}
            {activeTab === 'tickets' && <TicketManagement />}
            {activeTab === 'payments' && <PaymentManagement />}
            {activeTab === 'contact' && <ContactMessages />}
            {activeTab === 'errors' && <ErrorTracking />}
            {activeTab === 'discounts' && <DiscountCampaignManager />}
            {activeTab === 'system' && <SystemSettings />}
            {activeTab === 'emails' && <EmailTemplateManager />}
            {activeTab === 'announcements' && <AnnouncementManager />}
            {activeTab === 'audit' && <AuditTrail />}
            {activeTab === 'revenue' && <Suspense fallback={<ChartFallback />}><RevenueDashboard /></Suspense>}
            {activeTab === 'vps' && <VPSMetrics />}
            {activeTab === 'alerts' && <AlertManager />}
            {activeTab === 'bans' && <IPDeviceBanManager />}
            {activeTab === 'geo' && <GeoAnalytics />}
            {activeTab === 'segments' && <SegmentAnalytics />}
            {activeTab === 'abuse' && <AbuseDetection />}
            {activeTab === 'sessions' && <SessionControl />}
            {activeTab === 'loadbalancer' && <LoadBalancer />}
            {activeTab === 'qos' && <QoSManagement />}
            {activeTab === 'gdpr' && <GDPRCompliance />}
            {activeTab === 'forecasting' && <Suspense fallback={<ChartFallback />}><RevenueForecasting /></Suspense>}
          </div>
        </main>
      </div>

      {/* Modals */}
      <UserEditModal
        isOpen={editUserModal.isOpen}
        onClose={() => setEditUserModal({ isOpen: false, user: null })}
        user={editUserModal.user}
        onSuccess={loadData}
      />
      <ServerModal
        isOpen={serverModal.isOpen}
        onClose={() => setServerModal({ isOpen: false, server: null })}
        server={serverModal.server}
        onSuccess={loadData}
      />
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: null, item: null, onConfirm: null })}
        type={deleteModal.type}
        itemName={deleteModal.item?.email || deleteModal.item?.name}
        onConfirm={deleteModal.onConfirm}
      />
      <UserDetailModal
        isOpen={userDetailModal.isOpen}
        onClose={() => setUserDetailModal({ isOpen: false, userId: null })}
        userId={userDetailModal.userId}
        onRefresh={loadData}
      />

      {/* Create User Modal */}
      {createUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Create New User</h3>
            {createUserError && <div className="mb-3 p-2 bg-red-500/20 text-red-300 rounded text-sm">{createUserError}</div>}
            <div className="space-y-3">
              <input type="email" placeholder="Email" value={newUserData.email}
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="password" placeholder="Password" value={newUserData.password}
                onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <select value={newUserData.tier} onChange={(e) => setNewUserData({...newUserData, tier: e.target.value})}
                className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="free">Free</option>
                <option value="paid">Premium</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" fullWidth onClick={() => { setCreateUserModal(false); setCreateUserError(''); setNewUserData({ email: '', password: '', tier: 'free' }); }}>Cancel</Button>
              <Button variant="primary" fullWidth onClick={async () => {
                try {
                  setCreateUserError('');
                  await apiService.createUser(newUserData);
                  setCreateUserModal(false);
                  setNewUserData({ email: '', password: '', tier: 'free' });
                  loadData();
                } catch (err) {
                  setCreateUserError(err.response?.data?.error || 'Failed to create user');
                }
              }}>Create User</Button>
            </div>
          </div>
        </div>
      )}
    </div>
      <ConfirmDialog {...logoutDialogProps} />
    </>
  );

  async function handleDeleteUser(userId) {
    await apiService.deleteUser(userId);
    loadData();
  }

  async function handleDeleteServer(serverId) {
    await apiService.deleteServer(serverId);
    loadData();
  }

  async function handleDisconnect(connectionId) {
    await apiService.forceDisconnect(connectionId);
    loadData();
  }
};

// Overview Tab Component
const OverviewTab = ({ analytics, onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-4 bg-gradient-to-br from-blue-600 to-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-xs">Total Users</p>
                <p className="text-white text-2xl font-bold">{analytics?.totalUsers || 0}</p>
              </div>
              <FaUsers className="text-blue-200 text-3xl" />
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-4 bg-gradient-to-br from-green-600 to-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-xs">Active Connections</p>
                <p className="text-white text-2xl font-bold">{analytics?.activeConnections || 0}</p>
              </div>
              <FaNetworkWired className="text-green-200 text-3xl" />
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-4 bg-gradient-to-br from-purple-600 to-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-xs">Premium Users</p>
                <p className="text-white text-2xl font-bold">{analytics?.paidUsers || 0}</p>
              </div>
              <FaCrown className="text-purple-200 text-3xl" />
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-4 bg-gradient-to-br from-yellow-600 to-yellow-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-xs">Free Users</p>
                <p className="text-white text-2xl font-bold">{analytics?.freeUsers || 0}</p>
              </div>
              <FaUsers className="text-yellow-200 text-3xl" />
            </div>
          </Card>
        </motion.div>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">System Overview</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">User Statistics</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Total Users:</span>
                <span className="font-bold text-white">{analytics?.totalUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Free Users:</span>
                <span className="font-bold text-white">{analytics?.freeUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Premium Users:</span>
                <span className="font-bold text-white">{analytics?.paidUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Conversion Rate:</span>
                <span className="font-bold text-white">
                  {analytics?.totalUsers > 0
                    ? ((analytics.paidUsers / analytics.totalUsers) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Connection Statistics</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Active Connections:</span>
                <span className="font-bold text-white">{analytics?.activeConnections || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Server Capacity:</span>
                <span className="font-bold text-white">{analytics?.serverCapacity || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Utilization:</span>
                <span className="font-bold text-white">
                  {analytics?.serverCapacity > 0
                    ? ((analytics?.activeConnections || 0) / analytics.serverCapacity * 100).toFixed(1)
                    : '0.0'}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Button variant="primary" icon={<FaUsers />} onClick={() => onNavigate('users')}>
            Manage Users
          </Button>
          <Button variant="secondary" icon={<FaServer />} onClick={() => onNavigate('servers')}>
            Manage Servers
          </Button>
          <Button variant="outline" icon={<FaDollarSign />} onClick={() => onNavigate('revenue')}>
            Revenue
          </Button>
          <Button variant="outline" icon={<FaExclamationTriangle />} onClick={() => onNavigate('alerts')}>
            Alerts
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Users Tab Component
const UsersTab = ({ users, onRefresh, onEdit, onDelete, onCreateUser, onViewUser }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const { confirm: confirmBulk, dialogProps: bulkDialogProps } = useConfirm();
  const [page, setPage] = useState(1);
  const perPage = 25;

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => onRefresh(), 30000);
    return () => clearInterval(interval);
  }, [onRefresh]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const response = await apiService.exportUsersCsv();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users-export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { /* ignore */ }
    setExporting(false);
  };

  const filteredUsers = users.filter((user) => {
    const matchesFilter = filter === 'all' || user.tier === filter;
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredUsers.length / perPage);
  const paginatedUsers = filteredUsers.slice((page - 1) * perPage, page * perPage);

  const toggleSelectUser = (userId) => {
    setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;
    const ok = await confirmBulk({
      title: `Bulk ${bulkAction}`,
      message: `Are you sure you want to ${bulkAction} ${selectedUsers.length} user(s)?`,
      confirmText: bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1),
      variant: bulkAction === 'delete' ? 'danger' : 'warning',
    });
    if (!ok) return;
    setBulkLoading(true);
    setBulkError(null);
    try {
      await apiService.bulkUserAction(bulkAction, selectedUsers);
      setSelectedUsers([]);
      setBulkAction('');
      onRefresh();
    } catch (err) {
      setBulkError('Bulk action failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exporting}>
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button variant="primary" size="sm" icon={<FaUsers />} onClick={onCreateUser}>
              Add User
            </Button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-30">
            <span className="text-blue-300 font-medium">{selectedUsers.length} selected</span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-1.5 rounded bg-white bg-opacity-10 border border-white border-opacity-20 text-white text-sm"
            >
              <option value="">Choose action...</option>
              <option value="activate">Activate</option>
              <option value="suspend">Suspend</option>
              <option value="upgrade">Upgrade to Premium</option>
              <option value="downgrade">Downgrade to Free</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || bulkLoading}
              className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50"
            >
              {bulkLoading ? 'Processing...' : 'Apply'}
            </button>
            <button onClick={() => setSelectedUsers([])} className="text-gray-400 hover:text-white text-sm ml-auto">
              Clear Selection
            </button>
          </div>
        )}

        {/* Bulk Error */}
        {bulkError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500 bg-opacity-20 border border-red-400 text-red-300 text-sm">
            {bulkError}
            <button onClick={() => setBulkError(null)} className="ml-2 text-red-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            <option value="free">Free</option>
            <option value="paid">Premium</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white border-opacity-20">
                <th className="text-left py-3 px-2 text-gray-300 w-10">
                  <input type="checkbox" checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0} onChange={toggleSelectAll} className="rounded" />
                </th>
                <th className="text-left py-3 px-4 text-gray-300">Email</th>
                <th className="text-left py-3 px-4 text-gray-300">Tier</th>
                <th className="text-left py-3 px-4 text-gray-300">Status</th>
                <th className="text-left py-3 px-4 text-gray-300">Created</th>
                <th className="text-left py-3 px-4 text-gray-300">Last Login</th>
                <th className="text-left py-3 px-4 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} className={`border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5 ${selectedUsers.includes(user.id) ? 'bg-blue-500 bg-opacity-10' : ''}`}>
                  <td className="py-3 px-2">
                    <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleSelectUser(user.id)} className="rounded" />
                  </td>
                  <td className="py-3 px-4 text-white">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.tier === 'paid'
                          ? 'bg-purple-500 text-white'
                          : user.tier === 'admin'
                          ? 'bg-yellow-500 text-gray-900'
                          : 'bg-gray-500 text-white'
                      }`}
                    >
                      {user.tier}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'active'
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => onViewUser(user)} className="text-green-400 hover:text-green-300 mr-3" title="View Details">View</button>
                    <button onClick={() => onEdit(user)} className="text-blue-400 hover:text-blue-300 mr-3">Edit</button>
                    <button onClick={() => onDelete(user)} className="text-red-400 hover:text-red-300">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white border-opacity-10">
            <span className="text-gray-400 text-sm">
              Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, filteredUsers.length)} of {filteredUsers.length}
            </span>
            <div className="flex gap-1">
              <button onClick={() => setPage(1)} disabled={page === 1} className="px-3 py-1.5 rounded text-sm bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-30">&laquo;</button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded text-sm bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-30">&lsaquo;</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                if (p > totalPages) return null;
                return (
                  <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded text-sm ${p === page ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>{p}</button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded text-sm bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-30">&rsaquo;</button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-3 py-1.5 rounded text-sm bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-30">&raquo;</button>
            </div>
          </div>
        )}
      </Card>
      <ConfirmDialog {...bulkDialogProps} />
    </div>
  );
};

// Connections Tab Component
const ConnectionsTab = ({ connections, onRefresh, onDisconnect }) => {
  const [connPage, setConnPage] = useState(1);
  const connPerPage = 30;
  const totalConnPages = Math.ceil(connections.length / connPerPage);
  const paginatedConns = connections.slice((connPage - 1) * connPerPage, connPage * connPerPage);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => onRefresh(), 30000);
    return () => clearInterval(interval);
  }, [onRefresh]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Active Connections ({connections.length})</h2>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white border-opacity-20">
                <th className="text-left py-3 px-4 text-gray-300">User</th>
                <th className="text-left py-3 px-4 text-gray-300">Server</th>
                <th className="text-left py-3 px-4 text-gray-300">Protocol</th>
                <th className="text-left py-3 px-4 text-gray-300">Connected At</th>
                <th className="text-left py-3 px-4 text-gray-300">Duration</th>
                <th className="text-left py-3 px-4 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedConns.map((conn) => (
                <tr key={conn.id} className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5">
                  <td className="py-3 px-4 text-white">{conn.email}</td>
                  <td className="py-3 px-4 text-gray-300">{conn.server_name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                      {conn.protocol}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {new Date(conn.connected_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {Math.floor((Date.now() - new Date(conn.connected_at)) / 60000)} min
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => onDisconnect(conn)} className="text-red-400 hover:text-red-300">Disconnect</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalConnPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white border-opacity-10">
            <span className="text-gray-400 text-sm">
              Showing {((connPage - 1) * connPerPage) + 1}–{Math.min(connPage * connPerPage, connections.length)} of {connections.length}
            </span>
            <div className="flex gap-1">
              <button onClick={() => setConnPage(1)} disabled={connPage === 1} className="px-3 py-1.5 rounded text-sm bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-30">&laquo;</button>
              <button onClick={() => setConnPage(p => Math.max(1, p - 1))} disabled={connPage === 1} className="px-3 py-1.5 rounded text-sm bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-30">&lsaquo;</button>
              {Array.from({ length: Math.min(5, totalConnPages) }, (_, i) => {
                const start = Math.max(1, Math.min(connPage - 2, totalConnPages - 4));
                const p = start + i;
                if (p > totalConnPages) return null;
                return (
                  <button key={p} onClick={() => setConnPage(p)} className={`px-3 py-1.5 rounded text-sm ${p === connPage ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>{p}</button>
                );
              })}
              <button onClick={() => setConnPage(p => Math.min(totalConnPages, p + 1))} disabled={connPage === totalConnPages} className="px-3 py-1.5 rounded text-sm bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-30">&rsaquo;</button>
              <button onClick={() => setConnPage(totalConnPages)} disabled={connPage === totalConnPages} className="px-3 py-1.5 rounded text-sm bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-30">&raquo;</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
