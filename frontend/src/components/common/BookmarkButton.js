import React, { useState, useEffect, useCallback } from 'react';
import { FiBookmark } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const BookmarkButton = ({ questionId, answerId, size = 'md', showText = false }) => {
  const { isAuthenticated } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [lists, setLists] = useState([]);

  const checkBookmarkStatus = useCallback(async () => {
    try {
      const response = await axios.get('/api/bookmarks/check', {
        params: { questionId, answerId }
      });
      setIsBookmarked(response.data.isBookmarked);
      if (response.data.bookmark) {
        setBookmarkId(response.data.bookmark._id);
      } else {
        setBookmarkId(response.data.bookmarkId || null);
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  }, [questionId, answerId]);

  const fetchLists = useCallback(async () => {
    try {
      const response = await axios.get('/api/bookmarks/lists');
      setLists(response.data.lists || []);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && (questionId || answerId)) {
      checkBookmarkStatus();
      fetchLists();
    }
  }, [isAuthenticated, questionId, answerId, checkBookmarkStatus, fetchLists]);


  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark items');
      return;
    }

    if (isBookmarked) {
      // Unbookmark
      try {
        setLoading(true);
        await axios.delete(`/api/bookmarks/${bookmarkId}`);
        setIsBookmarked(false);
        setBookmarkId(null);
        toast.success('Removed from bookmarks');
      } catch (error) {
        console.error('Error removing bookmark:', error);
        toast.error('Failed to remove bookmark');
      } finally {
        setLoading(false);
      }
    } else {
      // Show list selection modal or bookmark directly
      if (lists.length > 0) {
        setShowListModal(true);
      } else {
        // Bookmark without list
        await createBookmark(null);
      }
    }
  };

  const createBookmark = async (listId) => {
    try {
      setLoading(true);
      
      // Only send fields that are defined
      const payload = {};
      if (questionId) payload.questionId = questionId;
      if (answerId) payload.answerId = answerId;
      if (listId) payload.listId = listId;
      
      const response = await axios.post('/api/bookmarks', payload);
      const bookmark = response.data.bookmark || response.data;
      setIsBookmarked(true);
      setBookmarkId(bookmark._id || bookmark.id);
      setShowListModal(false);
      toast.success(response.data.message || 'Saved to bookmarks');
    } catch (error) {
      console.error('Error creating bookmark:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Failed to bookmark';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleListSelect = async (listId) => {
    await createBookmark(listId);
  };

  if (!isAuthenticated) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Default to md if invalid size
  const buttonSize = sizeClasses[size] || sizeClasses.md;
  const iconSize = iconSizes[size] || iconSizes.md;

  return (
    <>
      <button
        onClick={handleBookmark}
        disabled={loading}
        className={`
          ${buttonSize} 
          flex items-center justify-center 
          rounded-lg 
          ${isBookmarked 
            ? 'bg-primary text-white hover:bg-primary/90' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }
          transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${showText ? 'px-4 gap-2' : ''}
        `}
        title={isBookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
      >
        <FiBookmark 
          className={`${iconSize} ${isBookmarked ? 'fill-current' : ''}`}
        />
        {showText && (
          <span className="text-sm font-medium">
            {isBookmarked ? 'Saved' : 'Save'}
          </span>
        )}
      </button>

      {/* List Selection Modal */}
      {showListModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowListModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Save to List
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <button
                onClick={() => handleListSelect(null)}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600"></div>
                  <span className="text-gray-700 dark:text-gray-300">No List (Default)</span>
                </div>
              </button>
              {lists.map((list) => (
                <button
                  key={list._id}
                  onClick={() => handleListSelect(list._id)}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: list.color }}
                    ></div>
                    <span className="text-gray-700 dark:text-gray-300">{list.name}</span>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowListModal(false)}
              className="mt-4 w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BookmarkButton;

