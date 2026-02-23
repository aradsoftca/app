import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaArrowLeft, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SEO from '../components/SEO';

const VPNXOLoginEnhanced = () => {
  const { login, isAuthenticated, user } = useAuth();
  useDocumentTitle('Sign In');
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const returnUrl = searchParams.get('returnUrl') || null;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (returnUrl) {
        navigate(returnUrl, { replace: true });
      } else if (user.tier === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, returnUrl]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);

  // Rate limit countdown timer
  useEffect(() => {
    if (rateLimitSeconds <= 0) {
      setRateLimited(false);
      return;
    }
    const timer = setInterval(() => {
      setRateLimitSeconds(prev => {
        if (prev <= 1) {
          setRateLimited(false);
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimitSeconds]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Determine redirect destination
        let destination;
        if (returnUrl) {
          destination = returnUrl;
        } else if (result.user && result.user.tier === 'admin') {
          destination = '/admin';
        } else {
          destination = '/dashboard';
        }

        navigate(destination);
      } else {
        // Handle rate limiting vs device limit
        if (result.code === 'DEVICE_LIMIT_REACHED') {
          setError(result.error || 'Device limit reached. You can only be logged in on 3 devices. Please log out from another device first.');
        } else if (result.status === 429) {
          const retryAfter = result.retryAfter || 60;
          setRateLimited(true);
          setRateLimitSeconds(retryAfter);
          setError(`Too many login attempts. Please wait ${retryAfter} seconds.`);
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }
      }
    } catch (err) {
      // Handle 429 from axios error
      if (err?.response?.status === 429) {
        const retryAfter = parseInt(err.response.headers?.['retry-after'] || '60', 10);
        setRateLimited(true);
        setRateLimitSeconds(retryAfter);
        setError(`Too many login attempts. Please wait ${retryAfter} seconds.`);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/google/callback`);
    const scope = encodeURIComponent('email profile');
    const responseType = 'code';

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;

    window.location.href = googleAuthUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <SEO
        title="Sign In — VPN XO"
        description="Sign in to your VPN XO account to manage your subscription, connect to servers, and access premium VPN features."
        path="/login"
        noindex={true}
      />
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-white hover:text-blue-300 mb-6 transition"
        >
          <FaArrowLeft className="mr-2" />
          Back to Home
        </Link>

        <Card className="p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.img
              src="/logos/logo_vpnxo_original.png"
              alt="VPN XO"
              className="h-20 mx-auto mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            />
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-300">Sign in to your VPN XO account</p>
          </div>

          {/* Error / Rate Limit Message */}
          {error && (
            <motion.div
              className={`mb-6 p-4 ${rateLimited ? 'bg-yellow-500 bg-opacity-20 border-yellow-500 text-yellow-200' : 'bg-red-500 bg-opacity-20 border-red-500 text-red-200'} border rounded-lg`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">
                    {rateLimited ? `Too many login attempts. Please wait ${rateLimitSeconds} seconds.` : error}
                  </p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="flex-shrink-0 hover:opacity-70 transition-opacity"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full mb-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all shadow-lg"
          >
            <FaGoogle className="text-xl text-red-500" />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-white border-opacity-20"></div>
            <span className="px-4 text-gray-400 text-sm">OR</span>
            <div className="flex-1 border-t border-white border-opacity-20"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              icon={<FaEnvelope />}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              icon={<FaLock />}
              required
            />

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center text-white">
                <input
                  type="checkbox"
                  className="mr-2 rounded"
                />
                <span className="text-sm">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading || rateLimited}
            >
              {rateLimited ? `Wait ${rateLimitSeconds}s` : 'Sign In'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-gray-300">
              Don't have an account?{' '}
              <Link to={returnUrl ? `/register?returnUrl=${encodeURIComponent(returnUrl)}` : '/register'} className="text-blue-400 hover:text-blue-300 font-semibold">
                Sign up for free
              </Link>
            </p>
          </div>
        </Card>

        {/* Trust Badges */}
        <motion.div
          className="mt-8 text-center text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex justify-center items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <FaLock className="text-green-400" />
              <span>Secure Login</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>256-bit Encryption</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VPNXOLoginEnhanced;
