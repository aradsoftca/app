import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import useDocumentTitle from '../hooks/useDocumentTitle';

/**
 * Email Preferences / Unsubscribe page
 * Accessible via /email-preferences?email=xxx
 * Required for CAN-SPAM compliance
 */
const EmailPreferences = () => {
  useDocumentTitle('Email Preferences');
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [status, setStatus] = useState('loading'); // loading, ready, success, error
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (!email) {
      setStatus('ready');
      return;
    }
    api.get('/api/email-preferences', { params: { email } })
      .then(({ data }) => {
        if (data.email_notifications !== undefined) {
          setNotifications(data.email_notifications);
        }
        setStatus('ready');
      })
      .catch(() => setStatus('ready'));
  }, [email]);

  const handleUnsubscribe = async () => {
    try {
      const { data } = await api.post('/api/email-preferences', { email, unsubscribe: true });
      if (data.success) {
        setNotifications(false);
        setStatus('success');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleResubscribe = async () => {
    try {
      const { data } = await api.post('/api/email-preferences', { email, unsubscribe: false });
      if (data.success) {
        setNotifications(true);
        setStatus('success');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-5 font-sans">
      <div className="max-w-md w-full bg-[#1a1a2e] rounded-2xl p-10 shadow-2xl text-gray-300 text-center">
        <h1 className="text-3xl font-bold mb-2 text-indigo-400">
          Email Preferences
        </h1>
        <p className="text-gray-500 mb-6 text-sm">
          VPN XO — Manage your email notifications
        </p>

        {!email ? (
          <p className="text-gray-400">No email address provided.</p>
        ) : status === 'loading' ? (
          <div className="space-y-3 py-4">
            <div className="h-4 w-3/4 mx-auto bg-gray-700/30 rounded animate-pulse" />
            <div className="h-4 w-1/2 mx-auto bg-gray-700/30 rounded animate-pulse" />
            <div className="h-10 w-48 mx-auto bg-gray-700/30 rounded-lg animate-pulse mt-4" />
          </div>
        ) : status === 'success' ? (
          <div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl text-white ${notifications ? 'bg-indigo-500' : 'bg-red-500'}`}>
              {notifications ? '✓' : '✕'}
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {notifications ? "You're subscribed!" : 'Unsubscribed'}
            </h2>
            <p className="text-gray-400 mb-5">
              {notifications
                ? 'You will continue receiving email notifications.'
                : 'You have been unsubscribed from email notifications.'}
            </p>
            <p className="text-gray-600 text-sm">{email}</p>
          </div>
        ) : (
          <div>
            <p className="mb-2">
              Email: <strong className="text-indigo-400">{email}</strong>
            </p>
            <p className="text-gray-400 mb-6 text-sm">
              Notifications are currently{' '}
              <strong className={notifications ? 'text-emerald-400' : 'text-red-400'}>
                {notifications ? 'enabled' : 'disabled'}
              </strong>
            </p>

            {notifications ? (
              <button
                onClick={handleUnsubscribe}
                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-base transition-colors"
              >
                Unsubscribe from Emails
              </button>
            ) : (
              <button
                onClick={handleResubscribe}
                className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold text-base transition-colors"
              >
                Re-subscribe to Emails
              </button>
            )}

            {status === 'error' && (
              <p className="text-red-400 mt-4 text-sm">
                Something went wrong. Please try again.
              </p>
            )}
          </div>
        )}

        <div className="mt-8 border-t border-gray-700 pt-4">
          <p className="text-gray-600 text-xs">
            VPN XO &bull;{' '}
            <a href="https://vpn-xo.com" className="text-indigo-400 hover:text-indigo-300 no-underline">
              vpn-xo.com
            </a>
            {' '}&bull;{' '}
            <a href="/privacy-policy" className="text-gray-500 hover:text-gray-400 underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailPreferences;
