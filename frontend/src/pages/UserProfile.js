import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMessageSquare, FiClock, FiThumbsUp, FiCheck, FiEdit3, FiTrash2, FiBookmark, FiSave, FiX, FiCamera } from 'react-icons/fi';
import apiClient from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import BadgeModal from '../components/common/BadgeModal';
import AvatarEditor from '../components/common/AvatarEditor';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [recentAnswers, setRecentAnswers] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('questions');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
  const isOwnProfile = currentUser && (currentUser._id === id || currentUser.id === id);

  useEffect(() => {
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // fetchProfile is defined inside component, disabling exhaustive-deps

  useEffect(() => {
    if (isOwnProfile) {
      fetchBookmarks();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwnProfile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/users/${id}`);
      setProfile(response.data.user);
      setRecentQuestions(response.data.recentQuestions);
      setRecentAnswers(response.data.recentAnswers);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const response = await apiClient.get('/api/bookmarks');
      setBookmarks(response.data.bookmarks || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const handleEditUsername = () => {
    setEditedUsername(profile.username);
    setIsEditingUsername(true);
  };

  const handleCancelEditUsername = () => {
    setIsEditingUsername(false);
    setEditedUsername('');
  };

  const handleSaveUsername = async () => {
    if (!editedUsername.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    if (editedUsername.trim() === profile.username) {
      setIsEditingUsername(false);
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(editedUsername.trim())) {
      toast.error('Username can only contain letters, numbers, and underscores');
      return;
    }

    if (editedUsername.trim().length < 3 || editedUsername.trim().length > 30) {
      toast.error('Username must be between 3 and 30 characters');
      return;
    }

    try {
      setSavingUsername(true);
      const response = await apiClient.put('/api/auth/profile', {
        username: editedUsername.trim()
      });

      // Update profile state
      setProfile(prev => ({
        ...prev,
        username: response.data.username
      }));

      // Update current user in auth context if it's the same user
      if (currentUser && (currentUser._id === id || currentUser.id === id)) {
        // The auth context will be updated on next refresh, but we can trigger a refetch
        window.location.reload(); // Simple way to refresh user data
      }

      setIsEditingUsername(false);
      toast.success('Username updated successfully!');
    } catch (error) {
      console.error('Error updating username:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Failed to update username';
      toast.error(errorMessage);
    } finally {
      setSavingUsername(false);
    }
  };

  const handleAvatarSave = (newAvatar) => {
    setProfile(prev => ({
      ...prev,
      avatar: newAvatar
    }));
    // Refresh the page to update avatar everywhere
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getNextBadgePoints = (currentPoints) => {
    const thresholds = [100, 250, 500, 1000, 1500, 2000, 3000, 5000];
    const nextThreshold = thresholds.find(threshold => threshold > currentPoints);
    return nextThreshold || 5000;
  };

  const getProgressPercentage = (currentPoints, nextThreshold) => {
    const previousThreshold = nextThreshold === 100 ? 0 : 
      [100, 250, 500, 1000, 1500, 2000, 3000].find(t => t < nextThreshold) || 0;
    return Math.min(((currentPoints - previousThreshold) / (nextThreshold - previousThreshold)) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            User not found
          </h2>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const nextBadgePoints = getNextBadgePoints(profile.points);
  const progressPercentage = getProgressPercentage(profile.points, nextBadgePoints);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative group">
                <img
                  src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&background=1193d4&color=fff`}
                  alt={profile.username}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-md object-cover"
                />
                {isOwnProfile && (
                  <button
                    onClick={() => setIsAvatarEditorOpen(true)}
                    className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                    title="Change profile photo"
                  >
                    <FiCamera className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  {isEditingUsername ? (
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                      <input
                        type="text"
                        value={editedUsername}
                        onChange={(e) => setEditedUsername(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveUsername();
                          } else if (e.key === 'Escape') {
                            handleCancelEditUsername();
                          }
                        }}
                        className="flex-1 px-3 py-2 text-3xl font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                        disabled={savingUsername}
                      />
                      <button
                        onClick={handleSaveUsername}
                        disabled={savingUsername}
                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Save username"
                      >
                        <FiSave className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleCancelEditUsername}
                        disabled={savingUsername}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Cancel"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {profile.username}
                      </h1>
                      {isOwnProfile && (
                        <button
                          onClick={handleEditUsername}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit username"
                        >
                          <FiEdit3 className="w-5 h-5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {profile.bio || 'Wireless Communication Enthusiast'}
                </p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Last active {formatDate(profile.lastActive)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-primary mb-2">
                {profile.points}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Points
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-primary mb-2">
                {profile.badges?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Badges
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-primary mb-2">
                {profile.answersGiven || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Questions Answered
              </div>
            </div>
          </div>

          {/* Progress to Next Badge */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progress to Next Badge
              </span>
              <span className="text-sm font-medium text-primary">
                {profile.points} / {nextBadgePoints}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {nextBadgePoints - profile.points} more points needed for the next badge
            </p>
          </div>

          {/* Badges */}
          {profile.badges && profile.badges.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Badges
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.badges.map((badge, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedBadge(badge);
                      setIsBadgeModalOpen(true);
                    }}
                    className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                      {(() => {
                        const lowerName = badge.name.toLowerCase();
                        if (lowerName.includes('beginner')) return '🌱';
                        if (lowerName.includes('contributor')) return '📝';
                        if (lowerName.includes('scholar')) return '📚';
                        if (lowerName.includes('expert')) return '⭐';
                        if (lowerName.includes('master')) return '🏆';
                        if (lowerName.includes('legend')) return '👑';
                        if (lowerName.includes('elite')) return '💎';
                        if (lowerName.includes('guru')) return '🧙';
                        return '🎖️';
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {badge.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {badge.description}
                      </div>
                      {badge.earnedAt && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Earned {new Date(badge.earnedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'questions'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Questions ({recentQuestions.length})
                </button>
                <button
                  onClick={() => setActiveTab('answers')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'answers'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Answers ({recentAnswers.length})
                </button>
                {isOwnProfile && (
                  <button
                    onClick={() => setActiveTab('saved')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'saved'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <FiBookmark className="w-4 h-4" />
                      Saved ({bookmarks.length})
                    </span>
                  </button>
                )}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'saved' ? (
                <div className="space-y-4">
                  {bookmarks.length === 0 ? (
                    <div className="text-center py-8">
                      <FiBookmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No saved items yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Start bookmarking questions and answers to find them here
                      </p>
                      <Link
                        to="/dashboard"
                        className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Browse Questions
                      </Link>
                    </div>
                  ) : (
                    bookmarks.map((bookmark) => (
                      <div
                        key={bookmark._id}
                        className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        {bookmark.question ? (
                          <div>
                            <Link
                              to={`/question/${bookmark.question._id}`}
                              className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-2"
                            >
                              {bookmark.question.title}
                            </Link>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Question • {formatDate(bookmark.createdAt)}
                            </div>
                          </div>
                        ) : bookmark.answer ? (
                          <div>
                            <Link
                              to={`/question/${bookmark.answer.question?._id || bookmark.answer.question || 'unknown'}`}
                              className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-2"
                            >
                              Answer to: {bookmark.answer.question?.title || 'Question'}
                            </Link>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                              {bookmark.answer.content ? (
                                typeof bookmark.answer.content === 'string' ? (
                                  <span dangerouslySetInnerHTML={{ __html: bookmark.answer.content.substring(0, 100) + '...' }} />
                                ) : (
                                  bookmark.answer.content
                                )
                              ) : 'No preview available'}
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Answer • {formatDate(bookmark.createdAt)}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              ) : activeTab === 'questions' ? (
                <div className="space-y-4">
                  {recentQuestions.length === 0 ? (
                    <div className="text-center py-8">
                      <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No questions yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        This user hasn't asked any questions yet.
                      </p>
                    </div>
                  ) : (
                    recentQuestions.map((question) => (
                      <div
                        key={question._id}
                        className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FiMessageSquare className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/question/${question._id}`}
                            className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-2"
                          >
                            {question.title}
                          </Link>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <FiClock className="h-3 w-3" />
                              {formatDate(question.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiThumbsUp className="h-3 w-3" />
                              {question.votes?.upvotes || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiMessageSquare className="h-3 w-3" />
                              {question.answers?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAnswers.length === 0 ? (
                    <div className="text-center py-8">
                      <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No answers yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        This user hasn't answered any questions yet.
                      </p>
                    </div>
                  ) : (
                    recentAnswers.map((answer) => (
                      <div
                        key={answer._id}
                        className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                            <FiCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/question/${answer.question._id}`}
                            className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-2"
                          >
                            {answer.question.title}
                          </Link>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <FiClock className="h-3 w-3" />
                              {formatDate(answer.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiThumbsUp className="h-3 w-3" />
                              {answer.votes?.upvotes || 0}
                            </span>
                            {answer.isAccepted && (
                              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <FiCheck className="h-3 w-3" />
                                Accepted
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Badge Modal */}
      <BadgeModal
        badge={selectedBadge}
        isOpen={isBadgeModalOpen}
        onClose={() => {
          setIsBadgeModalOpen(false);
          setSelectedBadge(null);
        }}
        userName={profile.username}
      />

      {/* Avatar Editor Modal */}
      {isOwnProfile && profile && (
        <AvatarEditor
          isOpen={isAvatarEditorOpen}
          onClose={() => setIsAvatarEditorOpen(false)}
          currentAvatar={profile.avatar}
          onSave={handleAvatarSave}
          userId={profile._id || profile.id}
          username={profile.username}
        />
      )}
    </div>
  );
};

export default UserProfile;


