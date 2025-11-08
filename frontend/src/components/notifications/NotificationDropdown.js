import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  FiBell, 
  FiCheck, 
  FiCheckCircle, 
  FiTrash2, 
  FiX,
  FiMessageSquare,
  FiThumbsUp,
  FiAtSign,
  FiAward
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    fetchNotifications
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_ANSWER':
        return <FiMessageSquare className="w-5 h-5 text-blue-500" />;
      case 'ANSWER_ACCEPTED':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'ANSWER_UPVOTED':
      case 'QUESTION_UPVOTED':
        return <FiThumbsUp className="w-5 h-5 text-purple-500" />;
      case 'MENTIONED':
        return <FiAtSign className="w-5 h-5 text-orange-500" />;
      case 'BADGE_EARNED':
        return <FiAward className="w-5 h-5 text-yellow-500" />;
      default:
        return <FiBell className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    setIsOpen(false);
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
        aria-label="Notifications"
      >
        <FiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({unreadCount} new)
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1 text-gray-500 hover:text-primary transition-colors"
                  title="Mark all as read"
                >
                  <FiCheck className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <FiBell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={notification.link || '#'}
                          onClick={() => handleNotificationClick(notification)}
                          className="block"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {notification.message}
                              </p>
                              {notification.relatedUser && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {notification.relatedUser.username}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true
                                })}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </Link>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.some(n => n.read) && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={deleteAllRead}
                className="w-full text-sm text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors text-center"
              >
                Clear all read notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;




