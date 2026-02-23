import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.vpn-xo.com';

// SEC-TOKEN-01: Access token stored in module memory only — never in localStorage.
// localStorage is readable by any JS on the page (XSS risk). The refresh token is
// kept exclusively in an HttpOnly, Secure, SameSite=Strict cookie set by the server.
let _accessToken = null;

export const setAccessToken = (token) => { _accessToken = token; };
export const clearAccessToken = () => { _accessToken = null; };
export const getAccessToken = () => _accessToken;

// Create axios instance
// withCredentials=true is required so the browser includes the HttpOnly refreshToken
// cookie on cross-origin requests to api.vpn-xo.com (same site as vpn-xo.com).
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token from memory (not localStorage)
api.interceptors.request.use(
  (config) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Token refresh queue — prevents race conditions when multiple requests get 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor - Handle token refresh (with queuing for concurrent 401s)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token via HttpOnly cookie
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Another refresh is in progress — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // SEC-TOKEN-01: Do NOT read refreshToken from localStorage.
        // The HttpOnly cookie is automatically included by the browser (withCredentials=true).
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        // Store new access token in memory only
        _accessToken = accessToken;

        processQueue(null, accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — clear memory and redirect to login
        _accessToken = null;
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// API Methods
export const apiService = {
  // Auth
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (email, password) => api.post('/api/auth/register', { email, password }),
  // SEC-TOKEN-01: No refreshToken in body — backend reads it from HttpOnly cookie.
  // Sending no specific token triggers full-logout (all sessions) on the backend.
  logout: () => api.post('/api/auth/logout', {}),
  refreshToken: () => api.post('/api/auth/refresh', {}),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/api/auth/reset-password', { token, newPassword }),
  resendVerification: (email) => api.post('/api/auth/resend-verification', { email }),
  googleCallback: (code) => api.post('/api/auth/google/callback', { code }),

  // User
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data) => api.put('/api/user/profile', data),
  changePassword: (currentPassword, newPassword) => api.put('/api/user/password', { currentPassword, newPassword }),
  deleteAccount: (password) => api.delete('/api/user/account', { data: { password } }),
  getSubscription: () => api.get('/api/user/subscription'),
  upgradeSubscription: () => api.post('/api/user/subscription/upgrade'),
  getUsage: () => api.get('/api/user/usage'),
  getConnectionHistory: (limit = 50, offset = 0) => api.get(`/api/user/connections/history?limit=${limit}&offset=${offset}`),
  getPayments: () => api.get('/api/user/payments'),

  // Servers
  getServers: () => api.get('/api/servers'),
  getServerById: (id) => api.get(`/api/servers/${id}`),

  // VPN
  connect: (serverId, protocol) => api.post('/api/vpn/connect', { serverId, protocol }),
  disconnect: () => api.post('/api/vpn/disconnect'),
  getStatus: () => api.get('/api/vpn/status'),

  // Subscriptions
  getPlans: () => api.get('/api/subscriptions/plans'),
  createCheckoutSession: (data) => api.post('/api/subscriptions/checkout', data),
  createCoinbaseCharge: (data) => api.post('/api/coinbase/create-charge', data),
  verifyCoinbaseCharge: (code) => api.get(`/api/coinbase/verify/${encodeURIComponent(code)}`),
  createPayPalOrder: (data) => api.post('/api/payments/create-paypal-order', data),
  createCryptoCharge: (data) => api.post('/api/payments/create-crypto-charge', data),
  getSubscriptionStatus: () => api.get('/api/subscriptions/status'),
  cancelSubscription: () => api.post('/api/subscriptions/cancel'),
  verifyCheckoutSession: (sessionId) => api.get(`/api/subscriptions/verify-session?session_id=${encodeURIComponent(sessionId)}`),

  // Manual Configs
  getWireGuardConfig: (serverId) => api.get(`/api/wireguard/config?serverId=${serverId}`),

  // Payments (Legacy - Keep for backward compatibility)
  createCheckout: (plan) => api.post('/api/payments/create-checkout', { plan }),
  verifyPayment: (sessionId) => api.get(`/api/payments/verify/${sessionId}`),
  getPaymentHistory: () => api.get('/api/user/payments'),

  // Admin: Payment History (all users)
  getAdminPaymentHistory: () => api.get('/api/payments/history'),

  // Tickets (Support System)
  getTickets: (params) => api.get('/api/tickets', { params }),
  getTicket: (ticketId) => api.get(`/api/tickets/${ticketId}`),
  createTicket: (data) => {
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('message', data.message);
    formData.append('category', data.category || 'general');
    formData.append('priority', data.priority || 'medium');

    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    return api.post('/api/tickets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  addTicketMessage: (ticketId, data) => {
    const formData = new FormData();
    formData.append('message', data.message);

    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    return api.post(`/api/tickets/${ticketId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  closeTicket: (ticketId) => api.post(`/api/tickets/${ticketId}/close`),
  rateTicket: (ticketId, rating, comment) => api.post(`/api/tickets/${ticketId}/rate`, { rating, comment }),

  // Admin Tickets
  getAllTickets: (params) => api.get('/api/tickets/admin/all', { params }),
  assignTicket: (ticketId, adminId) => api.put(`/api/tickets/admin/${ticketId}/assign`, { assigned_to: adminId }),
  updateTicketStatus: (ticketId, status) => api.put(`/api/tickets/admin/${ticketId}/status`, { status }),
  updateTicketPriority: (ticketId, priority) => api.put(`/api/tickets/admin/${ticketId}/priority`, { priority }),
  addInternalNote: (ticketId, note) => api.post(`/api/tickets/admin/${ticketId}/internal-note`, { note }),
  getTicketStats: () => api.get('/api/tickets/admin/stats'),
  getCannedResponses: () => api.get('/api/tickets/admin/canned-responses'),

  // Health & Bandwidth
  getHealthStatus: () => api.get('/api/health'),
  getBandwidthStats: (period) => api.get(`/api/health/bandwidth?period=${period || '24h'}`),

  // System Settings (Remote Config)
  getPublicConfig: () => api.get('/api/config'), // Public endpoint for app startup
  getSystemSettings: () => api.get('/api/admin/settings'), // Admin only
  updateSystemSetting: (key, value) => api.put('/api/admin/settings', { key, value }),

  // Email Templates (Admin)
  getEmailTemplates: () => api.get('/api/admin/email-templates'),
  getEmailTemplate: (slug) => api.get(`/api/admin/email-templates/${slug}`),
  updateEmailTemplate: (slug, data) => api.put(`/api/admin/email-templates/${slug}`, data),
  toggleEmailTemplate: (slug) => api.put(`/api/admin/email-templates/${slug}/toggle`),
  testEmailTemplate: (slug, to) => api.post(`/api/admin/email-templates/${slug}/test`, { to }),

  // SMTP Settings (Admin) - backward compat
  getSmtpSettings: () => api.get('/api/admin/smtp'),
  updateSmtpSettings: (data) => api.put('/api/admin/smtp', data),
  testSmtpConnection: (to) => api.post('/api/admin/smtp/test', { to }),

  // Email Config (Admin) - new unified provider config (Postal + SMTP)
  getEmailConfig: () => api.get('/api/admin/email-config'),
  updateEmailConfig: (data) => api.put('/api/admin/email-config', data),
  testEmailConfig: (to) => api.post('/api/admin/email-config/test', { to }),

  // Subscription Reminder Settings (Admin)
  getSubscriptionSettings: () => api.get('/api/admin/subscription-settings'),
  updateSubscriptionSettings: (data) => api.put('/api/admin/subscription-settings', data),
  testReminders: (dryRun = true) => api.post('/api/admin/subscription-settings/test-reminders', { dry_run: dryRun }),
  resetReminderDedup: (userId) => api.post('/api/admin/subscription-settings/reset-dedup', userId ? { user_id: userId } : {}),
  getExpiringUsers: (days = 7) => api.get(`/api/admin/subscription-settings/expiring-users?days=${days}`),

  // Announcements (Admin)
  getAnnouncements: () => api.get('/api/admin/announcements'),
  createAnnouncement: (data) => api.post('/api/admin/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/api/admin/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/api/admin/announcements/${id}`),
  toggleAnnouncement: (id) => api.put(`/api/admin/announcements/${id}/toggle`),
  getActiveAnnouncements: () => api.get('/api/announcements/active'), // Public

  // Coupon Endpoints
  validateCoupon: (code, planType, amount) => api.post('/api/coupons/validate', { code, plan_type: planType, amount }),
  applyCoupon: (couponId, subscriptionId, discountAmount) => api.post('/api/coupons/apply', { coupon_id: couponId, subscription_id: subscriptionId, discount_amount: discountAmount }),

  // Admin Coupon Endpoints
  getCoupons: () => api.get('/api/coupons/admin/all'),
  createCoupon: (data) => api.post('/api/coupons/admin', data),
  updateCoupon: (id, data) => api.put(`/api/coupons/admin/${id}`, data),
  deleteCoupon: (id) => api.delete(`/api/coupons/admin/${id}`),

  // Contact (Public - No Auth Required)
  submitContactForm: async (data) => {
    // Creates a support ticket (which also stores the contact message)
    const result = await api.post('/api/tickets/public', data);
    return result;
  },

  // Contact Messages (Legacy - Keep for backward compatibility)
  getContactMessages: () => api.get('/api/admin/contact-messages'),
  markMessageAsRead: (messageId) => api.put(`/api/admin/contact-messages/${messageId}/read`),
  deleteContactMessage: (messageId) => api.delete(`/api/admin/contact-messages/${messageId}`),

  // Error Tracking
  getErrors: () => api.get('/api/admin/errors'),
  markErrorAsResolved: (errorId) => api.put(`/api/admin/errors/${errorId}/resolve`),
  deleteError: (errorId) => api.delete(`/api/admin/errors/${errorId}`),
  clearResolvedErrors: () => api.delete('/api/admin/errors/resolved'),
  logError: (error) => api.post('/api/errors/log', error),

  // Admin
  getUsers: () => api.get('/api/admin/users'),
  getConnections: () => api.get('/api/admin/connections'),
  getAnalytics: () => api.get('/api/admin/analytics'),
  updateUser: (userId, data) => api.put(`/api/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),
  createUser: (data) => api.post('/api/admin/users', data),
  updateUserTier: (userId, tier) => api.put(`/api/admin/users/${userId}/tier`, { tier }),
  updateUserStatus: (userId, status) => api.put(`/api/admin/users/${userId}/status`, { status }),
  addServer: (data) => api.post('/api/admin/servers', data),
  updateServer: (serverId, data) => api.put(`/api/admin/servers/${serverId}`, data),
  deleteServer: (serverId) => api.delete(`/api/admin/servers/${serverId}`),
  forceDisconnect: (connectionId) => api.post(`/api/admin/connections/${connectionId}/disconnect`),
  getAdminSubscriptions: () => api.get('/api/admin/subscriptions'),
  cancelAdminSubscription: (id) => api.post(`/api/admin/subscriptions/${id}/cancel`),

  // Admin: Audit Trail
  getAuditLogs: (params) => api.get('/api/admin/audit-logs', { params }),

  // Admin: Geo-analytics
  getGeoAnalytics: () => api.get('/api/admin/geo-analytics'),

  // Admin: Server Health
  getServerHealth: () => api.get('/api/admin/server-health'),

  // Admin: Bulk Operations
  bulkUserAction: (action, userIds) => api.post('/api/admin/bulk/users', { action, userIds }),

  // Admin: User Details & Management
  getUserDetails: (userId) => api.get(`/api/admin/users/${userId}/details`),
  adminResetPassword: (userId, newPassword) => api.post(`/api/admin/users/${userId}/reset-password`, { newPassword }),
  adminGrantSubscription: (userId, data) => api.post(`/api/admin/users/${userId}/grant-subscription`, data),

  // Admin: IP Blocking
  getBlockedIPs: () => api.get('/api/admin/blocked-ips'),
  blockIP: (data) => api.post('/api/admin/blocked-ips', data),
  unblockIP: (ip) => api.delete(`/api/admin/blocked-ips/${encodeURIComponent(ip)}`),

  // Admin: Device Banning
  getBannedDevices: () => api.get('/api/admin/banned-devices'),
  banDevice: (data) => api.post('/api/admin/banned-devices', data),
  unbanDevice: (deviceId) => api.delete(`/api/admin/banned-devices/${encodeURIComponent(deviceId)}`),

  // Admin: Server Operations
  testServerSSH: (serverId) => api.post(`/api/admin/servers/${serverId}/test-ssh`),
  runServerHealthCheck: (serverId) => api.post(`/api/admin/servers/${serverId}/health-check`),
  updateServerStatus: (serverId, status) => api.patch(`/api/admin/servers/${serverId}/status`, { status }),
  updateServerProtocols: (serverId, protocols) => api.patch(`/api/admin/servers/${serverId}/protocols`, { protocols }),
  getServerStatsOverview: () => api.get('/api/admin/servers/stats/overview'),

  // Admin: Server Guardian (ops)
  getGuardianHealth: () => api.get('/api/admin/ops/servers/health'),
  getGuardianLog: (serverId) => api.get(`/api/admin/ops/servers/${serverId}/guardian-log`),
  getLoadPrediction: (serverId, hours) => api.get(`/api/admin/ops/servers/${serverId}/load-prediction`, { params: { hours } }),
  setServerStatusOps: (serverId, status) => api.post(`/api/admin/ops/servers/${serverId}/status`, { status }),
  triggerHealthCheck: (serverId) => api.post(`/api/admin/ops/servers/${serverId}/check`),
  getOpsDashboard: () => api.get('/api/admin/ops/dashboard'),

  // Admin: Abuse Detection (ops)
  getHighRiskUsers: () => api.get('/api/admin/ops/abuse/high-risk'),
  getAbuseHistory: (userId) => api.get(`/api/admin/ops/abuse/history/${userId}`),
  evaluateAbuse: (userId) => api.post(`/api/admin/ops/abuse/evaluate/${userId}`),
  resetAbuseScore: (userId) => api.post(`/api/admin/ops/abuse/reset/${userId}`),

  // Admin: Session Control (ops)
  getTopSessionUsers: () => api.get('/api/admin/ops/sessions/top-users'),
  getUserSessions: (userId) => api.get(`/api/admin/ops/sessions/${userId}`),
  disconnectAllSessions: (userId) => api.post(`/api/admin/ops/sessions/${userId}/disconnect-all`),
  disconnectSession: (connectionId) => api.post(`/api/admin/ops/sessions/disconnect/${connectionId}`),

  // Admin: Load Balancer (ops)
  getLoadDistribution: () => api.get('/api/admin/ops/load/distribution'),
  setServerWeight: (serverId, weight) => api.post(`/api/admin/ops/load/weight/${serverId}`, { weight }),

  // Admin: QoS Management (platform)
  getQoSConfig: () => api.get('/api/admin/platform/qos/config'),
  updateQoSConfig: (tier, config) => api.put(`/api/admin/platform/qos/config/${tier}`, config),

  // Admin: GDPR/Privacy (platform)
  getGdprExportRequests: () => api.get('/api/admin/platform/gdpr/export-requests'),
  getConsentAnalytics: () => api.get('/api/admin/platform/gdpr/consent-analytics'),

  // Admin: Revenue Forecasting
  getRevenuePredictions: () => api.get('/api/admin/advanced/analytics/predictions'),

  // Admin: VPS Metrics
  getVPSMetrics: () => api.get('/api/admin/vps/metrics'),

  // Admin: Revenue Analytics
  getRevenue: () => api.get('/api/admin/revenue'),

  // Admin: Alerts
  getActiveAlerts: () => api.get('/api/admin/ops/alerts/active'),
  getAlertHistory: (params) => api.get('/api/admin/ops/alerts/history', { params }),
  acknowledgeAlert: (alertId) => api.post(`/api/admin/ops/alerts/${alertId}/acknowledge`),
  acknowledgeAllAlerts: () => api.post('/api/admin/ops/alerts/acknowledge-all'),
  resolveAlert: (alertId, resolution) => api.post(`/api/admin/ops/alerts/${alertId}/resolve`, { resolution }),

  // Admin: Segment Analytics (Free vs Paid)
  getSegmentLive: () => api.get('/api/admin/analytics/segments/live'),
  getSegmentHistory: (days = 30) => api.get('/api/admin/analytics/segments/history', { params: { days } }),
  takeSegmentSnapshot: () => api.post('/api/admin/analytics/segments/snapshot'),

  // User: Usage Statistics
  getUsageStats: () => api.get('/api/user/usage-stats'),

  // User: 2FA TOTP
  setup2FA: () => api.post('/api/user/2fa/setup'),
  verify2FA: (code) => api.post('/api/user/2fa/verify', { code }),
  disable2FA: (code) => api.post('/api/user/2fa/disable', { code }),

  // Email verification
  verifyEmail: (token) => api.get(`/api/auth/verify-email/${token}`),

  // User: Referrals
  getReferralInfo: () => api.get('/api/user/referral'),
  applyReferralCode: (code, email) => api.post('/api/referral/apply', { code, email }),

  // Admin: CSV Exports
  exportUsersCsv: () => api.get('/api/admin/advanced/users/export', { responseType: 'blob' }),
  exportTicketsCsv: () => api.get('/api/admin/advanced/tickets/export', { responseType: 'blob' }),
  exportAuditCsv: () => api.get('/api/admin/advanced/audit/export', { responseType: 'blob' }),
};

export default api;
