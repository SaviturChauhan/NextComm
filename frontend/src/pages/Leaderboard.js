import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiUsers, FiMessageSquare } from 'react-icons/fi';
// Removed unused import: FiClock
import apiClient from '../utils/axiosConfig';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('points');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });

  const fetchLeaderboard = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/leaderboard/category/${category}?page=${page}&limit=20`);
      setLeaderboard(response.data.leaderboard);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  const fetchTopUsers = async () => {
    try {
      const response = await apiClient.get('/api/leaderboard/top');
      setTopUsers(response.data);
    } catch (error) {
      console.error('Error fetching top users:', error);
    }
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    fetchLeaderboard(page);
  };

  useEffect(() => {
    fetchLeaderboard(1);
    fetchTopUsers();
  }, [fetchLeaderboard]);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'points': return <FiAward className="h-5 w-5" />;
      case 'questions': return <FiMessageSquare className="h-5 w-5" />;
      case 'answers': return <FiUsers className="h-5 w-5" />;
      case 'reputation': return <FiAward className="h-5 w-5" />;
      default: return <FiAward className="h-5 w-5" />;
    }
  };

  const getCategoryTitle = (cat) => {
    switch (cat) {
      case 'points': return 'Points';
      case 'questions': return 'Questions Asked';
      case 'answers': return 'Answers Given';
      case 'reputation': return 'Reputation';
      default: return 'Points';
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return <span className="text-lg font-bold text-gray-600 dark:text-gray-400">#{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20';
    if (rank === 2) return 'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800';
    if (rank === 3) return 'border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20';
    return 'border-gray-200 dark:border-gray-700';
  };

  const getRankShadow = (rank) => {
    if (rank === 1) return 'shadow-xl shadow-yellow-200/50 dark:shadow-yellow-900/30';
    if (rank === 2) return 'shadow-lg shadow-gray-200/50 dark:shadow-gray-900/30';
    if (rank === 3) return 'shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30';
    return 'shadow-md hover:shadow-lg';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Leaderboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Top students in Wireless Communication
            </p>
          </div>

          {/* Top 3 Users - Podium Style */}
          {topUsers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {topUsers.map((user, index) => {
                const rank = index + 1;
                const isFirst = rank === 1;
                // Podium arrangement: 2nd (left), 1st (center), 3rd (right)
                const orderClass = rank === 1 ? 'md:order-2' : rank === 2 ? 'md:order-1' : 'md:order-3';
                return (
                  <div
                    key={user._id}
                    className={`relative flex flex-col items-center p-8 rounded-2xl border-2 ${getRankColor(rank)} ${getRankShadow(rank)} ${orderClass} ${
                      isFirst ? 'md:scale-110 md:-mt-4' : ''
                    } transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer`}
                  >
                    {/* Medal/Rank Badge */}
                    <div className="absolute -top-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg border-2 border-current">
                      <span className="text-3xl">{getRankIcon(rank)}</span>
                    </div>
                    
                    {/* Avatar with ring effect */}
                    <div className={`relative mt-4 mb-6 ${
                      isFirst ? 'ring-4 ring-yellow-300/50' : rank === 2 ? 'ring-4 ring-gray-300/50' : 'ring-4 ring-orange-300/50'
                    } rounded-full transition-all group-hover:ring-8`}>
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=1193d4&color=fff`}
                        alt={user.username}
                        className={`rounded-full ${
                          isFirst ? 'w-28 h-28' : 'w-24 h-24'
                        }`}
                      />
                    </div>
                    
                    {/* Username - Bolder and better hierarchy */}
                    <Link
                      to={`/profile/${user._id}`}
                      className={`font-extrabold text-gray-900 dark:text-white mb-1 text-center hover:text-primary transition-colors ${
                        isFirst ? 'text-2xl' : 'text-xl'
                      }`}
                    >
                      {user.username}
                    </Link>
                    
                    {/* Points - Lighter and smaller */}
                    <p className={`text-gray-500 dark:text-gray-400 mb-3 font-medium ${
                      isFirst ? 'text-base' : 'text-sm'
                    }`}>
                      {user.points} Points
                    </p>
                    
                    {/* Badges */}
                    {user.badges && user.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                        {user.badges.slice(0, 2).map((badge, badgeIndex) => (
                          <span
                            key={badgeIndex}
                            className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/30"
                          >
                            {badge.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Category Filter - Enhanced Navigation Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { key: 'points', label: 'Points', icon: <FiAward className="h-5 w-5" /> },
                { key: 'questions', label: 'Questions', icon: <FiMessageSquare className="h-5 w-5" /> },
                { key: 'answers', label: 'Answers', icon: <FiUsers className="h-5 w-5" /> },
                { key: 'reputation', label: 'Reputation', icon: <FiAward className="h-5 w-5" /> }
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex-1 min-w-[140px] ${
                    category === cat.key
                      ? 'bg-primary text-white shadow-md shadow-primary/30 scale-105'
                      : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:scale-102'
                  }`}
                >
                  {cat.icon}
                  <span className="text-sm">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {getCategoryIcon(category)}
                Top {getCategoryTitle(category)}
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {getCategoryTitle(category)}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Badges
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {leaderboard.map((user, index) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <span className="text-2xl">
                            {getRankIcon(user.rank)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=1193d4&color=fff`}
                            alt={user.username}
                            className="w-11 h-11 rounded-full mr-3 ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-primary transition-all"
                          />
                          <div>
                            <Link
                              to={`/profile/${user._id}`}
                              className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors hover:underline"
                            >
                              {user.username}
                            </Link>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              {user.points} total points
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          {category === 'points' && user.points}
                          {category === 'questions' && user.questionsAsked}
                          {category === 'answers' && user.answersGiven}
                          {category === 'reputation' && user.reputation}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1.5">
                          {user.badges && user.badges.length > 0 ? (
                            user.badges.slice(0, 3).map((badge, badgeIndex) => (
                              <span
                                key={badgeIndex}
                                className="px-2.5 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/30"
                              >
                                {badge.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">No badges yet</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

