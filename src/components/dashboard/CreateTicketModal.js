import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPaperclip, FaTicketAlt } from 'react-icons/fa';
import Button from '../common/Button';
import { apiService } from '../../services/api';

const CreateTicketModal = ({ isOpen, onClose, onSuccess }) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'account', label: 'Account Management' },
    { value: 'connection', label: 'Connection Problems' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'other', label: 'Other' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-gray-400' },
    { value: 'medium', label: 'Medium', color: 'text-blue-400' },
    { value: 'high', label: 'High', color: 'text-orange-400' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-400' },
  ];

  const MAX_ATTACHMENT_COUNT = 5;
  const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB per file

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalCount = attachments.length + files.length;
    if (totalCount > MAX_ATTACHMENT_COUNT) {
      setError(`Maximum ${MAX_ATTACHMENT_COUNT} attachments allowed`);
      return;
    }
    const oversized = files.find(f => f.size > MAX_ATTACHMENT_SIZE);
    if (oversized) {
      setError(`File "${oversized.name}" exceeds 10MB limit`);
      return;
    }
    setError(null);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required');
      return;
    }

    try {
      setSubmitting(true);
      await apiService.createTicket({
        subject: subject.trim(),
        category,
        priority,
        message: message.trim(),
        attachments,
      });

      // Reset form
      setSubject('');
      setCategory('general');
      setPriority('medium');
      setMessage('');
      setAttachments([]);
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create ticket:', err);
      setError(err.response?.data?.error || 'Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white border-opacity-10">
            <div className="flex items-center">
              <FaTicketAlt className="text-3xl text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Create Support Ticket</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
            >
              <FaTimes className="text-2xl" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-200">
                {error}
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="block text-white font-medium mb-2">
                Subject <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={200}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-white font-medium mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-gray-800">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-white font-medium mb-2">Priority</label>
              <div className="grid grid-cols-4 gap-3">
                {priorities.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`py-3 px-4 rounded-lg font-medium transition ${
                      priority === p.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
                    }`}
                  >
                    <span className={priority === p.value ? 'text-white' : p.color}>
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-white font-medium mb-2">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="6"
                maxLength={2000}
                required
              />
              <p className="text-sm text-gray-400 mt-1">
                {message.length}/2000 characters
              </p>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-white font-medium mb-2">Attachments (Optional)</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*,.pdf,.txt,.log,.zip"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="md"
                icon={<FaPaperclip />}
                onClick={() => fileInputRef.current?.click()}
              >
                Add Files
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                Max 5 files, 10MB each. Allowed: images, PDF, text, logs, zip
              </p>

              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg px-4 py-2"
                    >
                      <span className="text-sm text-white">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={submitting}
                disabled={!subject.trim() || !message.trim()}
              >
                Create Ticket
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateTicketModal;
