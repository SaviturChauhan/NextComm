import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/axiosConfig';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (showLoading = true) => {
    if (!isAuthenticated || !token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      const response = await apiClient.get('/api/notifications', {
        params: { limit: 50 }
      });
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [isAuthenticated, token]);

  // Fetch unread count only
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await apiClient.get('/api/notifications/count');
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [isAuthenticated, token]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await apiClient.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await apiClient.put('/api/notifications/read-all');
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await apiClient.delete(`/api/notifications/${notificationId}`);
      const notification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Delete all read notifications
  const deleteAllRead = async () => {
    try {
      await apiClient.delete('/api/notifications/read/all');
      setNotifications(prev => prev.filter(notif => !notif.read));
    } catch (error) {
      console.error('Error deleting read notifications:', error);
    }
  };

  // Start polling for new notifications
  useEffect(() => {
    if (isAuthenticated && token) {
      // Initial fetch
      fetchNotifications(true);

      // Poll for updates every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
        // Silently fetch notifications in background
        fetchNotifications(false);
      }, 30000);

      setPollingInterval(interval);

      return () => {
        clearInterval(interval);
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token, fetchNotifications, fetchUnreadCount]); // pollingInterval is managed internally

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

