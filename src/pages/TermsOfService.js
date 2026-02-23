import React from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SEO from '../components/SEO';

const TermsOfService = () => {
  useDocumentTitle('Terms of Service');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <SEO
        title="Terms of Service — VPN XO"
        description="VPN XO terms of service. Read about acceptable use, subscription terms, and service guarantees."
        path="/terms"
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-8 mb-8 border border-white border-opacity-20">
          <Link to="/" className="text-blue-300 hover:text-blue-200 mb-4 inline-block">
            â† Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-300">Last Updated: February 22, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-8 border border-white border-opacity-20 text-gray-200 space-y-6">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using VPN XO ("Service"), you accept and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">2. Description of Service</h2>
            <p className="mb-3">VPN XO provides:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Virtual Private Network (VPN) services</li>
              <li>Encrypted internet connection</li>
              <li>Access to global server network</li>
              <li>Privacy protection tools</li>
              <li>Customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">3. Account Registration</h2>
            <p className="mb-3">To use our Service, you must:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Be at least 18 years old</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">4. Acceptable Use Policy</h2>
            
            <h3 className="text-xl font-semibold text-white mb-2">4.1 Permitted Use</h3>
            <p className="mb-3">You may use our Service for:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Protecting your privacy online</li>
              <li>Securing your internet connection</li>
              <li>Accessing geo-restricted content (where legal)</li>
              <li>Bypassing censorship (where legal)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-2 mt-4">4.2 Prohibited Activities</h3>
            <p className="mb-3">You may NOT use our Service for:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>âŒ Illegal activities or criminal conduct</li>
              <li>âŒ Distributing malware or viruses</li>
              <li>âŒ Hacking or unauthorized access</li>
              <li>âŒ Spamming or phishing</li>
              <li>âŒ Copyright infringement</li>
              <li>âŒ Child exploitation material</li>
              <li>âŒ Harassment or threats</li>
              <li>âŒ Violating others' privacy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">5. Subscription and Payment</h2>
            
            <h3 className="text-xl font-semibold text-white mb-2">5.1 Plans</h3>
            <p className="mb-3">We offer:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Free tier (limited features)</li>
              <li>Monthly subscription ($6.99/month)</li>
              <li>6+1 Month plan ($41.99 for 7 months)</li>
              <li>12+2 Month plan ($83.99 for 14 months)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-2 mt-4">5.2 Payment Terms</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Payments are processed securely through Stripe</li>
              <li>Subscriptions auto-renew unless cancelled</li>
              <li>Prices are subject to change with 30 days notice</li>
              <li>All sales are final - no refunds available</li>
              <li>You may cancel anytime to prevent future charges</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-2 mt-4">5.3 Cancellation</h3>
            <p>
              You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing period. No refunds for partial months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">6. Service Availability</h2>
            <p className="mb-3">We strive for 99.9% uptime, but we do not guarantee:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Uninterrupted service</li>
              <li>Error-free operation</li>
              <li>Specific connection speeds</li>
              <li>Availability in all countries</li>
            </ul>
            <p className="mt-3">
              We reserve the right to modify, suspend, or discontinue the Service with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">7. Privacy and Data</h2>
            <p>
              We maintain a strict no-logs policy. Please review our <Link to="/privacy-policy" className="text-blue-300 hover:text-blue-200">Privacy Policy</Link> for details on how we handle your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">8. Intellectual Property</h2>
            <p className="mb-3">All content and materials on our Service are protected by:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Copyright laws</li>
              <li>Trademark laws</li>
              <li>Other intellectual property rights</li>
            </ul>
            <p className="mt-3">
              You may not copy, modify, distribute, or reverse engineer any part of our Service without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">9. Limitation of Liability</h2>
            <p className="mb-3">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, VPN XO SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Indirect, incidental, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Service interruptions or errors</li>
              <li>Third-party actions or content</li>
              <li>Unauthorized access to your data</li>
            </ul>
            <p className="mt-3">
              Our total liability shall not exceed the amount you paid for the Service in the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless VPN XO from any claims, damages, or expenses arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any laws or regulations</li>
              <li>Your violation of third-party rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">11. Termination</h2>
            <p className="mb-3">We may terminate or suspend your account immediately if:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You violate these Terms</li>
              <li>You engage in prohibited activities</li>
              <li>Your payment fails</li>
              <li>Required by law</li>
            </ul>
            <p className="mt-3">
              Upon termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">12. Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold text-white mb-2">12.1 Governing Law</h3>
            <p>
              These Terms are governed by the laws of Canada, without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-semibold text-white mb-2 mt-4">12.2 Arbitration</h3>
            <p>
              Any disputes shall be resolved through binding arbitration, except for claims that may be brought in small claims court.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">13. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of significant changes via email or through the Service. Continued use after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">14. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">15. Contact Information</h2>
            <p className="mb-3">For questions about these Terms, contact us:</p>
            <ul className="space-y-2">
              <li><strong>Email:</strong> <a href="mailto:legal@vpn-xo.com" className="text-blue-300 hover:text-blue-200">legal@vpn-xo.com</a></li>
              <li><strong>Support:</strong> <a href="mailto:support@vpn-xo.com" className="text-blue-300 hover:text-blue-200">support@vpn-xo.com</a></li>
              <li><strong>Website:</strong> <a href="https://vpn-xo.com" className="text-blue-300 hover:text-blue-200">https://vpn-xo.com</a></li>
            </ul>
          </section>

          <div className="bg-yellow-900 bg-opacity-30 rounded-lg p-6 mt-8 border-l-4 border-yellow-500">
            <h3 className="text-xl font-bold text-white mb-2">âš ï¸ Important Notice</h3>
            <p>
              By using VPN XO, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, please discontinue use immediately.
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-x-4">
          <Link to="/privacy-policy" className="text-blue-300 hover:text-blue-200">Privacy Policy</Link>
          <span className="text-gray-500">|</span>
          <Link to="/" className="text-blue-300 hover:text-blue-200">Home</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

