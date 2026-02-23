import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'What is a VPN and why do I need one?',
      answer: 'A VPN (Virtual Private Network) encrypts your internet connection and hides your IP address, protecting your privacy online. You need a VPN to secure your data on public WiFi, access geo-restricted content, prevent tracking, and maintain anonymity while browsing.'
    },
    {
      question: 'How does VPN XO protect my privacy?',
      answer: 'VPN XO uses military-grade AES-256 encryption to secure your data. We have a strict no-logs policy, meaning we don\'t track, collect, or share your browsing activity. Your IP address is masked, and all your internet traffic is routed through our secure servers.'
    },
    {
      question: 'Can I use VPN XO on multiple devices?',
      answer: 'Yes! All our plans support up to 5 simultaneous device connections. You can use VPN XO on Windows, Mac, Linux, iOS, Android, and more. One subscription covers all your devices.'
    },
    {
      question: 'Will VPN XO slow down my internet speed?',
      answer: 'VPN XO is optimized for speed. While any VPN may cause a slight decrease in speed due to encryption, our high-performance servers and optimized protocols ensure you get the fastest possible connection. Most users don\'t notice any difference in their browsing experience.'
    },
    {
      question: 'What is your refund policy?',
      answer: 'We offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied with VPN XO for any reason, simply contact our support team within 30 days of purchase for a full refund, no questions asked.'
    },
    {
      question: 'Can I use VPN XO for streaming?',
      answer: 'Absolutely! VPN XO works great with popular streaming services like Netflix, Hulu, Disney+, BBC iPlayer, and more. Our servers are optimized for streaming, providing fast speeds and reliable connections for buffer-free viewing.'
    },
    {
      question: 'Is VPN XO legal to use?',
      answer: 'Yes, using a VPN is legal in most countries. VPN XO is a legitimate privacy tool used by millions worldwide. However, we don\'t condone using our service for illegal activities. Always comply with local laws and the terms of service of websites you visit.'
    },
    {
      question: 'What protocols does VPN XO support?',
      answer: 'VPN XO supports multiple protocols including Shadowsocks, V2Ray, Trojan, and Hysteria. Each protocol is optimized for different use cases - some for speed, others for security or bypassing restrictions. You can choose the best protocol for your needs.'
    },
    {
      question: 'Do you keep any logs?',
      answer: 'No. We have a strict no-logs policy. We don\'t track, collect, or store any information about your online activities, browsing history, connection timestamps, IP addresses, or DNS queries. Your privacy is our top priority.'
    },
    {
      question: 'How do I get started with VPN XO?',
      answer: 'Getting started is easy! Simply choose a plan, create an account, download our app for your device, and connect to any server. The entire process takes less than 5 minutes. We also offer a free trial so you can test our service risk-free.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards and debit cards via Stripe, Apple Pay, and cryptocurrency via Coinbase Commerce for maximum privacy. All payments are processed securely.'
    },
    {
      question: 'Can I change my plan later?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time from your account dashboard. If you upgrade, you\'ll be charged the prorated difference. If you downgrade, the change will take effect at the end of your current billing cycle.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6"
          >
            <FaQuestionCircle className="text-3xl text-blue-600" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600"
          >
            Everything you need to know about VPN XO
          </motion.p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
              >
                <span className="font-semibold text-gray-900 pr-8">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaChevronDown className="text-blue-600 flex-shrink-0" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Our support team is here to help 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Contact Support
            </button>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition">
              Live Chat
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
