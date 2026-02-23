import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaEnvelope,
  FaUser,
  FaComment,
  FaPaperPlane,
  FaCheckCircle,
  FaArrowLeft,
  FaTicketAlt,
  FaTelegramPlane,
  FaRobot,
  FaClock,
  FaHeadset,
} from 'react-icons/fa';
import { apiService } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SEO from '../components/SEO';

const ContactUs = () => {
  useDocumentTitle('Contact Us');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [error, setError] = useState('');

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'account', label: 'Account Management' },
    { value: 'connection', label: 'Connection Problems' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'other', label: 'Other' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Use the public ticket endpoint
      const response = await apiService.submitContactForm({
        name: formData.name,
        email: formData.email,
        subject: formData.subject || 'Contact Form Submission',
        message: formData.message,
        category: formData.category,
      });

      setSuccess(true);
      setTicketNumber(response.data.ticket_number);
      setFormData({ name: '', email: '', subject: '', message: '', category: 'general' });
      
      // Reset success message after 10 seconds
      setTimeout(() => {
        setSuccess(false);
        setTicketNumber('');
      }, 10000);
    } catch (err) {
      console.error('Contact form error:', err);
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <SEO
        title="Contact Us — VPN XO Support"
        description="Get in touch with VPN XO support team. We're here to help with technical issues, billing questions, and general inquiries."
        path="/contact"
      />
      {/* Navigation */}
      <nav className="bg-black bg-opacity-30 backdrop-blur-md border-b border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center text-white hover:text-blue-300 transition"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>

              {success && (
                <motion.div
                  className="mb-6 p-4 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start text-green-200">
                    <FaCheckCircle className="mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Message sent successfully!</p>
                      <p className="text-sm">
                        Your support ticket has been created: <span className="font-mono font-bold">#{ticketNumber}</span>
                      </p>
                      <p className="text-sm mt-2">
                        We'll get back to you soon. If you have an account, you can track this ticket in your dashboard.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-200"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                <Input
                  label="Your Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  icon={<FaUser />}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  icon={<FaEnvelope />}
                  required
                />

                <Input
                  label="Subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  icon={<FaComment />}
                  required
                />

                <div className="mb-6">
                  <label className="block text-white mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-gray-800">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-white mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us what's on your mind..."
                    rows="6"
                    required
                    className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                  icon={<FaPaperPlane />}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>

                <div className="mt-4 p-3 bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg">
                  <div className="flex items-start text-blue-200 text-sm">
                    <FaTicketAlt className="mr-2 mt-1 flex-shrink-0" />
                    <p>
                      Your message will be converted to a support ticket. You'll receive a ticket number that you can use to track your inquiry.
                    </p>
                  </div>
                </div>
              </form>
            </Card>
          </motion.div>

          {/* Support Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Email Card */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Support</h2>
              
              <div className="space-y-5">
                <div className="flex items-start">
                  <div className="bg-blue-500 bg-opacity-20 p-3 rounded-lg mr-4">
                    <FaEnvelope className="text-2xl text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email</h3>
                    <a
                      href="mailto:support@vpn-xo.com"
                      className="text-gray-300 hover:text-blue-400 transition"
                    >
                      support@vpn-xo.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-500 bg-opacity-20 p-3 rounded-lg mr-4">
                    <FaClock className="text-2xl text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Response Time</h3>
                    <p className="text-gray-300 text-sm">We typically respond within 24 hours.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-500 bg-opacity-20 p-3 rounded-lg mr-4">
                    <FaHeadset className="text-2xl text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Premium Support</h3>
                    <p className="text-gray-300 text-sm">Premium users get priority 24/7 support.</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Telegram Bot Card */}
            <Card className="p-8 border border-blue-500 border-opacity-30">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <FaTelegramPlane className="mr-3 text-blue-400" />
                Instant Support via Telegram
              </h2>
              <p className="text-gray-300 mb-4">
                Get faster support through our Telegram bot. Create tickets, check account status, manage your subscription — all from your phone.
              </p>
              <div className="space-y-3">
                <a
                  href="https://t.me/vpn_xobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
                >
                  <FaRobot className="mr-2" />
                  Open @vpn_xobot
                </a>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div className="flex items-center"><span className="text-green-400 mr-1">✓</span> Create tickets</div>
                  <div className="flex items-center"><span className="text-green-400 mr-1">✓</span> Account info</div>
                  <div className="flex items-center"><span className="text-green-400 mr-1">✓</span> Server status</div>
                  <div className="flex items-center"><span className="text-green-400 mr-1">✓</span> Change password</div>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-3 text-center">Same ticket system — all channels are synced.</p>
            </Card>

            {/* Ticket Tracking */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Track Your Ticket</h2>
              <p className="text-gray-300 text-sm mb-4">
                If you have an account, log in to your dashboard to view and track all your support tickets in real time.
              </p>
              <Link
                to="/login"
                className="flex items-center justify-center w-full py-3 px-4 bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-semibold rounded-lg transition border border-white border-opacity-20"
              >
                <FaTicketAlt className="mr-2" />
                Go to Dashboard
              </Link>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
