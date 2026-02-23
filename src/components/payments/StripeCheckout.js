import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCreditCard, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { apiService } from '../../services/api';
import Button from '../common/Button';
import Card from '../common/Card';

const StripeCheckout = ({ plan, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      // Create Stripe checkout session
      const response = await apiService.createCheckoutSession({
        priceId: plan.priceId,
        planName: plan.name,
        successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/payment-cancel`,
      });

      if (response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Failed to create checkout session. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <FaCreditCard className="text-5xl text-blue-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Complete Your Purchase</h2>
        <p className="text-gray-300">You're subscribing to the {plan.name} plan</p>
      </div>

      {error && (
        <motion.div
          className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      <div className="bg-white bg-opacity-5 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-300">Plan:</span>
          <span className="text-white font-bold">{plan.name}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-300">Price:</span>
          <span className="text-white font-bold text-2xl">{plan.price}</span>
        </div>
        <div className="border-t border-gray-600 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Total:</span>
            <span className="text-white font-bold text-3xl">{plan.price}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-green-400">
          <FaCheckCircle className="mr-2" />
          <span>Secure payment via Stripe</span>
        </div>
        <div className="flex items-center text-green-400">
          <FaCheckCircle className="mr-2" />
          <span>Instant activation</span>
        </div>
        <div className="flex items-center text-green-400">
          <FaCheckCircle className="mr-2" />
          <span>Cancel anytime</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          fullWidth
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={handleCheckout}
          loading={loading}
          disabled={loading}
          icon={loading ? <FaSpinner className="animate-spin" /> : <FaCreditCard />}
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </Button>
      </div>

      <p className="text-center text-gray-400 text-sm mt-4">
        You will be redirected to Stripe's secure checkout page
      </p>
    </Card>
  );
};

export default StripeCheckout;
