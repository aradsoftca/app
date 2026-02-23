import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCrown, FaCheck, FaSpinner, FaCreditCard, FaShieldAlt, FaBitcoin } from 'react-icons/fa';
import { SiEthereum } from 'react-icons/si';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import useDocumentTitle from '../hooks/useDocumentTitle';
import axios from 'axios';

// Plans that support crypto payment (Coinbase Commerce checkout configured)
const CRYPTO_SUPPORTED_PLANS = ['monthly', '6month'];

const VPNXOSubscribe = () => {
  useDocumentTitle('Subscribe');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // 'stripe' | 'crypto'

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use plain axios (no auth interceptor) so public /plans endpoint works for anonymous users
      const API_BASE = process.env.REACT_APP_API_URL || 'https://api.vpn-xo.com';
      const response = await axios.get(`${API_BASE}/api/subscriptions/plans`);
      const paidPlans = response.data.filter(p => p.price > 0);
      const sortedPlans = paidPlans.sort((a, b) => a.price - b.price);
      setPlans(sortedPlans);
    } catch (err) {
      setError('Failed to load subscription plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) {
      navigate('/login?returnUrl=/subscribe');
      return;
    }
    try {
      setProcessingPlan(plan.plan_type);
      setError(null);

      let response;

      if (paymentMethod === 'crypto') {
        // Coinbase Commerce flow
        response = await apiService.createCoinbaseCharge({
          planType: plan.plan_type,
        });
      } else {
        // Stripe flow
        response = await apiService.createCheckoutSession({
          planType: plan.plan_type,
          priceId: plan.stripe_price_id,
        });
      }

      if (response.data.url) {
        window.location.href = response.data.url;
        return;
      }

      throw new Error('No checkout URL received');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start payment. Please try again.');
      setProcessingPlan(null);
    }
  };

  const getPlanBadge = (planType) => {
    switch (planType) {
      case 'monthly':
        return { text: 'POPULAR', color: 'bg-yellow-400 text-gray-900' };
      case '12month':
        return { text: 'BEST DEAL', color: 'bg-green-400 text-gray-900' };
      default:
        return null;
    }
  };

  const getPlanColor = (planType) => {
    switch (planType) {
      case 'monthly':
        return 'from-blue-600 to-purple-700 border-yellow-400';
      case '12month':
        return 'from-green-600 to-emerald-700 border-green-400';
      default:
        return 'from-gray-700 to-gray-800 border-white/20';
    }
  };

  const calculateSavings = (plan) => {
    if (!plan.bonus_months) return null;
    const monthlyPrice = 6.99;
    const wouldPay = monthlyPrice * plan.total_months;
    const savings = wouldPay - plan.price;
    return savings.toFixed(2);
  };

  const isCryptoAvailable = (planType) => {
    return CRYPTO_SUPPORTED_PLANS.includes(planType);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-white text-6xl mx-auto mb-4 animate-spin" />
          <div className="text-white text-2xl">Loading subscription plans...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="text-white hover:text-gray-300 transition">
              &larr; Back to Home
            </Link>
            <img src="/logos/logo_vpnxo_original.png" alt="VPN XO" className="h-12" />
            <div className="text-white">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-300">Logged in as: </span>
                  <span className="font-semibold">{user?.email}</span>
                </>
              ) : (
                <Link to="/login?returnUrl=/subscribe" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <FaCrown className="text-yellow-400 text-6xl mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-white mb-4">Upgrade to Premium</h1>
          <p className="text-xl text-gray-300">Unlock all features and enjoy priority access</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-500/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-300 text-center">{error}</p>
          </div>
        )}

        {/* Payment Method Toggle */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-2">
            <div className="flex gap-2">
              {/* Stripe Option */}
              <button
                onClick={() => setPaymentMethod('stripe')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                  paymentMethod === 'stripe'
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <FaCreditCard className="text-xl" />
                <span>Pay with Card</span>
                {paymentMethod === 'stripe' && (
                  <FaShieldAlt className="text-green-600 text-sm" />
                )}
              </button>

              {/* Crypto Option */}
              <button
                onClick={() => setPaymentMethod('crypto')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                  paymentMethod === 'crypto'
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <FaBitcoin className="text-xl" />
                <span>Pay with Crypto</span>
                <SiEthereum className="text-lg" />
              </button>
            </div>
          </div>

          {/* Crypto info banner */}
          {paymentMethod === 'crypto' && (
            <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-300 text-sm">
                <FaBitcoin className="flex-shrink-0" />
                <span>
                  Pay with Bitcoin, Ethereum, USDC, and other cryptocurrencies via Coinbase Commerce.
                  Crypto payments are one-time (no auto-renewal).
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const badge = getPlanBadge(plan.plan_type);
            const savings = calculateSavings(plan);
            const isProcessing = processingPlan === plan.plan_type;
            const cryptoAvailable = isCryptoAvailable(plan.plan_type);
            const showCryptoUnavailable = paymentMethod === 'crypto' && !cryptoAvailable;

            return (
              <div
                key={plan.id}
                className={`relative bg-gradient-to-br ${getPlanColor(plan.plan_type)} p-8 rounded-2xl border-4 ${
                  badge ? 'scale-105 shadow-2xl z-10' : 'opacity-90 hover:opacity-100'
                } transition-all duration-300 hover:scale-105 ${showCryptoUnavailable ? 'opacity-60' : ''}`}
              >
                {badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-full text-center">
                    <span className={`${badge.color} px-4 py-1 rounded-full text-sm font-bold shadow-lg`}>
                      {badge.text}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-5xl font-bold text-white mb-2">${plan.price}</div>
                  <div className="text-gray-200">
                    for {plan.total_months} month{plan.total_months > 1 ? 's' : ''}
                  </div>
                  {plan.bonus_months > 0 && (
                    <div className="mt-2">
                      <span className="bg-green-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                        +{plan.bonus_months} MONTH{plan.bonus_months > 1 ? 'S' : ''} FREE
                      </span>
                    </div>
                  )}
                  {savings && (
                    <div className="text-green-300 font-bold mt-2">Save ${savings}</div>
                  )}
                </div>

                <div className="space-y-3 mb-8">
                  {['Priority access to all servers', 'No disconnections', 'Faster connection speeds', `Up to ${plan.max_devices} devices`, '24/7 priority support', 'Unlimited bandwidth', 'Cancel anytime'].map((f, i) => (
                    <div key={i} className="flex items-center text-white">
                      <FaCheck className="text-green-300 mr-3 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                {showCryptoUnavailable ? (
                  <div className="w-full py-4 rounded-lg font-bold text-center text-gray-300 bg-gray-600/50">
                    Crypto not available for this plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-lg font-bold text-xl transition transform shadow-lg ${
                      isProcessing
                        ? 'bg-gray-500 cursor-not-allowed'
                        : paymentMethod === 'crypto'
                          ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white hover:scale-105'
                          : 'bg-white hover:bg-gray-100 hover:scale-105 text-gray-900'
                    }`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center">
                        <FaSpinner className="animate-spin mr-2" />
                        Processing...
                      </span>
                    ) : paymentMethod === 'crypto' ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaBitcoin /> Pay with Crypto
                      </span>
                    ) : (
                      <span>Subscribe Now</span>
                    )}
                  </button>
                )}

                <p className="text-center text-white text-sm mt-4 opacity-75 flex items-center justify-center">
                  {paymentMethod === 'crypto' ? (
                    <>
                      <FaBitcoin className="mr-1" /> Powered by Coinbase Commerce
                    </>
                  ) : (
                    <>
                      <FaShieldAlt className="mr-1" /> Secure payment via Stripe
                    </>
                  )}
                </p>
              </div>
            );
          })}
        </div>

        {/* Comparison */}
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 max-w-4xl mx-auto mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Free vs Premium</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-white mb-4 text-xl">Free Plan</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start"><span className="text-green-400 mr-2">&#10003;</span><span>Access to all servers</span></li>
                <li className="flex items-start"><span className="text-green-400 mr-2">&#10003;</span><span>All VPN protocols</span></li>
                <li className="flex items-start"><span className="text-yellow-400 mr-2">&#9888;</span><span>Queue-based access (250 safe slots)</span></li>
                <li className="flex items-start"><span className="text-yellow-400 mr-2">&#9888;</span><span>May disconnect when full (20-min grace)</span></li>
                <li className="flex items-start"><span className="text-yellow-400 mr-2">&#9888;</span><span>Standard speeds</span></li>
                <li className="flex items-start"><span className="text-yellow-400 mr-2">&#9888;</span><span>1 device only</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-xl">Premium Plan</h4>
              <ul className="space-y-3 text-green-300">
                <li className="flex items-start"><span className="text-green-400 mr-2">&#10003;</span><span>Priority access &mdash; never wait</span></li>
                <li className="flex items-start"><span className="text-green-400 mr-2">&#10003;</span><span>Never disconnected</span></li>
                <li className="flex items-start"><span className="text-green-400 mr-2">&#10003;</span><span>Faster speeds</span></li>
                <li className="flex items-start"><span className="text-green-400 mr-2">&#10003;</span><span>Priority support</span></li>
                <li className="flex items-start"><span className="text-green-400 mr-2">&#10003;</span><span>Unlimited bandwidth</span></li>
                <li className="flex items-start"><span className="text-green-400 mr-2">&#10003;</span><span>Up to 3 devices</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Terms footnote */}
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 text-xs">
            {paymentMethod === 'crypto'
              ? 'Crypto payments are one-time and will not auto-renew. '
              : 'You can cancel anytime to prevent future charges. '}
            All sales are final. By subscribing you agree to our{' '}
            <Link to="/terms" className="underline hover:text-gray-300">Terms of Service</Link>.
          </p>
        </div>

        {/* Accepted Cryptocurrencies */}
        {paymentMethod === 'crypto' && (
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 max-w-4xl mx-auto mt-8">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Accepted Cryptocurrencies</h3>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                { name: 'Bitcoin', symbol: 'BTC', color: 'text-orange-400' },
                { name: 'Ethereum', symbol: 'ETH', color: 'text-blue-400' },
                { name: 'USD Coin', symbol: 'USDC', color: 'text-blue-300' },
                { name: 'Litecoin', symbol: 'LTC', color: 'text-gray-300' },
                { name: 'Dogecoin', symbol: 'DOGE', color: 'text-yellow-400' },
                { name: 'DAI', symbol: 'DAI', color: 'text-yellow-300' },
              ].map((coin) => (
                <div key={coin.symbol} className="flex flex-col items-center gap-1">
                  <div className={`text-2xl font-bold ${coin.color}`}>{coin.symbol}</div>
                  <div className="text-xs text-gray-400">{coin.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VPNXOSubscribe;
