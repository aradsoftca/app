import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import ConfirmDialog from '../common/ConfirmDialog';
import useConfirm from '../../hooks/useConfirm';
import {
  FaTimes, FaUser, FaCrown, FaKey, FaGift, FaHistory,
  FaNetworkWired, FaDollarSign, FaTicketAlt, FaShieldAlt,
} from 'react-icons/fa';

const UserDetailModal = ({ isOpen, onClose, userId, onRefresh }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [resetPwForm, setResetPwForm] = useState({ show: false, password: '', loading: false });
  const [grantSubForm, setGrantSubForm] = useState({
    show: false, planType: '1month', durationDays: 30, bonusMonths: 0, loading: false,
  });
  const [message, setMessage] = useState(null);
  const { confirm, dialogProps } = useConfirm();

  useEffect(() => {
    if (isOpen && userId) {
      loadDetails();
    }
  }, [isOpen, userId]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const response = await apiService.getUserDetails(userId);
      setData(response.data);
    } catch (err) {
      console.error('Failed to load user details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const pw = resetPwForm.password;
    if (!pw || pw.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }
    if (!/[A-Z]/.test(pw)) {
      setMessage({ type: 'error', text: 'Password must contain at least one uppercase letter' });
      return;
    }
    if (!/[0-9]/.test(pw)) {
      setMessage({ type: 'error', text: 'Password must contain at least one number' });
      return;
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"|,.<>/?]/.test(pw)) {
      setMessage({ type: 'error', text: 'Password must contain at least one special character' });
      return;
    }
    const ok = await confirm({
      title: 'Reset Password',
      message: `Are you sure you want to reset the password for ${data?.user?.email}?`,
      confirmText: 'Reset Password',
      variant: 'warning',
    });
    if (!ok) return;
    setResetPwForm(f => ({ ...f, loading: true }));
    try {
      const res = await apiService.adminResetPassword(userId, resetPwForm.password);
      setMessage({ type: 'success', text: res.data.message });
      setResetPwForm({ show: false, password: '', loading: false });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to reset password' });
      setResetPwForm(f => ({ ...f, loading: false }));
    }
  };

  const handleGrantSubscription = async () => {
    const ok = await confirm({
      title: 'Grant Subscription',
      message: `Grant ${grantSubForm.planType} subscription (${grantSubForm.durationDays} days, ${grantSubForm.bonusMonths} bonus months) to ${data?.user?.email}?`,
      confirmText: 'Grant Subscription',
      variant: 'warning',
    });
    if (!ok) return;
    setGrantSubForm(f => ({ ...f, loading: true }));
    try {
      const res = await apiService.adminGrantSubscription(userId, {
        planType: grantSubForm.planType,
        durationDays: parseInt(grantSubForm.durationDays),
        bonusMonths: parseInt(grantSubForm.bonusMonths),
      });
      setMessage({ type: 'success', text: res.data.message });
      setGrantSubForm({ show: false, planType: '1month', durationDays: 30, bonusMonths: 0, loading: false });
      loadDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to grant subscription' });
      setGrantSubForm(f => ({ ...f, loading: false }));
    }
  };

  if (!isOpen) return null;

  const formatDate = (d) => d ? new Date(d).toLocaleString() : 'N/A';
  const formatBytes = (b) => {
    if (!b) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return (b / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
  };

  const sections = [
    { id: 'overview', name: 'Overview', icon: FaUser },
    { id: 'subscription', name: 'Subscription', icon: FaCrown },
    { id: 'connections', name: 'Connections', icon: FaNetworkWired },
    { id: 'payments', name: 'Payments', icon: FaDollarSign },
    { id: 'tickets', name: 'Tickets', icon: FaTicketAlt },
    { id: 'actions', name: 'Actions', icon: FaShieldAlt },
  ];

  const user = data?.user;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <FaUser className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.email || 'Loading...'}</h2>
              <p className="text-sm text-gray-400">User Details</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`mx-5 mt-3 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-3 font-bold">×</button>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex gap-1 p-3 border-b border-gray-700 overflow-x-auto">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                activeSection === s.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}>
              <s.icon size={14} /> {s.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : !data ? (
            <p className="text-gray-400 text-center py-8">Failed to load details</p>
          ) : (
            <>
              {/* Overview */}
              {activeSection === 'overview' && (
                <div className="grid grid-cols-2 gap-4">
                  <InfoCard label="Email" value={user.email} />
                  <InfoCard label="Tier" value={user.tier} badge={user.tier === 'paid' ? 'purple' : user.tier === 'admin' ? 'yellow' : 'gray'} />
                  <InfoCard label="Status" value={user.status} badge={user.status === 'active' ? 'green' : 'red'} />
                  <InfoCard label="Email Verified" value={user.email_verified ? 'Yes' : 'No'} badge={user.email_verified ? 'green' : 'red'} />
                  <InfoCard label="2FA Enabled" value={user.totp_enabled ? 'Yes' : 'No'} badge={user.totp_enabled ? 'green' : 'gray'} />
                  <InfoCard label="Referral Code" value={user.referral_code || 'None'} />
                  <InfoCard label="Created" value={formatDate(user.created_at)} />
                  <InfoCard label="Last Login" value={formatDate(user.last_login)} />
                </div>
              )}

              {/* Subscription */}
              {activeSection === 'subscription' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoCard label="Plan Type" value={user.plan_type || 'None'} />
                    <InfoCard label="Days Remaining" value={user.days_remaining?.toString() || '0'} />
                    <InfoCard label="Start Date" value={formatDate(user.subscription_start_date)} />
                    <InfoCard label="End Date" value={formatDate(user.subscription_end_date)} />
                    <InfoCard label="Bonus Months" value={(user.bonus_months || 0).toString()} />
                    <InfoCard label="Auto Renew" value={user.auto_renew ? 'Yes' : 'No'} />
                  </div>

                  {/* Grant Subscription */}
                  <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-semibold flex items-center gap-2"><FaGift /> Grant/Extend Subscription</h3>
                      <button onClick={() => setGrantSubForm(f => ({ ...f, show: !f.show }))}
                        className="text-sm text-blue-400 hover:text-blue-300">
                        {grantSubForm.show ? 'Cancel' : 'Open'}
                      </button>
                    </div>
                    {grantSubForm.show && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-gray-400 text-sm">Plan Type</label>
                            <select value={grantSubForm.planType}
                              onChange={e => setGrantSubForm(f => ({ ...f, planType: e.target.value }))}
                              className="w-full mt-1 px-3 py-2 rounded bg-gray-600 text-white text-sm border border-gray-500">
                              <option value="1month">1 Month</option>
                              <option value="3month">3 Months</option>
                              <option value="6month">6 Months</option>
                              <option value="12month">12 Months</option>
                              <option value="manual">Manual/Custom</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Duration (days)</label>
                            <input type="number" value={grantSubForm.durationDays}
                              onChange={e => setGrantSubForm(f => ({ ...f, durationDays: e.target.value }))}
                              className="w-full mt-1 px-3 py-2 rounded bg-gray-600 text-white text-sm border border-gray-500" />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Bonus Months</label>
                            <input type="number" value={grantSubForm.bonusMonths}
                              onChange={e => setGrantSubForm(f => ({ ...f, bonusMonths: e.target.value }))}
                              className="w-full mt-1 px-3 py-2 rounded bg-gray-600 text-white text-sm border border-gray-500" />
                          </div>
                        </div>
                        <button onClick={handleGrantSubscription} disabled={grantSubForm.loading}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium disabled:opacity-50">
                          {grantSubForm.loading ? 'Granting...' : 'Grant Subscription'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Connections */}
              {activeSection === 'connections' && (
                <div className="space-y-4">
                  {data.activeConnections?.length > 0 && (
                    <div>
                      <h3 className="text-green-400 font-semibold mb-2">Active Connections ({data.activeConnections.length})</h3>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-600 text-gray-400">
                            <th className="text-left py-2">Server</th>
                            <th className="text-left py-2">Protocol</th>
                            <th className="text-left py-2">Connected</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.activeConnections.map(c => (
                            <tr key={c.id} className="border-b border-gray-700">
                              <td className="py-2 text-white">{c.server_name || c.server_id}</td>
                              <td className="py-2"><span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">{c.protocol}</span></td>
                              <td className="py-2 text-gray-300">{formatDate(c.connected_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div>
                    <h3 className="text-gray-300 font-semibold mb-2">Connection History (last 20)</h3>
                    {data.connections?.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-600 text-gray-400">
                            <th className="text-left py-2">Server</th>
                            <th className="text-left py-2">Protocol</th>
                            <th className="text-left py-2">Connected</th>
                            <th className="text-left py-2">Disconnected</th>
                            <th className="text-left py-2">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.connections.map(c => (
                            <tr key={c.id} className="border-b border-gray-700">
                              <td className="py-2 text-white">{c.server_name || c.server_id}</td>
                              <td className="py-2"><span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">{c.protocol}</span></td>
                              <td className="py-2 text-gray-300">{formatDate(c.connected_at)}</td>
                              <td className="py-2 text-gray-300">{formatDate(c.disconnected_at)}</td>
                              <td className="py-2 text-gray-300">{formatBytes((c.bytes_sent || 0) + (c.bytes_received || 0))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : <p className="text-gray-500 text-sm">No connection history</p>}
                  </div>
                </div>
              )}

              {/* Payments */}
              {activeSection === 'payments' && (
                <div>
                  {data.payments?.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-600 text-gray-400">
                          <th className="text-left py-2">Date</th>
                          <th className="text-left py-2">Plan</th>
                          <th className="text-left py-2">Amount</th>
                          <th className="text-left py-2">Status</th>
                          <th className="text-left py-2">Stripe ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.payments.map(p => (
                          <tr key={p.id} className="border-b border-gray-700">
                            <td className="py-2 text-gray-300">{formatDate(p.created_at)}</td>
                            <td className="py-2 text-white">{p.plan_type}</td>
                            <td className="py-2 text-green-400">${(p.amount / 100).toFixed(2)} {p.currency?.toUpperCase()}</td>
                            <td className="py-2">
                              <span className={`px-2 py-0.5 rounded text-xs ${p.status === 'succeeded' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="py-2 text-gray-400 font-mono text-xs">{p.stripe_payment_id?.slice(0, 20) || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="text-gray-500 text-sm">No payment history</p>}
                </div>
              )}

              {/* Tickets */}
              {activeSection === 'tickets' && (
                <div>
                  {data.tickets?.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-600 text-gray-400">
                          <th className="text-left py-2">#</th>
                          <th className="text-left py-2">Subject</th>
                          <th className="text-left py-2">Status</th>
                          <th className="text-left py-2">Priority</th>
                          <th className="text-left py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.tickets.map(t => (
                          <tr key={t.id} className="border-b border-gray-700">
                            <td className="py-2 text-blue-400">#{t.ticket_number}</td>
                            <td className="py-2 text-white">{t.subject}</td>
                            <td className="py-2">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                t.status === 'resolved' ? 'bg-green-500/20 text-green-300' :
                                t.status === 'open' ? 'bg-blue-500/20 text-blue-300' : 'bg-yellow-500/20 text-yellow-300'
                              }`}>{t.status}</span>
                            </td>
                            <td className="py-2 text-gray-300">{t.priority}</td>
                            <td className="py-2 text-gray-400">{formatDate(t.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="text-gray-500 text-sm">No tickets</p>}
                </div>
              )}

              {/* Actions */}
              {activeSection === 'actions' && (
                <div className="space-y-6">
                  {/* Reset Password */}
                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-semibold flex items-center gap-2"><FaKey /> Reset Password</h3>
                      <button onClick={() => setResetPwForm(f => ({ ...f, show: !f.show }))}
                        className="text-sm text-blue-400 hover:text-blue-300">
                        {resetPwForm.show ? 'Cancel' : 'Reset'}
                      </button>
                    </div>
                    {resetPwForm.show && (
                      <div className="flex gap-3">
                        <input type="text" placeholder="Min 8 chars, upper + number + special" value={resetPwForm.password}
                          onChange={e => setResetPwForm(f => ({ ...f, password: e.target.value }))}
                          className="flex-1 px-3 py-2 rounded bg-gray-600 text-white text-sm border border-gray-500" />
                        <button onClick={handleResetPassword} disabled={resetPwForm.loading}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium disabled:opacity-50">
                          {resetPwForm.loading ? 'Resetting...' : 'Apply'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    <h3 className="text-white font-semibold mb-3">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={async () => {
                        try {
                          await apiService.updateUser(userId, { status: user.status === 'active' ? 'suspended' : 'active' });
                          loadDetails();
                          if (onRefresh) onRefresh();
                          setMessage({ type: 'success', text: `User ${user.status === 'active' ? 'suspended' : 'activated'}` });
                        } catch (e) { setMessage({ type: 'error', text: 'Failed' }); }
                      }} className={`px-4 py-2 ${user.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded text-sm font-medium`}>
                        {user.status === 'active' ? 'Suspend User' : 'Activate User'}
                      </button>
                      <button onClick={async () => {
                        try {
                          const newTier = user.tier === 'paid' ? 'free' : 'paid';
                          await apiService.updateUser(userId, { tier: newTier });
                          loadDetails();
                          if (onRefresh) onRefresh();
                          setMessage({ type: 'success', text: `Tier changed to ${newTier}` });
                        } catch (e) { setMessage({ type: 'error', text: 'Failed' }); }
                      }} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium">
                        {user.tier === 'paid' ? 'Downgrade to Free' : 'Upgrade to Premium'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

const InfoCard = ({ label, value, badge }) => {
  const badgeColors = {
    green: 'bg-green-500/20 text-green-300',
    red: 'bg-red-500/20 text-red-300',
    purple: 'bg-purple-500/20 text-purple-300',
    yellow: 'bg-yellow-500/20 text-yellow-300',
    gray: 'bg-gray-500/20 text-gray-300',
  };

  return (
    <div className="p-3 bg-gray-700/30 rounded-lg">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {badge ? (
        <span className={`px-2 py-1 rounded text-sm font-medium ${badgeColors[badge] || badgeColors.gray}`}>{value}</span>
      ) : (
        <p className="text-white text-sm font-medium truncate">{value}</p>
      )}
    </div>
  );
};

export default UserDetailModal;
