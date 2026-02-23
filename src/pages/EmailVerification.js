import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { apiService } from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import useDocumentTitle from '../hooks/useDocumentTitle';

const EmailVerification = () => {
  useDocumentTitle('Verify Email');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      setError('No verification token provided');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      setStatus('verifying');
      setMessage('Verifying your email...');

      const response = await apiService.verifyEmail(token);

      setStatus('success');
      setMessage(response.data.message || 'Email verified successfully!');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setStatus('error');

      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
        setMessage('Verification failed');
      } else {
        setError('An error occurred during verification');
        setMessage('Verification failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 text-center">
          {/* Logo */}
          <div className="mb-6">
            <img
              src="/logos/logo_vpnxo_green.png"
              alt="VPN XO"
              className="h-16 mx-auto mb-4"
            />
          </div>

          {/* Status Icon */}
          <motion.div
            className="mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {status === 'verifying' && (
              <FaSpinner className="text-6xl text-blue-400 mx-auto animate-spin" />
            )}
            {status === 'success' && (
              <FaCheckCircle className="text-6xl text-green-400 mx-auto" />
            )}
            {status === 'error' && (
              <FaTimesCircle className="text-6xl text-red-400 mx-auto" />
            )}
          </motion.div>

          {/* Message */}
          <h1 className="text-3xl font-bold text-white mb-4">
            {status === 'verifying' && 'Verifying Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h1>

          {/* Status Message */}
          {status === 'verifying' && (
            <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4 mb-6">
              <p className="text-blue-200 text-sm">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-4 mb-6">
              <p className="text-green-200 text-sm mb-2">
                {message}
              </p>
              <p className="text-green-300 text-xs">
                Redirecting to login page in 3 seconds...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-200 text-sm font-semibold mb-2">
                {message}
              </p>
              <p className="text-red-300 text-xs">
                {error}
              </p>
            </div>
          )}

          {/* Success Details */}
          {status === 'success' && (
            <div className="text-left bg-white bg-opacity-10 rounded-lg p-6 mb-6">
              <h3 className="text-white font-semibold mb-3">✅ What's Next:</h3>
              <ol className="text-gray-300 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">1.</span>
                  <span>Your email has been verified</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">2.</span>
                  <span>You can now log in to your account</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">3.</span>
                  <span>Start using VPN XO services</span>
                </li>
              </ol>
            </div>
          )}

          {/* Error Help */}
          {status === 'error' && (
            <div className="text-left bg-white bg-opacity-10 rounded-lg p-6 mb-6">
              <h3 className="text-white font-semibold mb-3">💡 Common Issues:</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  <span>Link expired (valid for 24 hours)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  <span>Link already used</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  <span>Invalid or corrupted link</span>
                </li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'success' && (
              <Button
                onClick={() => navigate('/login')}
                variant="primary"
                size="lg"
                fullWidth
              >
                Go to Login
              </Button>
            )}

            {status === 'error' && (
              <>
                <Button
                  onClick={() => navigate('/register')}
                  variant="primary"
                  size="lg"
                  fullWidth
                >
                  Register Again
                </Button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full text-blue-400 hover:text-blue-300 text-sm py-2"
                >
                  Already have an account? Login
                </button>
              </>
            )}

            {status === 'verifying' && (
              <div className="text-gray-400 text-sm">
                This may take a few seconds...
              </div>
            )}
          </div>

          {/* Home Link */}
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-gray-300 text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default EmailVerification;
