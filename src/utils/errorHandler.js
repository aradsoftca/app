/**
 * Error Handler Utility
 * Provides user-friendly error messages for API errors
 */

export const getErrorMessage = (error) => {
  // Handle network errors
  if (!error.response) {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      type: 'network',
      retryable: true
    };
  }

  const status = error.response.status;
  const data = error.response.data;

  // Handle specific HTTP status codes
  switch (status) {
    case 400:
      return {
        title: 'Invalid Request',
        message: data?.error || 'Please check your input and try again.',
        type: 'validation',
        retryable: false
      };

    case 401:
      return {
        title: 'Authentication Failed',
        message: data?.error || 'Invalid email or password. Please try again.',
        type: 'auth',
        retryable: false
      };

    case 403:
      return {
        title: 'Access Denied',
        message: data?.error || 'You don\'t have permission to access this resource.',
        type: 'permission',
        retryable: false
      };

    case 404:
      return {
        title: 'Not Found',
        message: data?.error || 'The requested resource was not found.',
        type: 'notfound',
        retryable: false
      };

    case 429:
      // Rate limit error - extract retry time if available
      const retryAfter = error.response.headers['retry-after'];
      const retryMinutes = retryAfter ? Math.ceil(retryAfter / 60) : 5;
      
      return {
        title: 'Too Many Attempts',
        message: `You've made too many login attempts. Please wait ${retryMinutes} minute${retryMinutes > 1 ? 's' : ''} and try again.`,
        type: 'ratelimit',
        retryable: true,
        retryAfter: retryAfter
      };

    case 500:
      return {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        type: 'server',
        retryable: true
      };

    case 503:
      return {
        title: 'Service Unavailable',
        message: 'The service is temporarily unavailable. Please try again in a few moments.',
        type: 'unavailable',
        retryable: true
      };

    default:
      return {
        title: 'Error',
        message: data?.error || 'An unexpected error occurred. Please try again.',
        type: 'unknown',
        retryable: true
      };
  }
};

/**
 * Format error for display
 */
export const formatErrorForDisplay = (error) => {
  const errorInfo = getErrorMessage(error);
  return errorInfo.message;
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error) => {
  const errorInfo = getErrorMessage(error);
  return errorInfo.retryable;
};

/**
 * Get retry delay in seconds
 */
export const getRetryDelay = (error) => {
  const errorInfo = getErrorMessage(error);
  return errorInfo.retryAfter || 60; // Default 60 seconds
};

/**
 * Log error for debugging and tracking.
 * In development: logs to console.
 * In production: silently reports to backend error-tracking endpoint.
 */
export const logError = (error, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error ${context}]:`, error);
    if (error.response) {
      console.error('Response:', error.response.data);
      console.error('Status:', error.response.status);
    }
  }
  // Report to backend in production (fire-and-forget)
  if (process.env.NODE_ENV === 'production') {
    try {
      // SEC-TOKEN-01: Dynamically import getAccessToken to read from memory (not localStorage).
      import('../services/api').then(({ getAccessToken }) => {
        const token = getAccessToken();
        const payload = {
          message: error?.message || String(error),
          context,
          stack: error?.stack?.substring(0, 500),
          url: window.location.href,
          timestamp: new Date().toISOString(),
        };
        fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }).catch(() => {}); // swallow network errors
      }).catch(() => {});
    } catch (_) { /* best-effort */ }
  }
};

export default {
  getErrorMessage,
  formatErrorForDisplay,
  isRetryableError,
  getRetryDelay,
  logError
};
