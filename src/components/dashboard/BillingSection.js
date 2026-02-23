import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCreditCard,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCrown,
  FaExclamationTriangle,
  FaHistory,
  FaInfoCircle,
} from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import { apiService } from '../../services/api';

const BillingSection = ({ subscription, onCancelSubscription, onNavigateToSupport }) => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [infoMsg, setInfoMsg] = useState(null);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getPaymentHistory();
      setPaymentHistory(response.data || []);
    } catch (err) {
      console.error('Failed to load payment history:', err);
      setError('Failed to load payment history');
      setPaymentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower === 'completed' || statusLower === 'paid' || statusLower === 'success') {
      return <FaCheckCircle className='text-green-400' />;
    }
    
    if (statusLower === 'failed' || statusLower === 'cancelled') {
      return <FaTimesCircle className='text-red-400' />;
    }
    
    if (statusLower === 'pending') {
      return <FaClock className='text-yellow-400' />;
    }
    
    return <FaClock className='text-gray-400' />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const isPremium = subscription?.tier === 'paid' || subscription?.tier === 'premium';
  const isActive = isPremium && (subscription?.stripeStatus === 'active' || !subscription?.stripeStatus);
  const isCancelled = subscription?.cancelAtPeriodEnd || subscription?.stripeStatus === 'canceled';

  return (
    <div className='space-y-6'>
      {/* Current Subscription Card */}
      <Card className='p-6'>
        <h3 className='text-2xl font-bold text-white mb-6 flex items-center'>
          <FaCreditCard className='mr-3 text-blue-400' />
          Current Subscription
        </h3>

        <div className='grid md:grid-cols-2 gap-6'>
          {/* Plan Details */}
          <div className='space-y-4'>
            <div>
              <div className='text-gray-400 text-sm mb-1'>Plan</div>
              <div className='text-white text-xl font-semibold flex items-center'>
                {isPremium ? (
                  <>
                    <FaCrown className='text-yellow-400 mr-2' />
                    Premium Plan
                  </>
                ) : (
                  <>
                    <FaInfoCircle className='text-gray-400 mr-2' />
                    Free Plan
                  </>
                )}
              </div>
            </div>

            {isPremium && (
              <>
                <div>
                  <div className='text-gray-400 text-sm mb-1'>Status</div>
                  <div className='text-white font-medium flex items-center'>
                    {isActive ? (
                      <>
                        <FaCheckCircle className='text-green-400 mr-2' />
                        Active
                      </>
                    ) : isCancelled ? (
                      <>
                        <FaExclamationTriangle className='text-yellow-400 mr-2' />
                        Cancelled (Active until {formatDate(subscription?.end_date)})
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className='text-red-400 mr-2' />
                        Expired
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <div className='text-gray-400 text-sm mb-1'>Expires</div>
                  <div className='text-white font-medium'>
                    {formatDate(subscription?.subscriptionEndDate)}
                  </div>
                </div>
              </>
            )}

            {!isPremium && (
              <div className='bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg p-4'>
                <p className='text-blue-300 text-sm'>
                  Upgrade to Premium to unlock unlimited bandwidth, faster speeds, and access to all server locations worldwide.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className='space-y-3'>
            {infoMsg && (
              <div className='p-3 bg-blue-500 bg-opacity-20 border border-blue-500 border-opacity-40 rounded-lg text-blue-200 text-sm flex items-center justify-between'>
                <span>{infoMsg}</span>
                <button onClick={() => setInfoMsg(null)} className='ml-2 text-blue-300 hover:text-white'>&times;</button>
              </div>
            )}
            {!isPremium ? (
              <Link to='/subscribe'>
                <Button variant='warning' size='lg' icon={<FaCrown />} fullWidth>
                  Upgrade to Premium
                </Button>
              </Link>
            ) : (
              <>
                {isActive && (
                  <>
                    <Button
                      variant='outline'
                      size='md'
                      fullWidth
                      onClick={() => setInfoMsg('To update your payment method, please contact support or visit the subscription page.')}
                    >
                      Update Payment Method
                    </Button>
                    <Button
                      variant='danger'
                      size='md'
                      fullWidth
                      onClick={onCancelSubscription}
                    >
                      Cancel Subscription
                    </Button>
                  </>
                )}
                {isCancelled && (
                  <Link to='/subscribe'>
                    <Button variant='primary' size='lg' icon={<FaCrown />} fullWidth>
                      Reactivate Subscription
                    </Button>
                  </Link>
                )}
              </>
            )}

            <div className='mt-4 p-4 bg-purple-500 bg-opacity-10 border border-purple-500 border-opacity-30 rounded-lg'>
              <h4 className='text-white font-semibold mb-2 flex items-center'>
                <FaInfoCircle className='mr-2 text-purple-400' />
                Need Help?
              </h4>
              <p className='text-gray-300 text-sm mb-3'>
                Have questions about billing or subscriptions?
              </p>
              <Button
                  variant='outline'
                  size='sm'
                  fullWidth
                  onClick={() => {
                    if (onNavigateToSupport) {
                      onNavigateToSupport();
                    }
                  }}
                >
                  Contact Support
                </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment History Card */}
      <Card className='p-6'>
        <h3 className='text-2xl font-bold text-white mb-6 flex items-center'>
          <FaHistory className='mr-3 text-green-400' />
          Payment History
        </h3>

        {loading ? (
          <div className='text-center py-12'>
            <motion.div
              className='inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full'
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <div className='text-gray-400 mt-4'>Loading payment history...</div>
          </div>
        ) : error ? (
          <div className='text-center py-12'>
            <FaExclamationTriangle className='text-5xl text-yellow-400 mx-auto mb-4' />
            <div className='text-gray-400 mb-2'>{error}</div>
            <Button variant='outline' size='sm' onClick={loadPaymentHistory}>
              Retry
            </Button>
          </div>
        ) : paymentHistory.length === 0 ? (
          <div className='text-center py-12'>
            <FaCreditCard className='text-6xl text-gray-600 mx-auto mb-4' />
            <div className='text-gray-400 mb-2 text-lg font-medium'>No payment history yet</div>
            <p className='text-gray-500 text-sm'>
              Your payment transactions will appear here once you subscribe
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-700'>
                  <th className='text-left py-3 px-4 text-gray-400 font-semibold text-sm'>Date</th>
                  <th className='text-left py-3 px-4 text-gray-400 font-semibold text-sm'>Plan</th>
                  <th className='text-left py-3 px-4 text-gray-400 font-semibold text-sm'>Period</th>
                  <th className='text-left py-3 px-4 text-gray-400 font-semibold text-sm'>Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, index) => (
                  <motion.tr
                    key={payment.id || index}
                    className='border-b border-gray-800 hover:bg-white hover:bg-opacity-5 transition-colors'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className='py-4 px-4 text-white'>
                      {formatDate(payment.created_at)}
                    </td>
                    <td className='py-4 px-4 text-white capitalize'>
                      {payment.plan_type || payment.plan || 'Premium'}
                    </td>
                    <td className='py-4 px-4 text-gray-300 text-sm'>
                      {formatDate(payment.start_date)} — {formatDate(payment.end_date)}
                    </td>
                    <td className='py-4 px-4'>
                      <div className='flex items-center space-x-2'>
                        {getStatusIcon(payment.status)}
                        <span className='text-white capitalize'>
                          {payment.status || 'active'}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Billing Information */}
      <Card className='p-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-opacity-10 border border-blue-500 border-opacity-30'>
        <h4 className='text-lg font-semibold text-white mb-4 flex items-center'>
          <FaInfoCircle className='mr-2 text-blue-400' />
          Billing Information
        </h4>
        <div className='grid md:grid-cols-2 gap-4'>
          <ul className='space-y-2 text-gray-300 text-sm'>
            <li className='flex items-start'>
              <FaCheckCircle className='text-green-400 mr-2 mt-1 flex-shrink-0' />
              <span>All subscriptions are billed monthly</span>
            </li>
            <li className='flex items-start'>
              <FaCheckCircle className='text-green-400 mr-2 mt-1 flex-shrink-0' />
              <span>Cancel anytime - no questions asked</span>
            </li>
            <li className='flex items-start'>
              <FaCheckCircle className='text-green-400 mr-2 mt-1 flex-shrink-0' />
              <span>All sales are final — no refunds</span>
            </li>
          </ul>
          <ul className='space-y-2 text-gray-300 text-sm'>
            <li className='flex items-start'>
              <FaCheckCircle className='text-green-400 mr-2 mt-1 flex-shrink-0' />
              <span>Subscription remains active until period end</span>
            </li>
            <li className='flex items-start'>
              <FaCheckCircle className='text-green-400 mr-2 mt-1 flex-shrink-0' />
              <span>Secure payment processing</span>
            </li>
            <li className='flex items-start'>
              <FaCheckCircle className='text-green-400 mr-2 mt-1 flex-shrink-0' />
              <span>24/7 customer support available</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default BillingSection;
