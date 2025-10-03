import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMessageSquare, FiClock, FiThumbsUp, FiCheck, FiEdit3, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';

const UserProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [recentAnswers, setRecentAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('questions');

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/${id}`);
      setProfile(response.data.user);
      setRecentQuestions(response.data.recentQuestions);
      setRecentAnswers(response.data.recentAnswers);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
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
              <img
                src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&background=1193d4&color=fff`}
                alt={profile.username}
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-md"
              />
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {profile.username}
                </h1>
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
                    className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">🏆</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {badge.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {badge.description}
                      </div>
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
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'questions' ? (
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
    </div>
  );
};

export default UserProfile;


