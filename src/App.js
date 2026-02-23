import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './App.css';

// Error Boundary
import ErrorBoundary from './components/ErrorBoundary';

// Route Protection
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Toast Provider for global notifications
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

// Lazy-loaded pages — code-split per route for faster initial load
const VPNXOHomeRedesigned = lazy(() => import('./pages/VPNXOHomeRedesigned'));
const VPNXOLoginEnhanced = lazy(() => import('./pages/VPNXOLoginEnhanced'));
const VPNXORegisterEnhanced = lazy(() => import('./pages/VPNXORegisterEnhanced'));
const EmailVerification = lazy(() => import('./pages/EmailVerification'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const VPNXOSubscribe = lazy(() => import('./pages/VPNXOSubscribe'));
const VPNXODownload = lazy(() => import('./pages/VPNXODownload'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentCancel = lazy(() => import('./pages/PaymentCancel'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const EmailPreferences = lazy(() => import('./pages/EmailPreferences'));
const NotFound = lazy(() => import('./pages/NotFound'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));

// Loading fallback for Suspense
const PageLoader = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

/**
 * Main App Component
 * 
 * SECURITY FEATURES:
 * - ErrorBoundary: Catches and handles errors gracefully
 * - ProtectedRoute: Requires authentication for dashboard
 * - AdminRoute: Requires admin role for admin panel
 * - 404 Page: Handles invalid routes
 * 
 * PRODUCTION ROUTES ONLY:
 * - Removed multiple versions of pages
 * - Clean, professional routing structure
 */
function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
      <AuthProvider>
      <ThemeProvider>
      <ToastProvider>
        <Router>
          <div className="App">
            <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<VPNXOHomeRedesigned />} />
              <Route path="/login" element={<VPNXOLoginEnhanced />} />
              <Route path="/register" element={<VPNXORegisterEnhanced />} />
              <Route path="/verify" element={<EmailVerification />} />
              <Route path="/download" element={<VPNXODownload />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/email-preferences" element={<EmailPreferences />} />
              <Route path="/unsubscribe" element={<EmailPreferences />} />

              {/* Protected Routes - Require Authentication */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscribe"
                element={<VPNXOSubscribe />}
              />

              {/* Admin Routes - Require Admin Role */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Payment Routes - Protected */}
              <Route
                path="/payment-success"
                element={
                  <ProtectedRoute>
                    <PaymentSuccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment-cancel"
                element={
                  <ProtectedRoute>
                    <PaymentCancel />
                  </ProtectedRoute>
                }
              />

              {/* Blog */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />

              {/* OAuth Callback */}
              <Route path="/auth/google/callback" element={<GoogleCallback />} />

              {/* 404 Not Found - Must be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </div>
        </Router>
      </ToastProvider>
      </ThemeProvider>
      </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
