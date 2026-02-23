import React, { useState } from 'react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import { FaExclamationTriangle, FaTrash } from 'react-icons/fa';

/**
 * AAA-Level Delete Confirmation Modal
 * Features:
 * - Type-to-confirm for dangerous actions
 * - Clear warning messages
 * - Loading states
 * - Error handling
 * - Accessible
 */
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message,
  itemName,
  requireConfirmation = true,
  confirmText = 'DELETE',
  type = 'user', // 'user', 'server', 'connection'
}) => {
  const [confirmInput, setConfirmInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isConfirmed = !requireConfirmation || confirmInput === confirmText;

  const handleConfirm = async () => {
    if (!isConfirmed) return;

    setLoading(true);
    setError(null);

    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const getWarningMessage = () => {
    switch (type) {
      case 'user':
        return 'This will permanently delete the user account and all associated data. This action cannot be undone.';
      case 'server':
        return 'This will permanently remove the server. Active connections will be terminated. This action cannot be undone.';
      case 'connection':
        return 'This will force disconnect the user from the VPN server.';
      default:
        return message || 'This action cannot be undone.';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            loading={loading}
            disabled={!isConfirmed}
            icon={<FaTrash />}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-500 bg-opacity-10 flex items-center justify-center">
            <FaExclamationTriangle className="text-red-500 text-3xl" />
          </div>
        </div>

        {/* Warning Message */}
        <div className="text-center">
          <p className="text-white text-lg font-semibold mb-2">
            Are you sure you want to delete this {type}?
          </p>
          {itemName && (
            <p className="text-gray-400 mb-4">
              <span className="font-mono bg-white bg-opacity-5 px-2 py-1 rounded">
                {itemName}
              </span>
            </p>
          )}
          <p className="text-gray-400 text-sm">
            {getWarningMessage()}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Confirmation Input */}
        {requireConfirmation && (
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Type <span className="font-mono text-red-400">{confirmText}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className="w-full px-4 py-3 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition font-mono"
              placeholder={confirmText}
              autoFocus
            />
          </div>
        )}

        {/* Warning List */}
        <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-lg p-4">
          <p className="text-yellow-400 text-sm font-semibold mb-2">
            ⚠️ This action will:
          </p>
          <ul className="text-yellow-400 text-sm space-y-1 list-disc list-inside">
            {type === 'user' && (
              <>
                <li>Delete all user data</li>
                <li>Terminate active connections</li>
                <li>Remove subscription information</li>
                <li>Cannot be recovered</li>
              </>
            )}
            {type === 'server' && (
              <>
                <li>Remove server from network</li>
                <li>Disconnect all active users</li>
                <li>Delete server configuration</li>
                <li>Cannot be recovered</li>
              </>
            )}
            {type === 'connection' && (
              <>
                <li>Immediately disconnect user</li>
                <li>User will need to reconnect</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
