import React, { useState, useEffect } from 'react';
import { FiAward, FiUsers, FiMessageSquare, FiClock } from 'react-icons/fi';
import axios from 'axios';

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

  useEffect(() => {
    fetchLeaderboard();
    fetchTopUsers();
  }, [category]);

  const fetchLeaderboard = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/leaderboard/category/${category}?page=${page}&limit=20`);
      setLeaderboard(response.data.leaderboard);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopUsers = async () => {
    try {
      const response = await axios.get('/api/leaderboard/top');
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
    if (rank === 1) return <FiAward className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <FiAward className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <FiAward className="h-6 w-6 text-orange-500" />;
    return <span className="text-lg font-bold text-gray-600 dark:text-gray-400">#{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    if (rank === 2) return 'border-gray-400 bg-gray-50 dark:bg-gray-800';
    if (rank === 3) return 'border-orange-400 bg-orange-50 dark:bg-orange-900/20';
    return 'border-gray-200 dark:border-gray-700';
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

          {/* Top 3 Users */}
          {topUsers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {topUsers.map((user, index) => {
                const rank = index + 1;
                const isFirst = rank === 1;
                return (
                  <div
                    key={user._id}
                    className={`flex flex-col items-center p-6 rounded-xl border-2 ${getRankColor(rank)} ${
                      isFirst ? 'order-first md:order-none' : ''
                    }`}
                  >
                    <div className="relative mb-4">
                      {getRankIcon(rank)}
                      <div className="absolute -top-2 -right-2 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {rank}
                      </div>
                    </div>
                    
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=1193d4&color=fff`}
                      alt={user.username}
                      className={`rounded-full mb-4 ${
                        isFirst ? 'w-24 h-24' : 'w-20 h-20'
                      }`}
                    />
                    
                    <h3 className={`font-bold text-gray-800 dark:text-white mb-2 ${
                      isFirst ? 'text-2xl' : 'text-xl'
                    }`}>
                      {user.username}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {user.points} Points
                    </p>
                    
                    {user.badges && user.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {user.badges.slice(0, 2).map((badge, badgeIndex) => (
                          <span
                            key={badgeIndex}
                            className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full"
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

          {/* Category Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex flex-wrap gap-4">
              {[
                { key: 'points', label: 'Points', icon: <FiAward className="h-4 w-4" /> },
                { key: 'questions', label: 'Questions', icon: <FiMessageSquare className="h-4 w-4" /> },
                { key: 'answers', label: 'Answers', icon: <FiUsers className="h-4 w-4" /> },
                { key: 'reputation', label: 'Reputation', icon: <FiAward className="h-4 w-4" /> }
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    category === cat.key
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat.icon}
                  {cat.label}
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
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRankIcon(user.rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=1193d4&color=fff`}
                            alt={user.username}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.points} total points
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {category === 'points' && user.points}
                          {category === 'questions' && user.questionsAsked}
                          {category === 'answers' && user.answersGiven}
                          {category === 'reputation' && user.reputation}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {user.badges && user.badges.length > 0 ? (
                            user.badges.slice(0, 3).map((badge, badgeIndex) => (
                              <span
                                key={badgeIndex}
                                className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full"
                              >
                                {badge.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">No badges yet</span>
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

