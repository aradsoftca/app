import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaLock, FaArrowLeft, FaCheck, FaTimes, FaGoogle, FaCheckCircle } from 'react-icons/fa';
import { apiService } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SEO from '../components/SEO';

const VPNXORegisterEnhanced = () => {
  useDocumentTitle('Create Account');
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const returnUrl = searchParams.get('returnUrl') || null;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  useEffect(() => {
    // Check password strength
    const password = formData.password;
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    });
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Call the registration API directly
      const response = await apiService.register(formData.email, formData.password);

      // Registration successful
      setRegistrationSuccess(true);
      setRegisteredEmail(formData.email);
      setSuccessMessage(response.data.message || 'Registration successful! Please check your email to verify your account.');

      // Clear form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
      });

    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      await apiService.resendVerification(registeredEmail);
      setSuccessMessage('Verification email resent! Please check your inbox.');
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/google/callback`);
    const scope = encodeURIComponent('email profile');
    const responseType = 'code';

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;

    window.location.href = googleAuthUrl;
  };

  const PasswordRequirement = ({ met, text }) => (
    <div className={`flex items-center text-sm ${met ? 'text-green-400' : 'text-gray-400'}`}>
      {met ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
      <span>{text}</span>
    </div>
  );

  // Success Screen
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 text-center">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <FaCheckCircle className="text-6xl text-green-400 mx-auto" />
            </motion.div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-white mb-4">
              Check Your Email!
            </h1>

            <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-4 mb-6">
              <p className="text-green-200 text-sm">
                {successMessage}
              </p>
            </div>

            <div className="text-left bg-white bg-opacity-10 rounded-lg p-6 mb-6">
              <h3 className="text-white font-semibold mb-3">📧 Next Steps:</h3>
              <ol className="text-gray-300 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">1.</span>
                  <span>Check your inbox at <strong className="text-white">{registeredEmail}</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">2.</span>
                  <span>Click the verification link in the email</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">3.</span>
                  <span>Return here and log in to your account</span>
                </li>
              </ol>
            </div>

            <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg p-4 mb-6">
              <p className="text-yellow-200 text-sm">
                <strong>⚠️ Important:</strong> The verification link expires in 24 hours.
                Don't forget to check your spam folder!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/login')}
                variant="primary"
                size="lg"
                fullWidth
              >
                Go to Login
              </Button>

              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full text-blue-400 hover:text-blue-300 text-sm py-2 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Didn\'t receive the email? Resend'}
              </button>

              <Link
                to="/"
                className="block text-gray-400 hover:text-gray-300 text-sm py-2"
              >
                ← Back to Home
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <SEO
        title="Create Account — VPN XO"
        description="Create your free VPN XO account. Get instant access to secure VPN servers with military-grade encryption. No credit card required."
        path="/register"
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
              src="/logos/logo_vpnxo_green.png"
              alt="VPN XO"
              className="h-20 mx-auto mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            />
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-300">Start protecting your privacy today</p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-200"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm">{error}</p>
                  </div>
                  <button
                    onClick={() => setError('')}
                    className="flex-shrink-0 hover:opacity-70 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Sign Up Button */}
          <button
            onClick={handleGoogleSignup}
            type="button"
            className="w-full mb-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all shadow-lg"
          >
            <FaGoogle className="text-xl text-red-500" />
            <span>Sign up with Google</span>
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-white border-opacity-20"></div>
            <span className="px-4 text-gray-400 text-sm">OR</span>
            <div className="flex-1 border-t border-white border-opacity-20"></div>
          </div>

          {/* Register Form */}
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
              placeholder="Create a strong password"
              icon={<FaLock />}
              required
            />

            {/* Password Strength Indicator */}
            {formData.password && (
              <motion.div
                className="mb-4 p-4 bg-white bg-opacity-5 rounded-lg"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <div className="text-white text-sm font-medium mb-2">Password Requirements:</div>
                <div className="space-y-1">
                  <PasswordRequirement met={passwordStrength.length} text="At least 8 characters" />
                  <PasswordRequirement met={passwordStrength.uppercase} text="One uppercase letter" />
                  <PasswordRequirement met={passwordStrength.lowercase} text="One lowercase letter" />
                  <PasswordRequirement met={passwordStrength.number} text="One number" />
                </div>
              </motion.div>
            )}

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              icon={<FaLock />}
              required
            />

            <div className="mb-6">
              <label className="flex items-start text-white text-sm">
                <input
                  type="checkbox"
                  className="mr-2 mt-1 rounded"
                  required
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms-of-service" className="text-blue-400 hover:text-blue-300">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy-policy" className="text-blue-400 hover:text-blue-300">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Create Account
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-gray-300">
              Already have an account?{' '}
              <Link to={returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login'} className="text-blue-400 hover:text-blue-300 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </Card>

        {/* Benefits */}
        <motion.div
          className="mt-8 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-2xl mb-1">🔒</div>
              <div>Secure</div>
            </div>
            <div>
              <div className="text-2xl mb-1">⚡</div>
              <div>Fast</div>
            </div>
            <div>
              <div className="text-2xl mb-1">🌍</div>
              <div>Global</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VPNXORegisterEnhanced;
