import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageSquare, FiClock, FiEye, FiTag, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import CustomSelect from '../components/common/CustomSelect';

const NoAcceptedAnswer = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: 'All Categories',
    difficulty: 'All Levels',
    search: ''
  });

  useEffect(() => {
    fetchQuestions();
  }, [page, filters]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...filters
      };
      const response = await axios.get('/api/unanswered/no-accepted-answer', { params });
      setQuestions(response.data.questions || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Questions Without Accepted Answer
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Questions that have answers but need a definitive solution
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <CustomSelect
                  value={filters.category}
                  onChange={(value) => handleFilterChange('category', value)}
                  options={[
                    'All Categories',
                    'MIMO',
                    'OFDM',
                    '5G',
                    'Signal Processing',
                    'Antennas',
                    'Wireless Networks',
                    'Other'
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <CustomSelect
                  value={filters.difficulty}
                  onChange={(value) => handleFilterChange('difficulty', value)}
                  options={['All Levels', 'beginner', 'intermediate', 'advanced']}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search questions..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Questions List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <FiCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                All questions have accepted answers
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Great! All questions with answers have been resolved.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {questions.map((question) => (
                  <Link
                    key={question._id}
                    to={`/question/${question._id}`}
                    className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors flex-1">
                        {question.title}
                      </h3>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          {question.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <Link
                        to={`/profile/${question.author?._id}`}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <img
                          src={question.author?.avatar || `https://ui-avatars.com/api/?name=${question.author?.username}&background=1193d4&color=fff`}
                          alt={question.author?.username}
                          className="w-5 h-5 rounded-full"
                        />
                        <span>{question.author?.username}</span>
                      </Link>
                      <div className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        <span>{formatDate(question.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiEye className="w-4 h-4" />
                        <span>{question.views || 0} views</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                        <FiMessageSquare className="w-4 h-4" />
                        <span>{question.answerCount || 0} answers (no accepted)</span>
                      </div>
                    </div>

                    {question.tags && question.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {question.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                          >
                            <FiTag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoAcceptedAnswer;






