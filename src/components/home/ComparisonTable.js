import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaCrown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ComparisonTable = () => {
  const navigate = useNavigate();

  const features = [
    { name: 'Unlimited Bandwidth', free: true, premium: true },
    { name: 'Global Server Network', free: true, premium: true },
    { name: 'AES-256 Encryption', free: true, premium: true },
    { name: 'No-Logs Policy', free: true, premium: true },
    { name: 'Multiple Protocols', free: 'Limited', premium: true },
    { name: 'Simultaneous Connections', free: '1 Device', premium: '3 Devices' },
    { name: 'Connection Speed', free: 'Standard', premium: 'Ultra Fast' },
    { name: 'Priority Support', free: false, premium: true },
    { name: 'Ad Blocker', free: false, premium: true },
    { name: 'Malware Protection', free: false, premium: true },
    { name: 'Streaming Optimization', free: false, premium: true },
    { name: 'Kill Switch', free: false, premium: true },
    { name: 'Split Tunneling ¹', free: false, premium: true },
    { name: 'Dedicated IP (Optional)', free: false, premium: true },
    { name: 'Port Forwarding', free: false, premium: true },
    { name: 'Double VPN', free: false, premium: true }
  ];

  const renderValue = (value) => {
    if (value === true) {
      return <FaCheck className="text-green-500 text-xl mx-auto" />;
    } else if (value === false) {
      return <FaTimes className="text-red-400 text-xl mx-auto" />;
    } else {
      return <span className="text-gray-600 text-sm">{value}</span>;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Choose Your Plan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600"
          >
            Compare features and find the perfect plan for you
          </motion.p>
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="text-left">
              <h3 className="text-2xl font-bold">Features</h3>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-blue-100">$0/month</p>
            </div>
            <div className="text-center relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <FaCrown /> POPULAR
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <p className="text-blue-100">From $6.99/month</p>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                className="grid grid-cols-3 gap-4 p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center">
                  <span className="text-gray-700 font-medium">{feature.name}</span>
                </div>
                <div className="flex items-center justify-center">
                  {renderValue(feature.free)}
                </div>
                <div className="flex items-center justify-center">
                  {renderValue(feature.premium)}
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50">
            <div></div>
            <div className="text-center">
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Start Free
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={() => navigate('/subscribe')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105"
              >
                Get Premium
              </button>
            </div>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 mb-4">
            ✨ Upgrade anytime — cancel anytime, no lock-in
          </p>
          <p className="text-sm text-gray-500">
            No credit card required for free account • Cancel anytime • Instant activation
          </p>
          <p className="text-xs text-gray-400 mt-3">
            ¹ Split Tunneling is available on Windows and Android only. Not supported on iOS or macOS due to OS-level restrictions.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ComparisonTable;
