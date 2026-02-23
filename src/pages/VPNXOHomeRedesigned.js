import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShieldAlt,
  FaBolt,
  FaGlobe,
  FaWindows,
  FaAndroid,
  FaApple,
  FaLinux,
  FaCheck,
  FaServer,
  FaLock,
  FaUserSecret,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaRocket,
  FaNetworkWired,
  FaEyeSlash,
  FaChrome,
} from 'react-icons/fa';
import CyberButton from '../components/common/CyberButton';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SEO from '../components/SEO';

const VPNXOHomeRedesigned = () => {
  useDocumentTitle('Home');
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const [serverCount, setServerCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch real server count from API
  useEffect(() => {
    apiService.getServers()
      .then(res => {
        if (Array.isArray(res.data)) setServerCount(res.data.length);
      })
      .catch(() => {});
  }, []);

  // Radar Scan Animation Variants
  const scanVariants = {
    animate: {
      rotate: 360,
      transition: { duration: 4, repeat: Infinity, ease: "linear" }
    }
  };

  const features = [
    {
      icon: <FaLock className="text-3xl" />,
      title: 'Military-Grade Encryption',
      desc: 'AES-256 encryption with Shadowsocks, V2Ray, Trojan, WireGuard & VLESS/REALITY protocols.',
    },
    {
      icon: <FaEyeSlash className="text-3xl" />,
      title: 'Zero-Log Policy',
      desc: 'We never track, collect, or share your browsing activity. Your data stays yours.',
    },
    {
      icon: <FaBolt className="text-3xl" />,
      title: 'Blazing Fast Speeds',
      desc: 'Optimized servers with 10Gbps uplinks deliver unthrottled streaming and downloads.',
    },
    {
      icon: <FaNetworkWired className="text-3xl" />,
      title: 'Multi-Protocol Support',
      desc: 'Choose between 6 VPN protocols optimized for speed, security, or censorship bypass.',
    },
    {
      icon: <FaGlobe className="text-3xl" />,
      title: 'Global Server Network',
      desc: `${serverCount || 'Multiple'} servers across multiple countries for unrestricted global access.`,
    },
    {
      icon: <FaRocket className="text-3xl" />,
      title: 'Anti-Censorship',
      desc: 'Advanced obfuscation technology bypasses DPI and censorship firewalls worldwide.',
    },
  ];

  const faqs = [
    {
      q: 'What is VPN XO and how does it work?',
      a: 'VPN XO encrypts your internet connection and routes it through our secure servers, hiding your IP address and protecting your data from tracking, hackers, and surveillance.',
    },
    {
      q: 'Which VPN protocols do you support?',
      a: 'We support 8 protocols: WireGuard, Hysteria2, TUIC v5, ShadowTLS, VLESS, Trojan, Shadowsocks, and VMess — each optimized for different use cases like speed, security, or censorship bypass.',
    },
    {
      q: 'Can I use VPN XO for free?',
      a: 'Yes! Our free tier gives you access to all servers and all 8 protocols with 1 device. Premium unlocks split tunneling, removes ads, and increases your device limit to 3.',
    },
    {
      q: 'What platforms are supported?',
      a: 'VPN XO is available on Android, iOS, Windows, macOS, and Linux as a native app — plus a Chrome browser extension for instant browser-level protection. All platforms are live and ready to download.',
    },
    {
      q: 'What is your refund policy?',
      a: 'All sales are final. You can cancel your subscription at any time to prevent future charges. Cancellation takes effect at the end of your current billing period.',
    },
    {
      q: 'Do you keep any logs?',
      a: 'No. We maintain a strict no-logs policy. We do not track browsing history, connection timestamps, or DNS queries.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept credit/debit cards via Stripe, Apple Pay, and cryptocurrency via Coinbase Commerce. Monthly, 6-month, and annual plans are available.',
    },
  ];

  return (
    <div className="min-h-screen bg-cyber-dark text-white font-sans selection:bg-cyber-green selection:text-cyber-dark overflow-x-hidden">
      <SEO
        title="VPN XO — Secure, Fast & Private VPN Service"
        description="VPN XO offers military-grade encryption with WireGuard, Shadowsocks, V2Ray, Trojan & VLESS protocols. Browse privately, bypass censorship, and protect your data. Free plan available."
        path="/"
      />
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(rgba(0,255,136,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-cyber-cyan/10 to-transparent"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-cyber-dark/95 backdrop-blur-md border-b border-cyber-green/20' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <FaShieldAlt className="text-3xl text-cyber-green group-hover:text-cyber-cyan transition-colors" />
            <span className="text-2xl font-bold tracking-tighter">VPN<span className="text-cyber-green">XO</span></span>
          </Link>

          <div className="hidden md:flex space-x-8">
            {['Features', 'Pricing', 'Download', 'FAQ'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-cyber-cyan transition-colors text-sm uppercase tracking-widest">
                {item}
              </a>
            ))}
            <Link to="/contact" className="text-gray-400 hover:text-cyber-cyan transition-colors text-sm uppercase tracking-widest">
              Contact
            </Link>
            <Link to="/blog" className="text-gray-400 hover:text-cyber-cyan transition-colors text-sm uppercase tracking-widest">
              Blog
            </Link>
          </div>

          <div className="hidden md:flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                <span className="text-cyber-green text-sm font-bold tracking-wider">{user?.email?.split('@')[0]}</span>
                <Link to="/dashboard">
                  <CyberButton variant="primary">Dashboard</CyberButton>
                </Link>
                <button onClick={logout} className="text-gray-400 hover:text-white px-4 py-2 uppercase text-sm font-bold tracking-wider">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-400 hover:text-white px-4 py-2 uppercase text-sm font-bold tracking-wider">
                  Login
                </Link>
                <Link to="/register">
                  <CyberButton variant="primary">Get Access</CyberButton>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-2xl text-gray-400 hover:text-white">
            {mobileMenu ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-cyber-dark/95 backdrop-blur-md border-b border-cyber-green/20"
            >
              <div className="px-6 py-4 space-y-4">
                {['Features', 'Pricing', 'Download', 'FAQ'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenu(false)} className="block text-gray-400 hover:text-cyber-cyan text-sm uppercase tracking-widest">
                    {item}
                  </a>
                ))}
                <Link to="/contact" onClick={() => setMobileMenu(false)} className="block text-gray-400 hover:text-cyber-cyan text-sm uppercase tracking-widest">Contact</Link>
                <Link to="/blog" onClick={() => setMobileMenu(false)} className="block text-gray-400 hover:text-cyber-cyan text-sm uppercase tracking-widest">Blog</Link>
                <div className="flex gap-4 pt-4 border-t border-cyber-green/10">
                  {isAuthenticated ? (
                    <>
                      <Link to="/dashboard" onClick={() => setMobileMenu(false)}><CyberButton variant="primary">Dashboard</CyberButton></Link>
                      <button onClick={() => { logout(); setMobileMenu(false); }} className="text-gray-400 hover:text-white uppercase text-sm font-bold">Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="text-gray-400 hover:text-white uppercase text-sm font-bold">Login</Link>
                      <Link to="/register"><CyberButton variant="primary">Get Access</CyberButton></Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-1 mb-6 border border-cyber-cyan/30 rounded-full bg-cyber-cyan/5 text-cyber-cyan text-xs font-bold tracking-[0.2em] uppercase">
              System Secure • v2.0 Live
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6">
              SECURE YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-green to-cyber-cyan animate-pulse">
                DIGITAL EXISTENCE
              </span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-lg leading-relaxed">
              Military-grade encryption meets cyberpunk speed. Bypass restrictions, mask your signature, and browse without a trace.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link to="/register">
                <CyberButton variant="primary" className="w-full sm:w-auto">
                  Initialize Connection
                </CyberButton>
              </Link>
              <Link to="/download">
                <CyberButton variant="secondary" className="w-full sm:w-auto">
                  Download Client
                </CyberButton>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-8 text-gray-500 text-sm font-mono">
              <div className="flex items-center gap-2">
                <FaBolt className="text-cyber-green" /> 10Gbps Uplink
              </div>
              <div className="flex items-center gap-2">
                <FaUserSecret className="text-cyber-cyan" /> Zero-Log Policy
              </div>
              <div className="flex items-center gap-2">
                <FaServer className="text-cyber-green" /> {serverCount || '...'} Servers
              </div>
            </div>
          </motion.div>

          {/* Hero Visual - Radar Scan */}
          <motion.div
            className="relative hidden md:flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="relative w-[400px] h-[400px] md:w-[500px] md:h-[500px]">
              <div className="absolute inset-0 border-2 border-cyber-green/20 rounded-full" />
              <div className="absolute inset-[15%] border border-cyber-green/10 rounded-full" />
              <div className="absolute inset-[30%] border border-cyber-green/5 rounded-full" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-transparent via-cyber-green/10 to-transparent rounded-full"
                variants={scanVariants}
                animate="animate"
                style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <FaGlobe className="text-[200px] text-cyber-dark drop-shadow-[0_0_15px_rgba(0,255,136,0.5)]" />
              </div>
              {[0, 90, 180, 270].map((deg, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-3 h-3 bg-cyber-cyan rounded-full shadow-[0_0_10px_#00E5FF]"
                  animate={{
                    x: Math.cos(deg * Math.PI / 180) * 200,
                    y: Math.sin(deg * Math.PI / 180) * 200,
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">WHY <span className="text-cyber-green">VPN XO</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Enterprise-grade security technology made accessible to everyone.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-cyber-card border border-cyber-green/10 p-8 rounded-xl hover:border-cyber-green/40 transition-all group"
              >
                <div className="text-cyber-green mb-4 group-hover:text-cyber-cyan transition-colors">{f.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">ACCESS <span className="text-cyber-green">PROTOCOLS</span></h2>
            <p className="text-gray-400">Select your clearance level</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Free Plan */}
            <div className="bg-cyber-card border border-cyber-green/20 p-8 rounded-xl hover:border-cyber-green/60 transition-all hover:shadow-[0_0_30px_rgba(0,255,136,0.1)] group">
              <h3 className="text-xl font-bold text-gray-300 mb-2">OPERATIVE</h3>
              <div className="text-4xl font-bold text-white mb-1">Free</div>
              <div className="text-gray-500 text-sm mb-6">No credit card required</div>
              <ul className="space-y-4 mb-8 text-gray-400 text-sm">
                <li className="flex items-center gap-3"><FaCheck className="text-cyber-green flex-shrink-0" /> 1 Device Connection</li>
                <li className="flex items-center gap-3"><FaCheck className="text-cyber-green flex-shrink-0" /> All VPN Protocols</li>
                <li className="flex items-center gap-3"><FaCheck className="text-cyber-green flex-shrink-0" /> All Server Locations</li>
                <li className="flex items-center gap-3"><FaCheck className="text-cyber-green flex-shrink-0" /> 250 Safe Slots Per Server</li>
              </ul>
              <p className="text-gray-500 text-xs mb-6">Queue-based access — if a server is full, oldest overflow user is replaced after 20 min</p>
              <Link to="/register">
                <CyberButton variant="secondary" className="w-full">Get Started Free</CyberButton>
              </Link>
            </div>

            {/* Monthly Plan (Featured) */}
            <div className="bg-cyber-dark border border-cyber-cyan p-8 rounded-xl relative transform md:scale-105 shadow-[0_0_30px_rgba(0,229,255,0.2)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyber-cyan text-cyber-dark px-4 py-1 text-xs font-bold uppercase tracking-wider">Recommended</div>
              <h3 className="text-xl font-bold text-cyber-cyan mb-2">GHOST</h3>
              <div className="text-5xl font-bold text-white mb-1">$6.99</div>
              <div className="text-gray-500 text-sm mb-6">per month</div>
              <ul className="space-y-4 mb-8 text-gray-300 text-sm">
                <li className="flex items-center gap-3"><FaCheck className="text-cyber-cyan flex-shrink-0" /> 5 Simultaneous Devices</li>
                <li className="flex items-center gap-3"><FaCheck className="text-cyber-cyan flex-shrink-0" /> Priority Server Access</li>
                <li className="flex items-center gap-3"><FaCheck className="text-cyber-cyan flex-shrink-0" /> Never Disconnected</li>
                <li className="flex items-center gap-3"><FaCheck className="text-cyber-cyan flex-shrink-0" /> 24/7 Priority Support</li>
                <li className="flex items-center gap-3"><FaCheck className="text-cyber-cyan flex-shrink-0" /> Unlimited Bandwidth</li>
              </ul>
              <Link to="/subscribe">
                <CyberButton variant="primary" className="w-full">Subscribe Monthly</CyberButton>
              </Link>
            </div>

            {/* 6-Month Plan */}
            <div className="bg-cyber-card border border-cyber-green/20 p-8 rounded-xl hover:border-cyber-green/60 transition-all group relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-500 text-white px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-full">+1 Bonus Month</div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">PHANTOM</h3>
              <div className="text-4xl font-bold text-white mb-1">$41.99</div>
              <div className="text-gray-500 text-sm mb-6">for 6 months (+1 free)</div>
              <ul className="space-y-4 mb-8 text-gray-400 text-sm">
                <li className="flex items-center gap-3"><FaCheck className="text-cyber-green flex-shrink-0" /> Everything in Ghost</li>
                <li className="flex items-center gap-3"><FaCheck className="text-cyber-green flex-shrink-0" /> 7 Months Total</li>
                <li className="flex items-center gap-3"><FaCheck className="text-cyber-green flex-shrink-0" /> ~$6.00/mo Effective</li>
                <li className="flex items-center gap-3"><FaCheck className="text-cyber-green flex-shrink-0" /> Priority Support</li>
              </ul>
              <Link to="/subscribe">
                <CyberButton variant="secondary" className="w-full">Subscribe 6 Months</CyberButton>
              </Link>
            </div>

            {/* Annual Plan */}
            <div className="bg-cyber-card border border-cyber-green/20 p-8 rounded-xl hover:border-cyber-green/60 transition-all group relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-full">Best Value</div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">SYNDICATE</h3>
              <div className="text-4xl font-bold text-white mb-1">$83.99</div>
              <div className="text-gray-500 text-sm mb-6">for 12 months (+2 free)</div>
              <ul className="space-y-4 mb-8 text-gray-400 text-sm">
                <li className="flex items-center gap-3"><FaCheck className="text-cyber-green flex-shrink-0" /> Everything in Ghost</li>
                <li className="flex items-center gap-3"><FaCheck className="text-cyber-green flex-shrink-0" /> 14 Months Total</li>
                <li className="flex items-center gap-3"><FaCheck className="text-cyber-green flex-shrink-0" /> ~$6.00/mo Effective</li>
                <li className="flex items-center gap-3"><FaCheck className="text-cyber-green flex-shrink-0" /> Dedicated IP Option</li>
              </ul>
              <Link to="/subscribe">
                <CyberButton variant="secondary" className="w-full">Subscribe Annually</CyberButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-24 px-6 border-t border-cyber-green/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">DOWNLOAD <span className="text-cyber-green">VPN XO</span></h2>
            <p className="text-gray-400">Available on your favorite platforms</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
            <Link to="/download" className="bg-cyber-card border border-cyber-green/20 p-6 rounded-xl text-center hover:border-cyber-green/60 transition-all group">
              <FaWindows className="text-4xl mx-auto mb-3 text-blue-400 group-hover:text-blue-300" />
              <p className="text-sm text-gray-400 font-bold">Windows</p>
              <p className="text-xs text-cyber-green mt-1">Available</p>
            </Link>
            <Link to="/download" className="bg-cyber-card border border-cyber-green/20 p-6 rounded-xl text-center hover:border-cyber-green/60 transition-all group">
              <FaApple className="text-4xl mx-auto mb-3 text-gray-300 group-hover:text-white" />
              <p className="text-sm text-gray-400 font-bold">macOS</p>
              <p className="text-xs text-cyber-green mt-1">Available</p>
            </Link>
            <Link to="/download" className="bg-cyber-card border border-cyber-green/20 p-6 rounded-xl text-center hover:border-cyber-green/60 transition-all group">
              <FaAndroid className="text-4xl mx-auto mb-3 text-green-500 group-hover:text-green-300" />
              <p className="text-sm text-gray-400 font-bold">Android</p>
              <p className="text-xs text-cyber-green mt-1">Available</p>
            </Link>
            <Link to="/download" className="bg-cyber-card border border-cyber-green/20 p-6 rounded-xl text-center hover:border-cyber-green/60 transition-all group">
              <FaApple className="text-4xl mx-auto mb-3 text-purple-400 group-hover:text-purple-300" />
              <p className="text-sm text-gray-400 font-bold">iOS</p>
              <p className="text-xs text-cyber-green mt-1">Available</p>
            </Link>
            <Link to="/download" className="bg-cyber-card border border-cyber-green/20 p-6 rounded-xl text-center hover:border-cyber-green/60 transition-all group">
              <FaLinux className="text-4xl mx-auto mb-3 text-orange-300 group-hover:text-orange-200" />
              <p className="text-sm text-gray-400 font-bold">Linux</p>
              <p className="text-xs text-cyber-green mt-1">Available</p>
            </Link>
            <Link to="/download" className="bg-cyber-card border border-cyber-green/20 p-6 rounded-xl text-center hover:border-cyber-green/60 transition-all group">
              <FaChrome className="text-4xl mx-auto mb-3 text-yellow-400 group-hover:text-yellow-300" />
              <p className="text-sm text-gray-400 font-bold">Chrome</p>
              <p className="text-xs text-cyber-green mt-1">Extension</p>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 border-t border-cyber-green/10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">FREQUENTLY <span className="text-cyber-green">ASKED</span></h2>
            <p className="text-gray-400">Questions & Answers</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-cyber-green/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-cyber-green/5 transition"
                >
                  <span className="font-semibold text-gray-200 pr-4 text-sm">{faq.q}</span>
                  <motion.div animate={{ rotate: faqOpen === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <FaChevronDown className="text-cyber-green flex-shrink-0 text-sm" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {faqOpen === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-4 bg-cyber-green/5 border-t border-cyber-green/10">
                        <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyber-green/10 bg-black/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FaShieldAlt className="text-2xl text-cyber-green" />
                <span className="font-bold text-gray-300">VPN XO</span>
              </div>
              <p className="text-gray-500 text-sm">Military-grade encryption for everyone. Protect your digital life.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-300 mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-gray-500 hover:text-cyber-green transition">Features</a></li>
                <li><a href="#pricing" className="text-gray-500 hover:text-cyber-green transition">Pricing</a></li>
                <li><Link to="/download" className="text-gray-500 hover:text-cyber-green transition">Download</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-300 mb-4 text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contact" className="text-gray-500 hover:text-cyber-green transition">Contact Us</Link></li>
                <li><a href="#faq" className="text-gray-500 hover:text-cyber-green transition">FAQ</a></li>
                <li><Link to="/blog" className="text-gray-500 hover:text-cyber-green transition">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-300 mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy-policy" className="text-gray-500 hover:text-cyber-green transition">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="text-gray-500 hover:text-cyber-green transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-cyber-green/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">&copy; 2026 VPN XO. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-4">
              <FaWindows className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
              <FaAndroid className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
              <FaApple className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
              <FaLinux className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default VPNXOHomeRedesigned;
