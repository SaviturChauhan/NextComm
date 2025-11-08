import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBookmark, FiFolderPlus, FiEdit3, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import apiClient from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { renderFormulas } from '../utils/formulaHandler';
import { InlineMath, BlockMath } from 'react-katex';
import hljs from 'highlight.js';

const SavedItems = () => {
  const { isAuthenticated, user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState(null);
  const [filter, setFilter] = useState('all'); // all, questions, answers
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListColor, setNewListColor] = useState('#6366f1');

  const colors = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookmarks();
      fetchLists();
    }
  }, [isAuthenticated, selectedList, filter]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const params = { type: filter !== 'all' ? filter : undefined, listId: selectedList || undefined };
      const response = await apiClient.get('/api/bookmarks', { params });
      setBookmarks(response.data.bookmarks || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const fetchLists = async () => {
    try {
      const response = await apiClient.get('/api/bookmarks/lists');
      setLists(response.data.lists || []);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error('List name is required');
      return;
    }

    try {
      const response = await apiClient.post('/api/bookmarks/lists', {
        name: newListName,
        description: newListDescription,
        color: newListColor
      });
      setLists([...lists, response.data.list]);
      setShowCreateListModal(false);
      setNewListName('');
      setNewListDescription('');
      setNewListColor('#6366f1');
      toast.success('List created successfully');
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error(error.response?.data?.message || 'Failed to create list');
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this list? Bookmarks in this list will be moved to "No List".')) {
      return;
    }

    try {
      await apiClient.delete(`/api/bookmarks/lists/${listId}`);
      setLists(lists.filter(l => l._id !== listId));
      if (selectedList === listId) {
        setSelectedList(null);
      }
      toast.success('List deleted');
      fetchBookmarks();
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Failed to delete list');
    }
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    try {
      await apiClient.delete(`/api/bookmarks/${bookmarkId}`);
      setBookmarks(bookmarks.filter(b => b._id !== bookmarkId));
      toast.success('Bookmark removed');
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      toast.error('Failed to remove bookmark');
    }
  };

  const renderContent = (htmlContent) => {
    if (!htmlContent) return null;
    try {
      return renderFormulas(htmlContent);
    } catch (e) {
      return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please login to view your saved items
          </h2>
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const filteredBookmarks = bookmarks.filter(bookmark => {
    if (selectedList) {
      return bookmark.list?._id === selectedList;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Saved Items
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Your bookmarked questions and answers
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Lists */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Lists
                  </h2>
                  <button
                    onClick={() => setShowCreateListModal(true)}
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Create new list"
                  >
                    <FiFolderPlus className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <button
                    onClick={() => setSelectedList(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedList === null
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    All Items
                  </button>
                  {lists.map((list) => (
                    <div key={list._id} className="flex items-center gap-2 group">
                      <button
                        onClick={() => setSelectedList(list._id)}
                        className={`flex-1 text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          selectedList === list._id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: list.color }}
                        ></div>
                        <span>{list.name}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteList(list._id)}
                        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Filter */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Type
                  </h3>
                  <div className="space-y-1">
                    {['all', 'questions', 'answers'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                          filter === type
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredBookmarks.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <FiBookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No saved items yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start bookmarking questions and answers to find them here
                  </p>
                  <Link
                    to="/dashboard"
                    className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Browse Questions
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookmarks.map((bookmark) => (
                    <div
                      key={bookmark._id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                    >
                      {bookmark.question ? (
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <Link
                              to={`/question/${bookmark.question._id}`}
                              className="flex-1"
                            >
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors mb-2">
                                {bookmark.question.title}
                              </h3>
                            </Link>
                            <button
                              onClick={() => handleDeleteBookmark(bookmark._id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {renderContent(bookmark.question.description)}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>Question</span>
                            {bookmark.list && (
                              <span
                                className="px-2 py-1 rounded text-xs"
                                style={{
                                  backgroundColor: bookmark.list.color + '20',
                                  color: bookmark.list.color
                                }}
                              >
                                {bookmark.list.name}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : bookmark.answer ? (
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <Link
                              to={`/question/${bookmark.answer.question}`}
                              className="flex-1"
                            >
                              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Answer to: {bookmark.answer.question?.title || 'Question'}
                              </h3>
                            </Link>
                            <button
                              onClick={() => handleDeleteBookmark(bookmark._id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-3">
                            {renderContent(bookmark.answer.content)}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>Answer</span>
                            {bookmark.list && (
                              <span
                                className="px-2 py-1 rounded text-xs"
                                style={{
                                  backgroundColor: bookmark.list.color + '20',
                                  color: bookmark.list.color
                                }}
                              >
                                {bookmark.list.name}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create List Modal */}
      {showCreateListModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowCreateListModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create New List
              </h3>
              <button
                onClick={() => setShowCreateListModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  List Name *
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g., Interview Prep"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewListColor(color.value)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        newListColor === color.value
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreateList}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create List
                </button>
                <button
                  onClick={() => setShowCreateListModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedItems;






