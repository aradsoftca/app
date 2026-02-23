import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaPaperPlane,
  FaPaperclip,
  FaTimes,
  FaDownload,
  FaStar,
  FaCheckCircle,
} from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';
import { apiService } from '../../services/api';
import useConfirm from '../../hooks/useConfirm';

const TicketDetail = ({ ticketId, onBack }) => {
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const { confirm, dialogProps } = useConfirm();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadTicket();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadTicket(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadTicket = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await apiService.getTicket(ticketId);
      setTicket(response.data.ticket);
      setMessages(response.data.messages || []);
      setLastRefreshed(new Date());
      
      // Show rating form if ticket is resolved and not rated
      if (response.data.ticket.status === 'resolved' && !response.data.ticket.rating) {
        setShowRating(true);
      }
    } catch (err) {
      console.error('Failed to load ticket:', err);
      if (!silent) setError('Failed to load ticket details. Please try again.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() && attachments.length === 0) return;

    try {
      setSending(true);
      await apiService.addTicketMessage(ticketId, {
        message: message.trim(),
        attachments,
      });
      
      setMessage('');
      setAttachments([]);
      await loadTicket();
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleCloseTicket = async () => {
    const ok = await confirm({
      title: 'Close Ticket',
      message: 'Are you sure you want to close this ticket?',
      confirmText: 'Close Ticket',
      variant: 'warning',
    });
    if (!ok) return;

    try {
      await apiService.closeTicket(ticketId);
      await loadTicket();
    } catch (err) {
      console.error('Failed to close ticket:', err);
      setError('Failed to close ticket. Please try again.');
    }
  };

  const handleRateTicket = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      await apiService.rateTicket(ticketId, rating, ratingComment);
      setShowRating(false);
      await loadTicket();
    } catch (err) {
      console.error('Failed to rate ticket:', err);
      alert('Failed to submit rating. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-white">Loading ticket...</span>
      </div>
    );
  }

  if (!ticket) {
    return (
      <Card className="p-12 text-center">
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        <p className="text-white text-xl">Ticket not found</p>
        <Button variant="primary" className="mt-4" onClick={onBack}>
          Go Back
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" icon={<FaArrowLeft />} onClick={onBack}>
            Back to Tickets
          </Button>
          
          {ticket.status !== 'closed' && (
            <Button variant="danger" size="sm" onClick={handleCloseTicket}>
              Close Ticket
            </Button>
          )}
        </div>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-gray-400 font-mono">#{ticket.ticket_number}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                ticket.status === 'resolved' ? 'bg-green-500' :
                ticket.status === 'closed' ? 'bg-gray-500' :
                ticket.status === 'in_progress' ? 'bg-yellow-500' :
                'bg-blue-500'
              } text-white`}>
                {ticket.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{ticket.subject}</h2>
            <p className="text-gray-400">
              Created {new Date(ticket.created_at).toLocaleString()}
              {lastRefreshed && (
                <span className="ml-4 text-xs text-gray-500">
                  Last refreshed: {lastRefreshed.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Rating Form */}
      {showRating && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-gradient-to-r from-green-600 to-blue-600">
            <h3 className="text-xl font-bold text-white mb-4">Rate Your Support Experience</h3>
            <div className="flex items-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <FaStar
                    className={`text-3xl ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-400'
                    } hover:text-yellow-300 transition`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Additional comments (optional)"
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white mb-4"
              rows="3"
            />
            <div className="flex space-x-3">
              <Button variant="solid" onClick={handleRateTicket}>
                <span className="text-green-900 font-semibold">Submit Rating</span>
              </Button>
              <Button variant="outline" onClick={() => setShowRating(false)}>
                Skip
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Messages */}
      <Card className="p-6">
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.is_staff ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${msg.is_staff ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`max-w-2xl ${msg.is_staff ? 'bg-blue-600' : 'bg-purple-600'} rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">
                    {msg.is_staff ? 'Support Team' : 'You'}
                  </span>
                  <span className="text-xs text-gray-200">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-white whitespace-pre-wrap">{msg.message}</p>
                
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.file_url}
                        download
                        className="flex items-center space-x-2 text-sm text-white hover:text-gray-200 transition"
                      >
                        <FaDownload />
                        <span>{attachment.filename}</span>
                        <span className="text-xs text-gray-300">
                          ({(attachment.file_size / 1024).toFixed(1)} KB)
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Form */}
        {ticket.status !== 'closed' && (
          <form onSubmit={handleSendMessage} className="space-y-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              disabled={sending}
            />

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-white bg-opacity-10 rounded-lg px-3 py-2"
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

            <div className="flex items-center space-x-3">
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
                disabled={sending}
              >
                Attach Files
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={<FaPaperPlane />}
                loading={sending}
                disabled={!message.trim() && attachments.length === 0}
                fullWidth
              >
                Send Message
              </Button>
            </div>
          </form>
        )}
      </Card>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

export default TicketDetail;
