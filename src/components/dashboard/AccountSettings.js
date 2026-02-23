import React, { useState, useEffect } from 'react';
import {
  FaKey,
  FaEnvelope,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLock,
  FaUserCircle,
  FaSync,
} from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import api, { apiService } from '../../services/api';
import useConfirm from '../../hooks/useConfirm';

const AccountSettings = () => {
  const { user } = useAuth();
  const { confirm, dialogProps } = useConfirm();
  
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Password change state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Email change state
  const [newEmail, setNewEmail] = useState('');
  const [emailChangePassword, setEmailChangePassword] = useState('');

  // Auto-renewal state
  const [autoRenew, setAutoRenew] = useState(true);
  const [autoRenewLoading, setAutoRenewLoading] = useState(false);

  useEffect(() => {
    // Fetch current auto-renewal status
    const fetchAutoRenew = async () => {
      try {
        const res = await apiService.getSubscriptionStatus();
        setAutoRenew(res.data?.autoRenew !== false);
      } catch (e) { /* ignore */ }
    };
    fetchAutoRenew();
  }, []);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5;
    return Math.min(100, strength);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setStatusMsg({ type: 'error', text: 'Password must be at least 8 characters long!' });
      return;
    }

    if (passwordStrength < 50) {
      const ok = await confirm({
        title: 'Weak Password',
        message: 'Your password is weak. Are you sure you want to continue?',
        confirmText: 'Use Anyway',
        variant: 'warning',
      });
      if (!ok) return;
    }

    setLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      await apiService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStrength(0);
      setStatusMsg({ type: 'success', text: 'Password updated successfully!' });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to change password. Please check your current password and try again.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    
    if (!newEmail || !newEmail.includes('@')) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid email address!' });
      return;
    }

    if (newEmail === user?.email) {
      setStatusMsg({ type: 'error', text: 'New email is the same as current email!' });
      return;
    }

    if (!emailChangePassword) {
      setStatusMsg({ type: 'error', text: 'Please enter your current password to confirm email change.' });
      return;
    }

    setLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      await apiService.updateProfile({ email: newEmail, currentPassword: emailChangePassword });
      setNewEmail('');
      setEmailChangePassword('');
      setStatusMsg({ type: 'success', text: 'Email updated successfully!' });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to change email. Please try again.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoRenew = async () => {
    const newValue = !autoRenew;
    setAutoRenewLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      await api.put('/api/subscriptions/auto-renew', { autoRenew: newValue });
      setAutoRenew(newValue);
      setStatusMsg({ type: 'success', text: `Auto-renewal ${newValue ? 'enabled' : 'disabled'} successfully.` });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update auto-renewal.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setAutoRenewLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const password = window.prompt(
      'To delete your account, please enter your password for verification:'
    );

    if (!password) return;

    const ok = await confirm({
      title: 'Delete Account Permanently',
      message: 'This action cannot be undone. All your data, subscriptions, and VPN configurations will be permanently deleted.',
      confirmText: 'Delete My Account',
      variant: 'danger',
    });

    if (!ok) return;

    setLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      await apiService.deleteAccount(password);
      // SEC-TOKEN-01: Clear in-memory access token and non-sensitive user metadata.
      import('../../services/api').then(({ clearAccessToken }) => clearAccessToken()).catch(() => {});
      localStorage.removeItem('user');
      window.location.href = '/login?deleted=true';
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete account. Please try again.';
      setStatusMsg({ type: 'error', text: msg });
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-orange-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  return (
    <div className='space-y-6'>
      {/* Status Message */}
      {statusMsg.text && (
        <div className={`p-4 rounded-lg border ${statusMsg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
          <p className="text-sm flex items-center">
            {statusMsg.type === 'success' ? <FaCheckCircle className="mr-2" /> : <FaExclamationTriangle className="mr-2" />}
            {statusMsg.text}
          </p>
        </div>
      )}

      {/* Change Password */}
      <Card className='p-6'>
        <h3 className='text-2xl font-bold text-white mb-6 flex items-center'>
          <FaKey className='mr-3 text-yellow-400' />
          Change Password
        </h3>

        <form onSubmit={handlePasswordChange} className='space-y-4 max-w-2xl'>
          <div>
            <label className='block text-gray-300 mb-2 text-sm font-medium'>Current Password</label>
            <div className='relative'>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 pr-12 transition-all'
                required
                placeholder='Enter your current password'
              />
              <button
                type='button'
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className='block text-gray-300 mb-2 text-sm font-medium'>New Password</label>
            <div className='relative'>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, newPassword: e.target.value });
                  setPasswordStrength(calculatePasswordStrength(e.target.value));
                }}
                className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 pr-12 transition-all'
                required
                minLength={8}
                placeholder='Enter your new password'
              />
              <button
                type='button'
                onClick={() => setShowNewPassword(!showNewPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {passwordData.newPassword && (
              <div className='mt-2'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-xs text-gray-400'>Password Strength:</span>
                  <span className={`text-xs font-semibold ${passwordStrength < 50 ? 'text-red-400' : passwordStrength < 75 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className='w-full bg-gray-700 rounded-full h-2'>
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>
            )}
            <p className='text-gray-500 text-xs mt-2'>
              Minimum 8 characters. Use uppercase, lowercase, numbers, and symbols for a stronger password.
            </p>
          </div>

          <div>
            <label className='block text-gray-300 mb-2 text-sm font-medium'>Confirm New Password</label>
            <div className='relative'>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 pr-12 transition-all'
                required
                placeholder='Confirm your new password'
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <p className='text-red-400 text-xs mt-1 flex items-center'>
                <FaExclamationTriangle className='mr-1' />
                Passwords do not match
              </p>
            )}
          </div>

          <Button type='submit' variant='primary' size='md' icon={<FaLock />} disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </Card>

      {/* Change Email */}
      <Card className='p-6'>
        <h3 className='text-2xl font-bold text-white mb-6 flex items-center'>
          <FaEnvelope className='mr-3 text-blue-400' />
          Change Email Address
        </h3>

        <div className='space-y-4 max-w-2xl'>
          <div>
            <label className='block text-gray-300 mb-2 text-sm font-medium'>Current Email</label>
            <div className='relative'>
              <input
                type='email'
                value={user?.email || ''}
                disabled
                className='w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed'
              />
              <FaUserCircle className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500' />
            </div>
          </div>

          <form onSubmit={handleEmailChange} className='space-y-4'>
            <div>
              <label className='block text-gray-300 mb-2 text-sm font-medium'>New Email Address</label>
              <input
                type='email'
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder='Enter new email address'
                className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all'
                required
              />
            </div>

            <div>
              <label className='block text-gray-300 mb-2 text-sm font-medium'>Current Password (required)</label>
              <input
                type='password'
                value={emailChangePassword}
                onChange={(e) => setEmailChangePassword(e.target.value)}
                placeholder='Enter current password to confirm'
                className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all'
                required
              />
            </div>

            <Button type='submit' variant='primary' size='md' icon={<FaEnvelope />}>
              Update Email
            </Button>
          </form>
        </div>
      </Card>

      {/* Auto-Renewal */}
      <Card className='p-6'>
        <h3 className='text-2xl font-bold text-white mb-6 flex items-center'>
          <FaSync className='mr-3 text-green-400' />
          Auto-Renewal
        </h3>
        <div className='space-y-4 max-w-2xl'>
          <div className='flex items-center justify-between p-4 bg-gray-800 rounded-lg'>
            <div>
              <p className='text-white font-medium'>Automatic Subscription Renewal</p>
              <p className='text-gray-400 text-sm mt-1'>
                {autoRenew
                  ? 'Your subscription will automatically renew at the end of each period.'
                  : 'Your subscription will NOT renew. It will expire at the end of the current period.'}
              </p>
            </div>
            <button
              onClick={handleToggleAutoRenew}
              disabled={autoRenewLoading}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                autoRenew ? 'bg-green-500' : 'bg-gray-600'
              } ${autoRenewLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                  autoRenew ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Delete Account */}
      <Card className='p-6 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30'>
        <h3 className='text-2xl font-bold text-white mb-6 flex items-center'>
          <FaTrash className='mr-3 text-red-400' />
          Delete Account
        </h3>

        <div className='space-y-4 max-w-2xl'>
          <div className='flex items-start space-x-3 p-4 bg-red-500 bg-opacity-20 rounded-lg border border-red-500 border-opacity-30'>
            <FaExclamationTriangle className='text-red-400 text-2xl flex-shrink-0 mt-1' />
            <div>
              <div className='text-white font-semibold mb-2'>Warning: This action is permanent and cannot be undone</div>
              <p className='text-gray-300 text-sm'>
                Deleting your account will permanently remove all your data, subscription, support tickets, and account settings.
              </p>
            </div>
          </div>

          <div className='p-4 bg-gray-800 rounded-lg'>
            <p className='text-gray-300 text-sm'>
              If you are having issues with our service, please contact our support team before deleting your account.
            </p>
          </div>

          <Button
            variant='danger'
            size='md'
            icon={<FaTrash />}
            onClick={handleDeleteAccount}
          >
            Delete My Account Permanently
          </Button>
        </div>
      </Card>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

export default AccountSettings;
