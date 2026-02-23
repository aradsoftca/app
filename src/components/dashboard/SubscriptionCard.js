import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCrown, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaSync } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';

const SubscriptionCard = ({ subscription, onCancelSubscription }) => {
  const isPaid = subscription?.tier === 'paid';
  const isFree = subscription?.tier === 'free';
  const daysRemaining = subscription?.daysRemaining != null ? subscription.daysRemaining : 0;
  const isActive = subscription?.stripeStatus === 'active' || isPaid;
  const willCancel = subscription?.cancelAtPeriodEnd;

  const getStatusColor = () => {
    if (willCancel) return 'text-yellow-400';
    if (isActive && isPaid) return 'text-green-400';
    if (isFree) return 'text-gray-400';
    return 'text-red-400';
  };

  const getStatusText = () => {
    if (willCancel) return 'Cancels at period end';
    if (isActive && isPaid) return 'Active';
    if (isFree) return 'Free Plan';
    return 'Expired';
  };

  const getDaysRemainingColor = () => {
    if (daysRemaining > 30) return 'text-green-400';
    if (daysRemaining > 7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressPercentage = () => {
    if (!subscription?.subscriptionStartDate || !subscription?.subscriptionEndDate) return 0;
    
    const start = new Date(subscription.subscriptionStartDate).getTime();
    const end = new Date(subscription.subscriptionEndDate).getTime();
    const now = Date.now();
    
    const total = end - start;
    const elapsed = now - start;
    
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FaCrown className={`text-3xl mr-3 ${isPaid ? 'text-yellow-400' : 'text-gray-500'}`} />
          <div>
            <h3 className="text-2xl font-bold text-white">
              {isPaid ? 'Premium Plan' : 'Free Plan'}
            </h3>
            <p className="text-sm text-gray-300">
              {subscription?.planType ? subscription.planType.charAt(0).toUpperCase() + subscription.planType.slice(1) : 'Basic'}
            </p>
          </div>
        </div>
        <div className={`flex items-center ${getStatusColor()}`}>
          {isActive ? <FaCheckCircle className="mr-2" /> : <FaTimesCircle className="mr-2" />}
          <span className="font-semibold">{getStatusText()}</span>
        </div>
      </div>

      {isPaid && (
        <>
          {/* Days Remaining */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Days Remaining</span>
              <span className={`text-2xl font-bold ${getDaysRemainingColor()}`}>
                {daysRemaining} days
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                className={`h-full ${
                  daysRemaining > 30 ? 'bg-green-500' : daysRemaining > 7 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${100 - getProgressPercentage()}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Next Billing Date */}
          {subscription?.subscriptionEndDate && (
            <div className="flex items-center justify-between mb-4 p-3 bg-white bg-opacity-10 rounded-lg">
              <div className="flex items-center text-gray-300">
                <FaCalendarAlt className="mr-2" />
                <span>Next Billing Date</span>
              </div>
              <span className="text-white font-semibold">
                {new Date(subscription.subscriptionEndDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Auto Renewal */}
          <div className="flex items-center justify-between mb-4 p-3 bg-white bg-opacity-10 rounded-lg">
            <div className="flex items-center text-gray-300">
              <FaSync className="mr-2" />
              <span>Auto-Renewal</span>
            </div>
            <span className={`font-semibold ${subscription?.autoRenew !== false ? 'text-green-400' : 'text-red-400'}`}>
              {subscription?.autoRenew !== false ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/subscribe">
              <Button variant="outline" size="sm" fullWidth>
                Change Plan
              </Button>
            </Link>
            {!willCancel && (
              <Button 
                variant="danger" 
                size="sm" 
                fullWidth
                onClick={onCancelSubscription}
              >
                Cancel
              </Button>
            )}
          </div>
        </>
      )}

      {isFree && (
        <div className="space-y-4">
          <div className="p-4 bg-white bg-opacity-10 rounded-lg">
            <p className="text-gray-300 text-sm mb-3">
              Upgrade to Premium to unlock:
            </p>
            <ul className="space-y-2 text-sm text-gray-200">
              <li className="flex items-center">
                <FaCheckCircle className="text-green-400 mr-2" />
                Unlimited bandwidth
              </li>
              <li className="flex items-center">
                <FaCheckCircle className="text-green-400 mr-2" />
                All server locations
              </li>
              <li className="flex items-center">
                <FaCheckCircle className="text-green-400 mr-2" />
                Priority support
              </li>
              <li className="flex items-center">
                <FaCheckCircle className="text-green-400 mr-2" />
                Multiple devices
              </li>
            </ul>
          </div>
          
          <Link to="/subscribe">
            <Button variant="warning" size="lg" fullWidth icon={<FaCrown />}>
              Upgrade to Premium
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
};

export default SubscriptionCard;
