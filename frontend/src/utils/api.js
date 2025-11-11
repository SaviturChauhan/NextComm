// API configuration utility
// Gets the backend API URL from environment or uses current origin in production

const getBackendUrl = () => {
  // In production, use REACT_APP_API_URL if set
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/$/, ''); // Remove trailing slash
  }
  
  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5001';
  }
  
  // In production without REACT_APP_API_URL, try to infer from current origin
  // This is a fallback - REACT_APP_API_URL should always be set in production
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // If frontend is on Vercel, try to construct backend URL
    // This is a fallback - you should set REACT_APP_API_URL explicitly
    console.warn('⚠️ REACT_APP_API_URL not set. Using fallback URL detection.');
    return origin.replace(/^https?:\/\/([^.]+)/, (match, subdomain) => {
      // Try to construct backend URL (this is a guess - set REACT_APP_API_URL explicitly)
      return origin; // For now, return same origin (won't work for separate deployments)
    });
  }
  
  // Final fallback
  return 'http://localhost:5001';
};

export const API_BASE_URL = getBackendUrl();

// Configure axios base URL for production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Only set baseURL if REACT_APP_API_URL is explicitly set
  if (process.env.REACT_APP_API_URL) {
    const axios = require('axios').default;
    axios.defaults.baseURL = API_BASE_URL;
  }
}

export default API_BASE_URL;

