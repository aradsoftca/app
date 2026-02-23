import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaTicketAlt,
  FaSearch,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaReply,
  FaTimes,
  FaStar,
  FaDownload,
  FaUserTie,
  FaExclamationTriangle,
} from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import { apiService } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';

const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [replyMessage, setReplyMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [sending, setSending] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [adminStaff, setAdminStaff] = useState([]);

  useEffect(() => {
    loadTickets();
    loadStats();
    loadAdminStaff();
  }, [filters]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      loadTickets();
      loadStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [filters]);

  useEffect(() => {
    if (selectedTicket) {
      loadTicketDetails(selectedTicket.id);
    }
  }, [selectedTicket]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.category !== 'all') params.category = filters.category;

      const response = await apiService.getAllTickets(params);
      setTickets(response.data.tickets || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.getTicketStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadTicketDetails = async (ticketId) => {
    try {
      const response = await apiService.getTicket(ticketId);
      setTicketMessages(response.data.messages || []);
    } catch (err) {
      console.error('Failed to load ticket details:', err);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) return;

    try {
      setSending(true);
      await apiService.addTicketMessage(selectedTicket.id, {
        message: replyMessage.trim(),
      });
      setReplyMessage('');
      await loadTicketDetails(selectedTicket.id);
      await loadTickets();
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSending(false);
    }
  };

  const handleAddInternalNote = async () => {
    if (!internalNote.trim()) return;

    try {
      setSending(true);
      await apiService.addInternalNote(selectedTicket.id, internalNote.trim());
      setInternalNote('');
      await loadTicketDetails(selectedTicket.id);
    } catch (err) {
      console.error('Failed to add internal note:', err);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      await apiService.updateTicketStatus(ticketId, status);
      await loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleUpdatePriority = async (ticketId, priority) => {
    try {
      await apiService.updateTicketPriority(ticketId, priority);
      await loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, priority });
      }
    } catch (err) {
      console.error('Failed to update priority:', err);
    }
  };

  const loadAdminStaff = async () => {
    try {
      const response = await apiService.getUsers({ role: 'admin', limit: 50 });
      setAdminStaff(response.data.users || []);
    } catch {
      // Silently fail — staff list is optional
    }
  };

  const handleAssignTicket = async (ticketId, adminId) => {
    try {
      await apiService.assignTicket(ticketId, adminId);
      await loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, assigned_to: adminId });
      }
    } catch (err) {
      console.error('Failed to assign ticket:', err);
    }
  };

  // SLA definitions (hours)
  const SLA_TARGETS = {
    urgent: { firstResponse: 1, resolution: 4 },
    high: { firstResponse: 4, resolution: 24 },
    medium: { firstResponse: 12, resolution: 72 },
    low: { firstResponse: 24, resolution: 168 },
  };

  const getSlaStatus = (ticket) => {
    const target = SLA_TARGETS[ticket.priority] || SLA_TARGETS.medium;
    const created = new Date(ticket.created_at);
    const now = new Date();
    const hoursElapsed = (now - created) / (1000 * 60 * 60);
    const resolved = ['resolved', 'closed'].includes(ticket.status);

    if (resolved) return { label: 'Met', color: 'text-green-400', icon: null };

    const responseDeadline = target.firstResponse;
    const resolutionDeadline = target.resolution;

    if (hoursElapsed > resolutionDeadline) {
      return { label: 'Breached', color: 'text-red-400', icon: <FaExclamationTriangle className="text-red-400" /> };
    }
    if (hoursElapsed > resolutionDeadline * 0.75) {
      const remaining = Math.round(resolutionDeadline - hoursElapsed);
      return { label: `${remaining}h left`, color: 'text-yellow-400', icon: <FaClock className="text-yellow-400" /> };
    }
    if (hoursElapsed > responseDeadline && !ticket.first_response_at) {
      return { label: 'Response overdue', color: 'text-orange-400', icon: <FaExclamationCircle className="text-orange-400" /> };
    }
    return { label: 'On track', color: 'text-green-400', icon: null };
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { color: 'bg-blue-500', text: 'Open' },
      in_progress: { color: 'bg-yellow-500', text: 'In Progress' },
      waiting_user: { color: 'bg-orange-500', text: 'Waiting User' },
      waiting_staff: { color: 'bg-purple-500', text: 'Waiting Staff' },
      resolved: { color: 'bg-green-500', text: 'Resolved' },
      closed: { color: 'bg-gray-500', text: 'Closed' },
    };
    const badge = badges[status] || badges.open;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${badge.color}`}>
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

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const response = await apiService.exportTicketsCsv();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tickets-export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { /* ignore */ }
    setExporting(false);
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      return (
        ticket.ticket_number.toLowerCase().includes(search) ||
        ticket.subject.toLowerCase().includes(search) ||
        ticket.user_email.toLowerCase().includes(search)
      );
    }
    return true;
  });

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-white">Loading tickets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Total Tickets</p>
                <p className="text-white text-3xl font-bold">{stats.total_tickets || 0}</p>
              </div>
              <FaTicketAlt className="text-blue-200 text-4xl" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-600 to-yellow-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm">Open Tickets</p>
                <p className="text-white text-3xl font-bold">{stats.open_tickets || 0}</p>
              </div>
              <FaExclamationCircle className="text-yellow-200 text-4xl" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-600 to-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Resolved</p>
                <p className="text-white text-3xl font-bold">{stats.resolved_tickets || 0}</p>
              </div>
              <FaCheckCircle className="text-green-200 text-4xl" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-600 to-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Avg Response</p>
                <p className="text-white text-3xl font-bold">
                  {stats.avg_first_response_hours ? `${Math.round(stats.avg_first_response_hours)}h` : 'N/A'}
                </p>
              </div>
              <FaClock className="text-purple-200 text-4xl" />
            </div>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white mb-2">Tickets</h2>
              <button
                onClick={handleExportCsv}
                disabled={exporting}
                className="text-xs text-blue-400 hover:text-blue-300 mb-4 disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>

              {/* Search */}
              <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tickets..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="space-y-2">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all" className="bg-gray-800">All Status</option>
                  <option value="open" className="bg-gray-800">Open</option>
                  <option value="in_progress" className="bg-gray-800">In Progress</option>
                  <option value="waiting_user" className="bg-gray-800">Waiting User</option>
                  <option value="waiting_staff" className="bg-gray-800">Waiting Staff</option>
                  <option value="resolved" className="bg-gray-800">Resolved</option>
                  <option value="closed" className="bg-gray-800">Closed</option>
                </select>

                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all" className="bg-gray-800">All Priority</option>
                  <option value="low" className="bg-gray-800">Low</option>
                  <option value="medium" className="bg-gray-800">Medium</option>
                  <option value="high" className="bg-gray-800">High</option>
                  <option value="urgent" className="bg-gray-800">Urgent</option>
                </select>
              </div>
            </div>

            {/* Ticket List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FaTicketAlt className="text-4xl mx-auto mb-2" />
                  <p>No tickets found</p>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 rounded-lg cursor-pointer transition ${
                      selectedTicket?.id === ticket.id
                        ? 'bg-blue-600 bg-opacity-30 border-2 border-blue-500'
                        : 'bg-white bg-opacity-5 hover:bg-opacity-10 border-2 border-transparent'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs text-gray-400 font-mono">
                            #{ticket.ticket_number}
                          </span>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                          {ticket.subject}
                        </h3>
                        <p className="text-xs text-gray-400">{ticket.user_email}</p>
                      </div>
                      {ticket.unread_user_messages > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold">
                          {ticket.unread_user_messages}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-semibold ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const sla = getSlaStatus(ticket);
                          return (
                            <span className={`flex items-center gap-1 ${sla.color}`}>
                              {sla.icon}
                              {sla.label}
                            </span>
                          );
                        })()}
                        <span className="text-gray-500">•</span>
                        {ticket.assigned_to ? (
                          <span className="text-blue-400 flex items-center gap-1">
                            <FaUserTie size={10} />
                            {adminStaff.find(a => a.id === ticket.assigned_to)?.email?.split('@')[0] || 'Assigned'}
                          </span>
                        ) : (
                          <span className="text-gray-500">Unassigned</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-end text-xs mt-1">
                      <span className="text-gray-400">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card className="p-6">
              {/* Ticket Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-gray-400 font-mono">#{selectedTicket.ticket_number}</span>
                      {getStatusBadge(selectedTicket.status)}
                      <span className={`text-sm font-semibold ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority.toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedTicket.subject}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>From: {selectedTicket.user_email}</span>
                      <span>Created: {new Date(selectedTicket.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-gray-400 hover:text-white transition"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="open" className="bg-gray-800">Open</option>
                    <option value="in_progress" className="bg-gray-800">In Progress</option>
                    <option value="waiting_user" className="bg-gray-800">Waiting User</option>
                    <option value="waiting_staff" className="bg-gray-800">Waiting Staff</option>
                    <option value="resolved" className="bg-gray-800">Resolved</option>
                    <option value="closed" className="bg-gray-800">Closed</option>
                  </select>

                  <select
                    value={selectedTicket.priority}
                    onChange={(e) => handleUpdatePriority(selectedTicket.id, e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low" className="bg-gray-800">Low Priority</option>
                    <option value="medium" className="bg-gray-800">Medium Priority</option>
                    <option value="high" className="bg-gray-800">High Priority</option>
                    <option value="urgent" className="bg-gray-800">Urgent Priority</option>
                  </select>

                  {/* Assign to staff */}
                  <select
                    value={selectedTicket.assigned_to || ''}
                    onChange={(e) => handleAssignTicket(selectedTicket.id, e.target.value || null)}
                    className="px-3 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" className="bg-gray-800">Unassigned</option>
                    {adminStaff.map(admin => (
                      <option key={admin.id} value={admin.id} className="bg-gray-800">
                        {admin.email?.split('@')[0] || `Admin #${admin.id}`}
                      </option>
                    ))}
                  </select>

                  {/* SLA indicator */}
                  {(() => {
                    const sla = getSlaStatus(selectedTicket);
                    return (
                      <div className={`px-3 py-2 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10 flex items-center gap-2 text-sm ${sla.color}`}>
                        {sla.icon || <FaClock />}
                        <span>SLA: {sla.label}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Messages */}
              <div className="mb-6 max-h-96 overflow-y-auto space-y-4">
                {ticketMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg ${
                      msg.is_internal_note
                        ? 'bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30'
                        : msg.is_staff
                        ? 'bg-blue-600 bg-opacity-20'
                        : 'bg-purple-600 bg-opacity-20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FaUser className="text-gray-400" />
                        <span className="text-white font-semibold text-sm">
                          {msg.is_internal_note ? '🔒 Internal Note' : msg.is_staff ? 'Staff' : 'User'}
                        </span>
                        <span className="text-xs text-gray-400">{msg.user_email}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-white whitespace-pre-wrap">{msg.message}</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={att.file_url}
                            download
                            className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300"
                          >
                            <FaDownload />
                            <span>{att.filename}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              {selectedTicket.status !== 'closed' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Reply to User</label>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                    />
                    <Button
                      variant="primary"
                      size="md"
                      icon={<FaReply />}
                      onClick={handleReply}
                      loading={sending}
                      disabled={!replyMessage.trim() || sending}
                      className="mt-2"
                    >
                      Send Reply
                    </Button>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Internal Note (Staff Only)</label>
                    <textarea
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      placeholder="Add internal note (not visible to user)..."
                      className="w-full px-4 py-3 rounded-lg bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      rows="3"
                    />
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={handleAddInternalNote}
                      loading={sending}
                      disabled={!internalNote.trim() || sending}
                      className="mt-2"
                    >
                      Add Internal Note
                    </Button>
                  </div>
                </div>
              )}

              {/* Rating (if resolved) */}
              {selectedTicket.rating && (
                <div className="mt-6 p-4 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">User Rating</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`text-xl ${
                          star <= selectedTicket.rating ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="text-white font-bold">{selectedTicket.rating}/5</span>
                  </div>
                  {selectedTicket.rating_comment && (
                    <p className="text-gray-300 text-sm">{selectedTicket.rating_comment}</p>
                  )}
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <FaTicketAlt className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Select a Ticket</h3>
              <p className="text-gray-400">Choose a ticket from the list to view details and respond</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketManagement;
