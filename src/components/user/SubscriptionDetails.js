import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaCrown,
  FaCalendarAlt,
  FaClock,
  FaGift,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRedo
} from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import { apiService } from '../../services/api';
import useConfirm from '../../hooks/useConfirm';
import ConfirmDialog from '../common/ConfirmDialog';

/**
 * Subscription Details Component
 * Shows comprehensive subscription information including days remaining
 */
const SubscriptionDetails = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const { confirm: confirmDialog, dialogProps } = useConfirm();

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSubscriptionStatus();
      setSubscription(response.data.data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (daysRemaining) => {
    if (daysRemaining > 30) return 'green';
    if (daysRemaining > 7) return 'yellow';
    return 'red';
  };

  const getProgressColor = (daysRemaining) => {
    if (daysRemaining > 30) return 'bg-green-500';
    if (daysRemaining > 7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-white">Loading subscription details...</div>
      </Card>
    );
  }

  if (!subscription || subscription.tier === 'free') {
    return (
      <Card className="p-8 text-center">
        <FaCrown className="text-6xl text-gray-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">No Active Subscription</h3>
        <p className="text-gray-300 mb-6">
          Upgrade to premium to unlock all features and get bonus months!
        </p>
        <Button
          variant="primary"
          onClick={() => window.location.href = '/pricing'}
        >
          View Plans
        </Button>
      </Card>
    );
  }

  const statusColor = getStatusColor(subscription.days_remaining);
  const progressColor = getProgressColor(subscription.days_remaining);
  const progressPercent = subscription.progressPercent || 0;

  return (
    <div className="space-y-6">
      {/* Main Subscription Card */}
      <Card className="p-8 bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaCrown className="text-4xl text-yellow-300" />
            <div>
              <h2 className="text-2xl font-bold text-white">{subscription.plan_name}</h2>
              <p className="text-blue-100">Premium Subscription</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{subscription.days_remaining}</div>
            <div className="text-blue-100">days remaining</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-blue-100 mb-2">
            <span>Subscription Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full ${progressColor} rounded-full`}
            />
          </div>
        </div>

        {/* Bonus Months Badge */}
        {subscription.bonus_months > 0 && (
          <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg p-3 mb-4">
            <FaGift className="text-yellow-300 text-xl" />
            <span className="text-white font-semibold">
              +{subscription.bonus_months} Bonus Month{subscription.bonus_months > 1 ? 's' : ''} Included!
            </span>
          </div>
        )}

        {/* Warning for expiring soon */}
        {subscription.days_remaining <= 7 && (
          <div className="flex items-center gap-2 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3">
            <FaExclamationTriangle className="text-red-300 text-xl" />
            <span className="text-white">
              Your subscription expires soon! Renew now to keep premium access.
            </span>
          </div>
        )}
      </Card>

      {/* Subscription Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Date */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaCalendarAlt className="text-blue-400 text-2xl" />
            <h3 className="text-lg font-semibold text-white">Start Date</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatDate(subscription.subscription_start_date)}
          </p>
        </Card>

        {/* End Date */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaClock className="text-purple-400 text-2xl" />
            <h3 className="text-lg font-semibold text-white">End Date</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatDate(subscription.subscription_end_date)}
          </p>
        </Card>

        {/* Plan Details */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaCheckCircle className="text-green-400 text-2xl" />
            <h3 className="text-lg font-semibold text-white">Plan Details</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Duration:</span>
              <span className="text-white font-semibold">{subscription.duration_months} months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Bonus:</span>
              <span className="text-green-400 font-semibold">
                +{subscription.bonus_months} month{subscription.bonus_months !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Total:</span>
              <span className="text-white font-semibold">{subscription.total_months} months</span>
            </div>
          </div>
        </Card>

        {/* Billing Info */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaCrown className="text-yellow-400 text-2xl" />
            <h3 className="text-lg font-semibold text-white">Billing</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Amount Paid:</span>
              <span className="text-white font-semibold">${subscription.plan_price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Per Month:</span>
              <span className="text-green-400 font-semibold">
                ${(subscription.plan_price / subscription.total_months).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Auto-Renew:</span>
              <span className="text-white font-semibold">
                {subscription.auto_renew ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">Manage Subscription</h3>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="primary"
            icon={<FaRedo />}
            onClick={() => window.location.href = '/pricing'}
          >
            Renew Subscription
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/pricing'}
          >
            Upgrade Plan
          </Button>
          {subscription.auto_renew && (
            <Button
              variant="danger"
              onClick={async () => {
                const ok = await confirmDialog({ title: 'Cancel Auto-Renew', message: 'Are you sure you want to cancel? You will keep access until the end date.', confirmText: 'Cancel Auto-Renew', variant: 'danger' });
                if (!ok) return;
                try {
                  await apiService.cancelSubscription();
                  loadSubscription();
                } catch (error) {
                  console.error('Failed to cancel subscription:', error);
                }
              }}
            >
              Cancel Auto-Renew
            </Button>
          )}
        </div>
      </Card>

      {/* Info Box */}
      <Card className="p-6 bg-blue-600 bg-opacity-20 border border-blue-500">
        <div className="flex items-start gap-3">
          <FaCheckCircle className="text-blue-400 text-2xl mt-1" />
          <div>
            <h4 className="text-white font-semibold mb-2">Subscription Information</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Your subscription includes {subscription.bonus_months} bonus month{subscription.bonus_months !== 1 ? 's' : ''}</li>
              <li>• You have {subscription.days_remaining} days of premium access remaining</li>
              <li>• Your subscription will {subscription.auto_renew ? 'automatically renew' : 'end'} on {formatDate(subscription.subscription_end_date)}</li>
              <li>• You can cancel anytime and keep access until the end date</li>
            </ul>
          </div>
        </div>
      </Card>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

export default SubscriptionDetails;
