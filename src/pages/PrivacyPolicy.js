import React from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SEO from '../components/SEO';

const PrivacyPolicy = () => {
  useDocumentTitle('Privacy Policy');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <SEO
        title="Privacy Policy — VPN XO"
        description="VPN XO privacy policy. Learn how we protect your data, our strict no-logs policy, and your rights as a user."
        path="/privacy"
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-8 mb-8 border border-white border-opacity-20">
          <Link to="/" className="text-blue-300 hover:text-blue-200 mb-4 inline-block">
            â† Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-300">Last Updated: February 22, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-8 border border-white border-opacity-20 text-gray-200 space-y-6">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-3">1. Introduction</h2>
            <p>
              VPN XO ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our VPN service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-white mb-2">2.1 Personal Information</h3>
            <p className="mb-3">We collect the following personal information:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Email address (for account creation and communication)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Account credentials (encrypted)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-2 mt-4">2.2 Usage Information</h3>
            <p className="mb-3">We collect minimal usage data:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Connection timestamps (for service quality)</li>
              <li>Data usage (bandwidth consumed)</li>
              <li>Server selection (for load balancing)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-2 mt-4">2.3 What We DON'T Collect</h3>
            <p className="mb-3">We maintain a strict no-logs policy:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>âŒ Browsing history</li>
              <li>âŒ Traffic data</li>
              <li>âŒ DNS queries</li>
              <li>âŒ Connection logs</li>
              <li>âŒ IP addresses (after connection)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide and maintain our VPN service</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send important service notifications</li>
              <li>Respond to customer support requests</li>
              <li>Improve our service quality</li>
              <li>Prevent fraud and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">4. Data Sharing and Disclosure</h2>
            <p className="mb-3">We do NOT sell your personal information. We may share data only in these limited circumstances:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Payment Processors:</strong> Stripe (for payment processing)</li>
              <li><strong>Email Service:</strong> SendPulse (for transactional emails)</li>
              <li><strong>Legal Requirements:</strong> If required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">5. Data Security</h2>
            <p className="mb-3">We implement industry-standard security measures:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>AES-256-GCM encryption for VPN connections</li>
              <li>Encrypted password storage (bcrypt)</li>
              <li>Secure HTTPS connections</li>
              <li>Regular security audits</li>
              <li>Limited data retention</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">6. Data Retention</h2>
            <p>
              We retain your personal information only as long as necessary to provide our services and comply with legal obligations:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>Account data: Until account deletion</li>
              <li>Payment records: 7 years (tax compliance)</li>
              <li>Usage data: 30 days maximum</li>
              <li>Support tickets: 1 year</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request data deletion</li>
              <li>Export your data</li>
              <li>Withdraw consent</li>
              <li>Object to data processing</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at: <a href="mailto:privacy@vpn-xo.com" className="text-blue-300 hover:text-blue-200">privacy@vpn-xo.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">8. Cookies and Tracking</h2>
            <p>
              We use minimal cookies for essential functionality:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>Authentication tokens (required)</li>
              <li>Session management (required)</li>
              <li>No third-party tracking cookies</li>
              <li>No advertising cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">9. Children's Privacy</h2>
            <p>
              Our service is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">10. International Data Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">12. Contact Us</h2>
            <p className="mb-3">If you have questions about this Privacy Policy, please contact us:</p>
            <ul className="space-y-2">
              <li><strong>Email:</strong> <a href="mailto:privacy@vpn-xo.com" className="text-blue-300 hover:text-blue-200">privacy@vpn-xo.com</a></li>
              <li><strong>Support:</strong> <a href="mailto:support@vpn-xo.com" className="text-blue-300 hover:text-blue-200">support@vpn-xo.com</a></li>
              <li><strong>Website:</strong> <a href="https://vpn-xo.com" className="text-blue-300 hover:text-blue-200">https://vpn-xo.com</a></li>
            </ul>
          </section>

          <div className="bg-blue-900 bg-opacity-30 rounded-lg p-6 mt-8">
            <h3 className="text-xl font-bold text-white mb-2">Our Commitment</h3>
            <p>
              At VPN XO, we believe privacy is a fundamental right. We are committed to maintaining the highest standards of data protection and transparency. Your trust is our priority.
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-x-4">
          <Link to="/terms-of-service" className="text-blue-300 hover:text-blue-200">Terms of Service</Link>
          <span className="text-gray-500">|</span>
          <Link to="/" className="text-blue-300 hover:text-blue-200">Home</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

