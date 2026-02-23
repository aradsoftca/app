import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaDollarSign,
  FaCheckCircle,
  FaTimesCircle,
  FaCreditCard,
  FaDownload,
  FaSearch,
} from 'react-icons/fa';
import { apiService } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import useConfirm from '../../hooks/useConfirm';
import ConfirmDialog from '../common/ConfirmDialog';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    failedPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const { confirm: confirmDialog, dialogProps } = useConfirm();

  useEffect(() => {
    loadPaymentData();
    const interval = setInterval(loadPaymentData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      
      // Fetch real payment data from API
      try {
        const response = await apiService.getAdminPaymentHistory();
        const paymentData = response.data || [];
        
        // Calculate real statistics from actual payment data
        const totalRevenue = paymentData.reduce((sum, payment) => 
          payment.status === 'succeeded' ? sum + (payment.amount || 0) : sum, 0
        );
        
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyRevenue = paymentData
          .filter(p => new Date(p.created_at) >= monthStart && p.status === 'succeeded')
          .reduce((sum, payment) => sum + (payment.amount || 0), 0);
        
        const activeSubscriptions = paymentData.filter(p => p.status === 'active').length;
        const failedPayments = paymentData.filter(p => p.status === 'failed').length;
        
        setPayments(paymentData);
        setStats({
          totalRevenue,
          monthlyRevenue,
          activeSubscriptions,
          failedPayments,
        });
      } catch (error) {
        console.error('Failed to load payment data:', error);
        setPayments([]);
        setStats({ totalRevenue: 0, monthlyRevenue: 0, activeSubscriptions: 0, failedPayments: 0 });
      }

      // Load active subscriptions
      try {
        const subsRes = await apiService.getAdminSubscriptions();
        setSubscriptions(subsRes.data || []);
      } catch (error) {
        console.error('Failed to load subscriptions:', error);
        setSubscriptions([]);
      }
    } catch (error) {
      console.error('Failed to load payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    if (!status) return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500 text-white">Unknown</span>;
    const badges = {
      succeeded: 'bg-green-500 text-white',
      active: 'bg-green-500 text-white',
      failed: 'bg-red-500 text-white',
      canceled: 'bg-gray-500 text-white',
      pending: 'bg-yellow-500 text-white',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status] || 'bg-gray-500 text-white'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesFilter = filter === 'all' || payment.status === filter;
    const matchesSearch = payment.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const exportCsv = () => {
    const headers = ['Date', 'Email', 'Plan', 'Amount', 'Status', 'Payment ID'];
    const rows = filteredPayments.map(p => [
      new Date(p.created_at).toISOString(),
      p.user_email,
      p.plan,
      p.amount,
      p.status,
      p.stripe_payment_id || ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCancelSubscription = async (subId) => {
    const ok = await confirmDialog({ title: 'Cancel Subscription', message: 'Are you sure you want to cancel this subscription?', confirmText: 'Cancel Subscription', variant: 'danger' });
    if (!ok) return;
    try {
      await apiService.cancelAdminSubscription(subId);
      loadPaymentData();
    } catch (err) {
      console.error('Cancel failed:', err);
      alert('Failed to cancel subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-xl">Loading payment data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-600 to-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Total Revenue</p>
                <p className="text-white text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <FaDollarSign className="text-green-200 text-4xl" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Monthly Revenue</p>
                <p className="text-white text-3xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
              </div>
              <FaCreditCard className="text-blue-200 text-4xl" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-600 to-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Active Subscriptions</p>
                <p className="text-white text-3xl font-bold">{stats.activeSubscriptions}</p>
              </div>
              <FaCheckCircle className="text-purple-200 text-4xl" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-br from-red-600 to-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm">Failed Payments</p>
                <p className="text-white text-3xl font-bold">{stats.failedPayments}</p>
              </div>
              <FaTimesCircle className="text-red-200 text-4xl" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Payment History */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Payment History</h2>
          <Button variant="outline" size="sm" icon={<FaDownload />} onClick={exportCsv}>
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Payments</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white border-opacity-20">
                <th className="text-left py-3 px-4 text-gray-300">Date</th>
                <th className="text-left py-3 px-4 text-gray-300">User</th>
                <th className="text-left py-3 px-4 text-gray-300">Plan</th>
                <th className="text-left py-3 px-4 text-gray-300">Amount</th>
                <th className="text-left py-3 px-4 text-gray-300">Status</th>
                <th className="text-left py-3 px-4 text-gray-300">Payment ID</th>
                <th className="text-left py-3 px-4 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-400">
                    <FaCreditCard className="text-6xl mx-auto mb-4 opacity-50" />
                    <p>No payments found</p>
                    <p className="text-sm mt-2">Payments will appear here once users subscribe</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5">
                    <td className="py-3 px-4 text-gray-300">{formatDate(payment.created_at)}</td>
                    <td className="py-3 px-4 text-white">{payment.user_email}</td>
                    <td className="py-3 px-4 text-gray-300">{payment.plan}</td>
                    <td className="py-3 px-4 text-white font-semibold">{formatCurrency(payment.amount)}</td>
                    <td className="py-3 px-4">{getStatusBadge(payment.status)}</td>
                    <td className="py-3 px-4 text-gray-300 font-mono text-sm">{payment.stripe_payment_id}</td>
                    <td className="py-3 px-4">
                      <button className="text-blue-400 hover:text-blue-300 mr-3" onClick={() => setSelectedPayment(selectedPayment?.id === payment.id ? null : payment)}>View</button>
                      {payment.stripe_payment_id && (
                        <a href={`https://dashboard.stripe.com/payments/${payment.stripe_payment_id}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">Invoice</a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment Detail Panel */}
      {selectedPayment && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Payment Details</h3>
            <button onClick={() => setSelectedPayment(null)} className="text-gray-400 hover:text-white text-xl">&times;</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><p className="text-gray-400 text-sm">ID</p><p className="text-white">{selectedPayment.id}</p></div>
            <div><p className="text-gray-400 text-sm">User</p><p className="text-white">{selectedPayment.user_email}</p></div>
            <div><p className="text-gray-400 text-sm">Plan</p><p className="text-white">{selectedPayment.plan}</p></div>
            <div><p className="text-gray-400 text-sm">Amount</p><p className="text-white font-bold">{formatCurrency(selectedPayment.amount)}</p></div>
            <div><p className="text-gray-400 text-sm">Status</p><p>{getStatusBadge(selectedPayment.status)}</p></div>
            <div><p className="text-gray-400 text-sm">Date</p><p className="text-white">{formatDate(selectedPayment.created_at)}</p></div>
            <div><p className="text-gray-400 text-sm">Stripe ID</p><p className="text-white font-mono text-xs">{selectedPayment.stripe_payment_id || 'N/A'}</p></div>
          </div>
        </Card>
      )}

      {/* Active Subscriptions */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Active Subscriptions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white border-opacity-20">
                <th className="text-left py-3 px-4 text-gray-300">User</th>
                <th className="text-left py-3 px-4 text-gray-300">Plan</th>
                <th className="text-left py-3 px-4 text-gray-300">Amount</th>
                <th className="text-left py-3 px-4 text-gray-300">Status</th>
                <th className="text-left py-3 px-4 text-gray-300">Next Billing</th>
                <th className="text-left py-3 px-4 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400">
                    <FaCheckCircle className="text-6xl mx-auto mb-4 opacity-50" />
                    <p>No active subscriptions</p>
                    <p className="text-sm mt-2">Active subscriptions will appear here</p>
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5">
                    <td className="py-3 px-4 text-white">{sub.user_email}</td>
                    <td className="py-3 px-4 text-gray-300">{sub.plan}</td>
                    <td className="py-3 px-4 text-white font-semibold">{formatCurrency(sub.amount)}</td>
                    <td className="py-3 px-4">{getStatusBadge(sub.status)}</td>
                    <td className="py-3 px-4 text-gray-300">{formatDate(sub.current_period_end)}</td>
                    <td className="py-3 px-4">
                      <a href={sub.stripe_subscription_id ? `https://dashboard.stripe.com/subscriptions/${sub.stripe_subscription_id}` : '#'} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 mr-3">Manage</a>
                      <button className="text-red-400 hover:text-red-300" onClick={() => handleCancelSubscription(sub.id)}>Cancel</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

export default PaymentManagement;
