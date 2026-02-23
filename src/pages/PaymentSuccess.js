import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { apiService } from '../services/api';
import useDocumentTitle from '../hooks/useDocumentTitle';

const PaymentSuccess = () => {
  useDocumentTitle('Payment Success');
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [planType, setPlanType] = useState(null);

  const getPlanName = (type) => {
    switch (type) {
      case 'monthly': return 'Monthly';
      case '6month': return '6-Month';
      case '12month': return '12-Month';
      default: return 'Premium';
    }
  };

  const verifyAndLoad = useCallback(async () => {
    const sessionId = searchParams.get('session_id');
    const source = searchParams.get('source');
    const isCoinbase = source === 'coinbase';

    if (!sessionId && !isCoinbase) {
      setError('No payment session found');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Verify session (also triggers self-healing activation if webhook missed)
      if (sessionId) {
        try {
          const verifyRes = await apiService.verifyCheckoutSession(sessionId);
          if (verifyRes?.data?.planType) {
            setPlanType(verifyRes.data.planType);
          }
        } catch (verifyErr) {
          console.warn('Session verify:', verifyErr);
        }
      }

      // Step 2: Poll subscription status until active (max ~15s)
      const maxAttempts = isCoinbase ? 8 : 5;
      const delay = isCoinbase ? 3000 : 2000;

      for (let i = 0; i < maxAttempts; i++) {
        if (i > 0) await new Promise(r => setTimeout(r, delay));
        const response = await apiService.getSubscriptionStatus();
        const data = response.data;
        if (data?.tier === 'paid') {
          setSubscription(data);
          setLoading(false);
          return;
        }
      }

      // After polling: get latest status even if still free
      const finalRes = await apiService.getSubscriptionStatus();
      setSubscription(finalRes.data);
    } catch (err) {
      console.error('Payment verification failed:', err);
      setError('Unable to verify payment. If you were charged, your plan will activate shortly.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => { verifyAndLoad(); }, [verifyAndLoad]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-white text-6xl mx-auto mb-4 animate-spin" />
          <div className="text-white text-2xl">Verifying your payment...</div>
          <div className="text-gray-300 mt-2">This may take a few moments</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 text-center">
          <FaExclamationTriangle className="text-yellow-400 text-6xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-3">Verification Issue</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <Link
            to="/dashboard"
            className="block w-full py-3 rounded-full text-center font-semibold transition-all bg-blue-600 text-white hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = subscription?.tier === 'paid';
  const displayPlan = subscription?.planType || planType;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 text-center">
        
        {isPaid ? (
          <>
            <FaCheckCircle className="text-green-400 text-7xl mx-auto mb-5" />
            <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-gray-300 mb-6">
              Your {getPlanName(displayPlan)} plan is now active.
            </p>

            <div className="bg-white bg-opacity-10 rounded-xl p-5 mb-6 text-left space-y-3">
              <div className="flex justify-between text-gray-200">
                <span>Plan</span>
                <span className="font-semibold text-white">{getPlanName(displayPlan)}</span>
              </div>
              <div className="flex justify-between text-gray-200">
                <span>Status</span>
                <span className="font-semibold text-green-400">Active</span>
              </div>
              {subscription.daysRemaining > 0 && (
                <div className="flex justify-between text-gray-200">
                  <span>Days Remaining</span>
                  <span className="font-semibold text-white">{subscription.daysRemaining}</span>
                </div>
              )}
              {subscription.subscriptionEndDate && (
                <div className="flex justify-between text-gray-200">
                  <span>Valid Until</span>
                  <span className="font-semibold text-white">
                    {new Date(subscription.subscriptionEndDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <FaCheckCircle className="text-yellow-400 text-7xl mx-auto mb-5" />
            <h1 className="text-3xl font-bold text-white mb-2">Payment Received</h1>
            <p className="text-gray-300 mb-6">
              Your payment was received. Your Premium plan will activate within a few minutes.
              Check your dashboard for the updated status.
            </p>
          </>
        )}

        <Link
          to="/dashboard"
          className="block w-full py-4 rounded-full text-center font-semibold text-lg transition-all bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;

