import React, { useState } from 'react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import { FaUser, FaCrown, FaShieldAlt, FaEnvelope, FaCheckCircle, FaBan } from 'react-icons/fa';
import { apiService } from '../../../services/api';

/**
 * AAA-Level User Edit Modal
 * Features:
 * - Form validation
 * - Error handling
 * - Loading states
 * - Success feedback
 * - Professional UI
 * - Accessibility
 */
const UserEditModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    tier: user?.tier || 'free',
    status: user?.status || 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      await apiService.updateUser(user.id, formData);
      setSuccess(true);
      
      // Show success message briefly
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const tierOptions = [
    { value: 'free', label: 'Free', icon: FaUser, color: 'gray' },
    { value: 'paid', label: 'Premium', icon: FaCrown, color: 'purple' },
    { value: 'admin', label: 'Admin', icon: FaShieldAlt, color: 'yellow' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active', icon: FaCheckCircle, color: 'green' },
    { value: 'suspended', label: 'Suspended', icon: FaBan, color: 'red' },
    { value: 'deleted', label: 'Deleted', icon: FaBan, color: 'gray' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit User"
      size="md"
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={success}
          >
            {success ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4">
            <p className="text-green-400 text-sm flex items-center">
              <FaCheckCircle className="mr-2" />
              User updated successfully!
            </p>
          </div>
        )}

        {/* Email Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" />
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="user@example.com"
              required
            />
          </div>
        </div>

        {/* Tier Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            User Tier
          </label>
          <div className="grid grid-cols-3 gap-3">
            {tierOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = formData.tier === option.value;
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('tier', option.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? `border-${option.color}-500 bg-${option.color}-500 bg-opacity-10`
                      : 'border-white border-opacity-10 hover:border-opacity-30'
                  }`}
                >
                  <Icon
                    className={`mx-auto mb-2 text-2xl ${
                      isSelected ? `text-${option.color}-400` : 'text-gray-400'
                    }`}
                  />
                  <p
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {option.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Account Status
          </label>
          <div className="grid grid-cols-3 gap-3">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = formData.status === option.value;
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('status', option.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? `border-${option.color}-500 bg-${option.color}-500 bg-opacity-10`
                      : 'border-white border-opacity-10 hover:border-opacity-30'
                  }`}
                >
                  <Icon
                    className={`mx-auto mb-2 text-2xl ${
                      isSelected ? `text-${option.color}-400` : 'text-gray-400'
                    }`}
                  />
                  <p
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {option.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white bg-opacity-5 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">User ID:</span>
            <span className="text-white font-mono">{user?.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Created:</span>
            <span className="text-white">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Last Login:</span>
            <span className="text-white">
              {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default UserEditModal;
