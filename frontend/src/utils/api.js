// API configuration utility
// Gets the backend API URL from environment and configures axios

import axios from 'axios';

const getBackendUrl = () => {
  // In production, REACT_APP_API_URL MUST be set
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/$/, ''); // Remove trailing slash
  }
  
  // In development, use localhost (proxy will handle it)
  if (process.env.NODE_ENV === 'development') {
    return ''; // Empty string means use relative URLs (proxy will handle it)
  }
  
  // In production without REACT_APP_API_URL, this is an error
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ CRITICAL: REACT_APP_API_URL is not set in production!');
    console.error('   Please set REACT_APP_API_URL in Vercel environment variables');
    // Return empty string to avoid breaking, but it won't work
    return '';
  }
  
  // Final fallback for development
  return '';
};

export const API_BASE_URL = getBackendUrl();

// Configure axios baseURL
// In development: empty string (uses proxy from package.json)
// In production: full backend URL from REACT_APP_API_URL
if (API_BASE_URL) {
  axios.defaults.baseURL = API_BASE_URL;
  console.log('🔗 Axios baseURL configured:', API_BASE_URL);
} else if (process.env.NODE_ENV === 'development') {
  // In development, proxy handles it, so baseURL stays empty
  console.log('🔗 Axios using proxy (development mode)');
} else {
  // Production without REACT_APP_API_URL - this will cause 405 errors
  console.error('❌ CRITICAL ERROR: Axios baseURL not configured in production!');
  console.error('   All API calls will fail. Set REACT_APP_API_URL in Vercel environment variables.');
  console.error('   Expected: REACT_APP_API_URL=https://next-comm-backend.vercel.app');
}

export default axios;

