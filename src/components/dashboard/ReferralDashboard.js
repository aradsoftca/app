import React, { useState, useEffect, useCallback } from 'react';
import {
  FaGift,
  FaLink,
  FaCopy,
  FaCheckCircle,
  FaUsers,
  FaClock,
  FaCalendarPlus,
  FaSync,
  FaShare,
} from 'react-icons/fa';
import Card from '../common/Card';
import { apiService } from '../../services/api';

// Mask email for privacy: john.doe@gmail.com → j***@gmail.com
const maskEmail = (email) => {
  if (!email || !email.includes('@')) return '***';
  const [local, domain] = email.split('@');
  if (local.length <= 1) return `${local}***@${domain}`;
  return `${local[0]}***@${domain}`;
};

const ReferralDashboard = () => {
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferral();
  }, []);

  const loadReferral = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.getReferralInfo();
      setReferral(res.data);
    } catch (err) {
      setError('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralLink = referral?.code ? `https://vpn-xo.com/register?ref=${referral.code}` : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSync className="animate-spin text-blue-400 text-2xl mr-3" />
        <span className="text-gray-400">Loading referral data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-400">{error}</p>
        <button onClick={loadReferral} className="mt-2 text-blue-400 hover:text-blue-300 text-sm">Retry</button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Link Card */}
      <Card className="p-6">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center">
          <FaGift className="mr-3 text-yellow-400" />
          Refer Friends & Earn Rewards
        </h3>
        <p className="text-gray-400 mb-6">Share your referral link and earn free premium days when friends sign up!</p>

        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <label className="text-gray-400 text-sm mb-2 block">Your Referral Code</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-lg tracking-wider">
              {referral?.code || 'N/A'}
            </div>
            <button
              onClick={() => handleCopy(referral?.code || '')}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
            >
              {copied ? <FaCheckCircle className="mr-2" /> : <FaCopy className="mr-2" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <label className="text-gray-400 text-sm mb-2 block">Your Referral Link</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-blue-400 text-sm truncate">
              {referralLink}
            </div>
            <button
              onClick={() => handleCopy(referralLink)}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center flex-shrink-0"
            >
              <FaLink className="mr-2" />
              Copy Link
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-3 mt-4">
          <a
            href={`https://twitter.com/intent/tweet?text=Try%20VPN%20XO%20for%20secure%20internet!%20${encodeURIComponent(referralLink)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm flex items-center transition-colors"
          >
            <FaShare className="mr-2" />
            Twitter
          </a>
          <a
            href={`mailto:?subject=Try%20VPN%20XO&body=Check%20out%20VPN%20XO%20for%20secure%20internet!%20${encodeURIComponent(referralLink)}`}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm flex items-center transition-colors"
          >
            <FaShare className="mr-2" />
            Email
          </a>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-lg bg-blue-500/20 mr-3">
              <FaUsers className="text-blue-400" />
            </div>
            <span className="text-gray-400 text-sm">Total Referrals</span>
          </div>
          <p className="text-3xl font-bold text-white">{referral?.stats?.total || 0}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-lg bg-green-500/20 mr-3">
              <FaCheckCircle className="text-green-400" />
            </div>
            <span className="text-gray-400 text-sm">Converted</span>
          </div>
          <p className="text-3xl font-bold text-white">{referral?.stats?.converted || 0}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-lg bg-yellow-500/20 mr-3">
              <FaClock className="text-yellow-400" />
            </div>
            <span className="text-gray-400 text-sm">Pending</span>
          </div>
          <p className="text-3xl font-bold text-white">{referral?.stats?.pending || 0}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20 mr-3">
              <FaCalendarPlus className="text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">Days Earned</span>
          </div>
          <p className="text-3xl font-bold text-white">{referral?.stats?.totalRewardDays || 0}</p>
        </Card>
      </div>

      {/* Referral List */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <FaUsers className="mr-2 text-blue-400" />
            Your Referrals
          </h3>
          <button onClick={loadReferral} className="text-gray-400 hover:text-white transition-colors">
            <FaSync />
          </button>
        </div>

        {referral?.referrals?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 text-sm">Email</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-sm">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-sm">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-sm">Reward</th>
                </tr>
              </thead>
              <tbody>
                {referral.referrals.map((ref, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-white">{maskEmail(ref.referred_email)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        ref.status === 'converted' ? 'bg-green-500/20 text-green-400'
                          : ref.status === 'registered' ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{new Date(ref.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-purple-400">{ref.reward_value ? `+${ref.reward_value} days` : '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <FaGift className="text-gray-600 text-4xl mx-auto mb-3" />
            <p className="text-gray-500">No referrals yet. Share your link to get started!</p>
          </div>
        )}
      </Card>

      {/* How It Works */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
              <FaShare className="text-blue-400 text-xl" />
            </div>
            <h4 className="text-white font-semibold mb-1">1. Share Your Link</h4>
            <p className="text-gray-400 text-sm">Send your referral link to friends and family</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <FaUsers className="text-green-400 text-xl" />
            </div>
            <h4 className="text-white font-semibold mb-1">2. They Sign Up</h4>
            <p className="text-gray-400 text-sm">When they create an account using your link</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
              <FaGift className="text-purple-400 text-xl" />
            </div>
            <h4 className="text-white font-semibold mb-1">3. Earn Rewards</h4>
            <p className="text-gray-400 text-sm">Get free premium days for each converted referral</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReferralDashboard;
