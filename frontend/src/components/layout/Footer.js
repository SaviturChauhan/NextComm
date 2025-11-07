import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiMail, 
  FiArrowUp,
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiYoutube,
  FiSend,
  FiHeart
} from 'react-icons/fi';
import { FaDiscord, FaSlack } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }

    setSubscribing(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
      setSubscribing(false);
    }, 1000);
  };

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'Questions', path: '/dashboard' },
      { name: 'Ask Question', path: '/ask' },
      { name: 'Leaderboard', path: '/leaderboard' },
      { name: 'How to Earn Points', path: '/points-guide' }
    ]
  };

  const socialLinks = [
    { icon: <FiGithub className="w-5 h-5" />, url: 'https://github.com', label: 'GitHub' },
    { icon: <FiTwitter className="w-5 h-5" />, url: 'https://twitter.com', label: 'Twitter' },
    { icon: <FiLinkedin className="w-5 h-5" />, url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <FiYoutube className="w-5 h-5" />, url: 'https://youtube.com', label: 'YouTube' },
    { icon: <FaDiscord className="w-5 h-5" />, url: 'https://discord.com', label: 'Discord' },
    { icon: <FaSlack className="w-5 h-5" />, url: 'https://slack.com', label: 'Slack' }
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 relative">
      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="absolute -top-6 right-8 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-110 group"
        aria-label="Back to top"
      >
        <FiArrowUp className="w-5 h-5 group-hover:animate-bounce" />
      </button>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Brand & Newsletter Section */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                {/* Wireless Communication Icon - Radio Signal Waves */}
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                  <circle cx="12" cy="12" r="5" stroke="currentColor" opacity="0.8"/>
                  <circle cx="12" cy="12" r="8" stroke="currentColor" opacity="0.6"/>
                  <circle cx="12" cy="12" r="11" stroke="currentColor" opacity="0.4"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">NextComm</span>
            </div>

            <p className="text-gray-400 mb-6 text-sm leading-relaxed max-w-md">
              Your go-to platform for wireless communication learning. Connect with experts, 
              ask questions, and build your knowledge in wireless channel models, MIMO systems, OFDM, and more.
            </p>

            {/* Newsletter Subscription */}
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <FiMail className="w-4 h-4 text-primary" />
                Subscribe to Newsletter
              </h4>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white text-sm"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subscribing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FiSend className="w-5 h-5" />
                  )}
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2">Get weekly updates and study materials</p>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Follow Us</h4>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {currentYear} NextComm. All rights reserved.
            </p>

            {/* Made with love */}
            <p className="text-gray-500 text-sm flex items-center gap-2">
              Made with <FiHeart className="text-red-500 w-4 h-4 animate-pulse" /> for Wireless Communication Students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

