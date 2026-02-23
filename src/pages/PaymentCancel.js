import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';
import useDocumentTitle from '../hooks/useDocumentTitle';

const PaymentCancel = () => {
  useDocumentTitle('Payment Cancelled');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20">
        <div className="text-center">
          <FaTimesCircle className="text-yellow-400 text-8xl mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Payment Cancelled</h1>
          <p className="text-xl text-gray-300 mb-8">
            Your payment was cancelled. No charges were made to your account.
          </p>

          <div className="bg-yellow-500 bg-opacity-20 border border-yellow-400 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-3">What Happened?</h3>
            <p className="text-gray-200 text-left">
              You cancelled the payment process before it was completed. This is completely normal and happens when you:
            </p>
            <ul className="text-left text-gray-200 space-y-2 mt-3">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">â€¢</span>
                <span>Clicked the back button during checkout</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">â€¢</span>
                <span>Closed the payment window</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">â€¢</span>
                <span>Decided not to complete the purchase</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-500 bg-opacity-20 border border-blue-400 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-3">Still Want to Upgrade?</h3>
            <p className="text-gray-200 mb-4">
              Premium membership gives you:
            </p>
            <ul className="text-left text-gray-200 space-y-2">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">âœ“</span>
                <span>Priority access - never wait in queue</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">âœ“</span>
                <span>Never disconnected due to capacity</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">âœ“</span>
                <span>Up to 3 devices simultaneously</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">âœ“</span>
                <span>Faster connection speeds</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">âœ“</span>
                <span>24/7 priority support</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              to="/subscribe"
              className="block w-full py-4 rounded-full text-center font-semibold text-lg transition-all bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105"
            >
              Try Again - View Plans
            </Link>
            <Link
              to="/dashboard"
              className="block w-full py-4 rounded-full text-center font-semibold text-lg transition-all bg-white bg-opacity-20 text-white hover:bg-opacity-30"
            >
              Back to Dashboard
            </Link>
            <Link
              to="/"
              className="block w-full py-3 rounded-full text-center font-semibold transition-all text-gray-300 hover:text-white"
            >
              Go to Homepage
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white border-opacity-20">
            <p className="text-gray-400 text-sm mb-3">
              Need help or have questions?
            </p>
            <a
              href="mailto:support@vpn-xo.com"
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;

