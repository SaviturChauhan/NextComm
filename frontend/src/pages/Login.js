import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { FiX } from 'react-icons/fi';

const Login = () => {
  const [showModal, setShowModal] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleGoogleSignIn = () => {
    // Use full backend URL for OAuth
    let backendUrl = process.env.REACT_APP_API_URL;
    
    if (!backendUrl) {
      if (process.env.NODE_ENV === 'production') {
        alert('Error: REACT_APP_API_URL is not configured. Please set it in Vercel environment variables.');
        console.error('❌ REACT_APP_API_URL is not set in production!');
        return;
      }
      // Development fallback
      backendUrl = 'http://localhost:5001';
    }
    
    // Remove trailing slash if present
    backendUrl = backendUrl.replace(/\/$/, '');
    
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  // Don't show modal if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80')`,
          animation: 'zoomIn 20s ease-in-out infinite alternate'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-blue-600/85 to-purple-600/90"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Modal/Popup for Google Sign-In */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative z-10 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 md:p-10 max-w-md w-full transform transition-all duration-300 scale-100">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
              <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
                {/* Wireless Communication Icon - Radio Signal Waves */}
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                  <circle cx="12" cy="12" r="5" stroke="currentColor" opacity="0.8"/>
                  <circle cx="12" cy="12" r="8" stroke="currentColor" opacity="0.6"/>
                  <circle cx="12" cy="12" r="11" stroke="currentColor" opacity="0.4"/>
                </svg>
              </div>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                Welcome to NextComm
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Sign in with your Google account to continue
              </p>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] font-semibold text-lg"
            >
              <FcGoogle className="w-6 h-6" />
              <span>Sign in with Google</span>
            </button>

            <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      )}

      {/* Fallback content if modal is closed */}
      {!showModal && (
        <div className="relative z-10 max-w-md w-full">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 md:p-10 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
              Sign in to NextComm
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please sign in with Google to continue
            </p>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] font-semibold"
            >
              <FcGoogle className="w-5 h-5" />
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
