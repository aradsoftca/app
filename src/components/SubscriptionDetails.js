import React from 'react';
import { motion } from 'framer-motion';
import {
  FaCrown,
  FaCheckCircle,
  FaCalendarAlt,
  FaClock,
  FaGift,
  FaInfoCircle,
  FaArrowRight,
} from 'react-icons/fa';

/**
 * AAA-Level Subscription Details Component
 * Shows complete subscription information including bonus months
 */
const SubscriptionDetails = ({ subscription, onUpgrade }) => {
  const isPaid = subscription?.tier === 'paid';
  const planType = subscription?.plan_type;
  
  // Plan details mapping
  const planDetails = {
    monthly: {
      name: 'Monthly Plan',
      duration: '1 month',
      bonus: 0,
      total: 1,
      price: '$6.99/month'
    },
    '6month': {
      name: '6+1 Month Plan',
      duration: '6 months',
      bonus: 1,
      total: 7,
      price: '$41.99 (7 months total)'
    },
    '12month': {
      name: '12+2 Month Plan',
      duration: '12 months',
      bonus: 2,
      total: 14,
      price: '$83.99 (14 months total)'
    }
  };

  const currentPlan = planType ? planDetails[planType] : null;
  const daysRemaining = subscription?.days_remaining || 0;
  const subscriptionEndDate = subscription?.subscription_end_date 
    ? new Date(subscription.subscription_end_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!subscription?.subscription_start_date || !subscription?.subscription_end_date) return 0;
    const start = new Date(subscription.subscription_start_date);
    const end = new Date(subscription.subscription_end_date);
    const now = new Date();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {isPaid && currentPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl p-8 border-2 border-yellow-400"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FaCrown className="text-4xl text-yellow-200" />
              <div>
                <h3 className="text-2xl font-bold text-white">{currentPlan.name}</h3>
                <p className="text-yellow-100">Active Premium Subscription</p>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-md px-4 py-2 rounded-full">
              <span className="text-white font-bold">ACTIVE</span>
            </div>
          </div>

          {/* Subscription Details Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {/* Days Remaining */}
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FaClock className="text-yellow-200" />
                <span className="text-yellow-100 text-sm">Time Remaining</span>
              </div>
              <div className="text-3xl font-bold text-white">{daysRemaining}</div>
              <div className="text-yellow-100 text-sm">days left</div>
            </div>

            {/* Expiry Date */}
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FaCalendarAlt className="text-yellow-200" />
                <span className="text-yellow-100 text-sm">Expires On</span>
              </div>
              <div className="text-lg font-bold text-white">{subscriptionEndDate}</div>
            </div>

            {/* Bonus Months */}
            {currentPlan.bonus > 0 && (
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FaGift className="text-yellow-200" />
                  <span className="text-yellow-100 text-sm">Bonus</span>
                </div>
                <div className="text-3xl font-bold text-white">{currentPlan.bonus}</div>
                <div className="text-yellow-100 text-sm">month{currentPlan.bonus > 1 ? 's' : ''} FREE!</div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-yellow-100 mb-2">
              <span>Subscription Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
              <div
                className="bg-yellow-200 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Plan Details */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4">
            <div className="flex items-start space-x-2">
              <FaInfoCircle className="text-yellow-200 mt-1" />
              <div className="text-yellow-100 text-sm">
                <p className="font-semibold mb-1">Plan Details:</p>
                <p>• {currentPlan.duration} subscription</p>
                {currentPlan.bonus > 0 && (
                  <p>• Includes {currentPlan.bonus} month{currentPlan.bonus > 1 ? 's' : ''} FREE bonus</p>
                )}
                <p>• Total duration: {currentPlan.total} months</p>
                <p>• Price: {currentPlan.price}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Free Tier Status */}
      {!isPaid && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border-2 border-blue-500"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Free Tier</h3>
            <p className="text-gray-300">You're currently on the free plan</p>
          </div>
          
          <div className="bg-blue-900 bg-opacity-30 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-bold text-white mb-4">Free Plan Includes:</h4>
            <ul className="space-y-2">
              {[
                'Access to all server locations',
                'Basic encryption (chacha20-ietf-poly1305)',
                '1 device connection',
                'Community support',
                'Unlimited bandwidth'
              ].map((feature, i) => (
                <li key={i} className="flex items-center text-gray-200">
                  <FaCheckCircle className="text-green-400 mr-3 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center space-x-2"
          >
            <FaCrown />
            <span>Upgrade to Premium</span>
            <FaArrowRight />
          </button>
        </motion.div>
      )}

      {/* Premium Plans Comparison */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20">
        <h3 className="text-2xl font-bold text-white mb-6">
          {isPaid ? 'Other Available Plans' : 'Premium Plans'}
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Monthly Plan */}
          <div className={`rounded-xl p-6 border-2 ${
            planType === 'monthly'
              ? 'border-yellow-400 bg-gradient-to-br from-yellow-600 to-orange-600'
              : 'border-gray-600 bg-white bg-opacity-5'
          }`}>
            <div className="text-center mb-4">
              <h4 className="text-xl font-bold text-white mb-2">Monthly</h4>
              <div className="text-3xl font-bold text-white mb-1">$6.99</div>
              <div className="text-sm text-gray-300">per month</div>
            </div>
            <ul className="space-y-2 mb-4 text-sm">
              <li className="flex items-center text-gray-200">
                <FaCheckCircle className="text-green-400 mr-2 flex-shrink-0" />
                <span>Premium encryption</span>
              </li>
              <li className="flex items-center text-gray-200">
                <FaCheckCircle className="text-green-400 mr-2 flex-shrink-0" />
                <span>5 devices</span>
              </li>
              <li className="flex items-center text-gray-200">
                <FaCheckCircle className="text-green-400 mr-2 flex-shrink-0" />
                <span>Priority support</span>
              </li>
            </ul>
            {planType === 'monthly' && (
              <div className="bg-yellow-400 text-gray-900 text-center py-2 rounded-lg font-bold text-sm">
                Current Plan
              </div>
            )}
          </div>

          {/* 6+1 Month Plan */}
          <div className={`rounded-xl p-6 border-2 relative ${
            planType === '6month'
              ? 'border-yellow-400 bg-gradient-to-br from-yellow-600 to-orange-600'
              : 'border-purple-500 bg-gradient-to-br from-purple-600 to-pink-600'
          }`}>
            {planType !== '6month' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-400 text-gray-900 px-3 py-1 rounded-full font-bold text-xs">
                BEST VALUE
              </div>
            )}
            <div className="text-center mb-4">
              <h4 className="text-xl font-bold text-white mb-2">6+1 Months</h4>
              <div className="text-3xl font-bold text-white mb-1">$41.99</div>
              <div className="text-sm text-gray-200">7 months total</div>
            </div>
            <ul className="space-y-2 mb-4 text-sm">
              <li className="flex items-center text-white">
                <FaCheckCircle className="text-green-300 mr-2 flex-shrink-0" />
                <span>Everything in Monthly</span>
              </li>
              <li className="flex items-center text-white">
                <FaGift className="text-yellow-300 mr-2 flex-shrink-0" />
                <span className="font-bold">1 month FREE bonus</span>
              </li>
              <li className="flex items-center text-white">
                <FaCheckCircle className="text-green-300 mr-2 flex-shrink-0" />
                <span>Save $6.94</span>
              </li>
            </ul>
            {planType === '6month' && (
              <div className="bg-yellow-400 text-gray-900 text-center py-2 rounded-lg font-bold text-sm">
                Current Plan
              </div>
            )}
          </div>

          {/* 12+2 Month Plan */}
          <div className={`rounded-xl p-6 border-2 relative ${
            planType === '12month'
              ? 'border-yellow-400 bg-gradient-to-br from-yellow-600 to-orange-600'
              : 'border-blue-500 bg-gradient-to-br from-blue-600 to-indigo-600'
          }`}>
            {planType !== '12month' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full font-bold text-xs">
                MAXIMUM SAVINGS
              </div>
            )}
            <div className="text-center mb-4">
              <h4 className="text-xl font-bold text-white mb-2">12+2 Months</h4>
              <div className="text-3xl font-bold text-white mb-1">$83.99</div>
              <div className="text-sm text-gray-200">14 months total</div>
            </div>
            <ul className="space-y-2 mb-4 text-sm">
              <li className="flex items-center text-white">
                <FaCheckCircle className="text-green-300 mr-2 flex-shrink-0" />
                <span>Everything in 6+1</span>
              </li>
              <li className="flex items-center text-white">
                <FaGift className="text-yellow-300 mr-2 flex-shrink-0" />
                <span className="font-bold">2 months FREE bonus</span>
              </li>
              <li className="flex items-center text-white">
                <FaCheckCircle className="text-green-300 mr-2 flex-shrink-0" />
                <span>Save $13.87</span>
              </li>
            </ul>
            {planType === '12month' && (
              <div className="bg-yellow-400 text-gray-900 text-center py-2 rounded-lg font-bold text-sm">
                Current Plan
              </div>
            )}
          </div>
        </div>

        {!isPaid && (
          <div className="mt-6 text-center">
            <button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all inline-flex items-center space-x-2"
            >
              <FaCrown />
              <span>Choose Your Plan</span>
              <FaArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDetails;
