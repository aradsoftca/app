import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';
import { apiService, setAccessToken } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import useDocumentTitle from '../hooks/useDocumentTitle';

const GoogleCallback = () => {
  useDocumentTitle('Sign In');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setError('Google authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Send the authorization code to backend via apiService
        const { data } = await apiService.googleCallback(code);

        if (data.accessToken) {
          // SEC-TOKEN-01: Store access token in memory only (never localStorage).
          // Server already set the HttpOnly refreshToken cookie on this request.
          setAccessToken(data.accessToken);
          localStorage.setItem('user', JSON.stringify(data.user));

          // Full page navigation — AuthContext init will restore session from cookie on reload.
          const dest = data.user.tier === 'admin' ? '/admin' : '/dashboard';
          window.location.href = dest;
        } else {
          throw new Error('No access token received');
        }
      } catch (err) {
        console.error('Google OAuth error:', err);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {error ? (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-6 text-white">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-2">Authentication Failed</h2>
            <p className="text-gray-200">{error}</p>
            <p className="text-sm text-gray-300 mt-4">Redirecting to login...</p>
          </div>
        ) : (
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 text-white">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <FaSpinner className="text-6xl text-blue-400" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Completing Sign In...</h2>
            <p className="text-gray-300">Please wait while we authenticate your account</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GoogleCallback;
