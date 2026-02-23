import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaEnvelope,
  FaEnvelopeOpen,
  FaTrash,
  FaReply,
  FaSearch,
  FaFilter,
  FaCheckCircle,
} from 'react-icons/fa';
import { apiService } from '../../services/api';
import Button from '../common/Button';
import Card from '../common/Card';
import useConfirm from '../../hooks/useConfirm';
import ConfirmDialog from '../common/ConfirmDialog';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const { confirm: confirmDialog, dialogProps } = useConfirm();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await apiService.getContactMessages();
      setMessages(response.data || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await apiService.markMessageAsRead(messageId);
      setMessages(messages.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    const ok = await confirmDialog({ title: 'Delete Message', message: 'Are you sure you want to delete this message?', confirmText: 'Delete', variant: 'danger' });
    if (!ok) return;

    try {
      await apiService.deleteContactMessage(messageId);
      setMessages(messages.filter(msg => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'unread' && !msg.read) ||
      (filter === 'read' && msg.read);

    const matchesSearch =
      (msg.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.message || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const unreadCount = messages.filter(msg => !msg.read).length;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-white text-xl">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Contact Messages</h2>
            <p className="text-gray-300">
              {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadMessages}>
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
              }`}
            >
              All ({messages.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'read'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
              }`}
            >
              Read ({messages.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Messages List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FaEnvelope className="text-6xl mx-auto mb-4 opacity-50" />
                <p>No messages found</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`p-4 rounded-lg cursor-pointer transition ${
                    selectedMessage?.id === message.id
                      ? 'bg-blue-600 bg-opacity-30 border-2 border-blue-500'
                      : message.read
                      ? 'bg-white bg-opacity-5 hover:bg-opacity-10'
                      : 'bg-blue-500 bg-opacity-10 hover:bg-opacity-20 border border-blue-500'
                  }`}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.read) {
                      markAsRead(message.id);
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {message.read ? (
                        <FaEnvelopeOpen className="text-gray-400" />
                      ) : (
                        <FaEnvelope className="text-blue-400" />
                      )}
                      <span className="text-white font-semibold">{message.name}</span>
                    </div>
                    <span className="text-gray-400 text-xs">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-1">{message.email}</p>
                  {message.subject && (
                    <p className="text-white font-medium text-sm mb-2">
                      {message.subject}
                    </p>
                  )}
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {message.message}
                  </p>
                </motion.div>
              ))
            )}
          </div>

          {/* Message Detail */}
          <div>
            {selectedMessage ? (
              <Card className="p-6 sticky top-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {selectedMessage.name}
                    </h3>
                    <p className="text-gray-300">{selectedMessage.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {!selectedMessage.read && (
                      <button
                        onClick={() => markAsRead(selectedMessage.id)}
                        className="p-2 bg-green-500 bg-opacity-20 hover:bg-opacity-30 rounded-lg transition"
                        title="Mark as read"
                      >
                        <FaCheckCircle className="text-green-400" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMessage(selectedMessage.id)}
                      className="p-2 bg-red-500 bg-opacity-20 hover:bg-opacity-30 rounded-lg transition"
                      title="Delete"
                    >
                      <FaTrash className="text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-gray-400 text-sm">
                    Received: {new Date(selectedMessage.created_at).toLocaleString()}
                  </span>
                </div>

                {selectedMessage.subject && (
                  <div className="mb-4">
                    <h4 className="text-white font-semibold mb-2">Subject:</h4>
                    <p className="text-gray-300">{selectedMessage.subject}</p>
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-2">Message:</h4>
                  <div className="bg-white bg-opacity-5 rounded-lg p-4">
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  icon={<FaReply />}
                  onClick={() => window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your message'}`}
                >
                  Reply via Email
                </Button>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <FaEnvelope className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select a message to view details</p>
              </Card>
            )}
          </div>
        </div>
      </Card>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

export default ContactMessages;
