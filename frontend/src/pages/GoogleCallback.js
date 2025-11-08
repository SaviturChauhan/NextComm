import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Google authentication failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    if (success === 'true' && token) {
      // Store token and redirect
      localStorage.setItem('token', token);
      setAuthToken(token);
      toast.success('Successfully signed in with Google!');
      navigate('/dashboard', { replace: true });
    } else {
      toast.error('Authentication failed. Please try again.');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, setAuthToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;







