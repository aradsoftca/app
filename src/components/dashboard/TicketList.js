import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FaTicketAlt,
  FaPlus,
  FaCircle,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import { apiService } from '../../services/api';

const TicketList = ({ onSelectTicket, onCreateTicket }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    setPage(1);
    loadTickets();
  }, [filter]);

  const totalPages = Math.max(1, Math.ceil(tickets.length / perPage));
  const paginatedTickets = useMemo(
    () => tickets.slice((page - 1) * perPage, page * perPage),
    [tickets, page, perPage]
  );

  const loadTickets = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await apiService.getTickets(params);
      setTickets(response.data.tickets || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { color: 'bg-blue-500', icon: FaCircle, text: 'Open' },
      in_progress: { color: 'bg-yellow-500', icon: FaClock, text: 'In Progress' },
      waiting_user: { color: 'bg-orange-500', icon: FaExclamationCircle, text: 'Waiting for You' },
      waiting_staff: { color: 'bg-purple-500', icon: FaClock, text: 'Waiting for Staff' },
      resolved: { color: 'bg-green-500', icon: FaCheckCircle, text: 'Resolved' },
      closed: { color: 'bg-gray-500', icon: FaCheckCircle, text: 'Closed' },
    };

    const badge = badges[status] || badges.open;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${badge.color}`}>
        <Icon className="mr-1" />
        {badge.text}
      </span>
    );
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-400',
      medium: 'text-blue-400',
      high: 'text-orange-400',
      urgent: 'text-red-400',
    };
    return colors[priority] || colors.medium;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      billing: '💳',
      technical: '🔧',
      account: '👤',
      connection: '🌐',
      general: '💬',
      bug: '🐛',
      feature: '✨',
      security: '🔒',
      performance: '⚡',
      other: '📋'
    };
    return icons[category?.toLowerCase()] || '📁';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-white">Loading tickets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Support Tickets</h2>
            <p className="text-purple-100">
              Get help from our support team
            </p>
          </div>
          <Button
            variant="solid"
            size="lg"
            icon={<FaPlus />}
            onClick={onCreateTicket}
          >
            <span className="text-purple-900 font-semibold">New Ticket</span>
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <FaFilter className="text-gray-400" />
          {['all', 'open', 'in_progress', 'waiting_user', 'resolved', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
              }`}
            >
              {status === 'all' ? 'All' : status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </Card>

      {/* Tickets List */}
      {error && (
        <Card className="p-4 bg-red-500 bg-opacity-20 border border-red-500">
          <p className="text-red-200">{error}</p>
        </Card>
      )}

      {tickets.length === 0 ? (
        <Card className="p-12 text-center">
          <FaTicketAlt className="text-6xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No Tickets Found</h3>
          <p className="text-gray-400 mb-6">
            {filter === 'all'
              ? "You haven't created any support tickets yet."
              : `No ${filter.replace('_', ' ')} tickets found.`}
          </p>
          <Button variant="primary" size="lg" icon={<FaPlus />} onClick={onCreateTicket}>
            Create Your First Ticket
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {paginatedTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="p-6 hover:bg-white hover:bg-opacity-5 cursor-pointer transition"
                onClick={() => onSelectTicket(ticket)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-gray-400 font-mono text-sm">
                        #{ticket.ticket_number}
                      </span>
                      {getStatusBadge(ticket.status)}
                      <span className={`text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{ticket.subject}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{getCategoryIcon(ticket.category)} {ticket.category}</span>
                      <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                      <span>{ticket.message_count || 0} messages</span>
                    </div>
                  </div>
                  
                  {ticket.unread_staff_messages > 0 && (
                    <div className="ml-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white text-sm font-bold">
                        {ticket.unread_staff_messages}
                      </span>
                    </div>
                  )}
                </div>

                {ticket.last_staff_reply_at && (
                  <div className="text-sm text-gray-400">
                    Last staff reply: {new Date(ticket.last_staff_reply_at).toLocaleString()}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-400">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, tickets.length)} of {tickets.length} tickets
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-lg bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  aria-label="Previous page"
                >
                  <FaChevronLeft />
                </button>
                <span className="text-white font-medium px-3">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded-lg bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  aria-label="Next page"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketList;
