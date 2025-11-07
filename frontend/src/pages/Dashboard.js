import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiPlus, FiClock, FiMessageSquare, FiEye, FiThumbsUp } from 'react-icons/fi';
import axios from 'axios';
import CustomSelect from '../components/common/CustomSelect';

const Dashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [questionType, setQuestionType] = useState('all'); // all, unanswered, noAccepted
  const [filters, setFilters] = useState({
    sortBy: 'newest',
    category: 'all',
    difficulty: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchQuestions(1);
  }, [questionType, filters, searchQuery]);

  const fetchQuestions = async (page = 1) => {
    try {
      setLoading(true);
      let response;
      
      if (questionType === 'unanswered') {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10'
        });
        if (searchQuery) params.append('search', searchQuery);
        if (filters.category !== 'all' && filters.category !== 'All Categories') params.append('category', filters.category);
        if (filters.difficulty !== 'all' && filters.difficulty !== 'All Levels') params.append('difficulty', filters.difficulty);
        response = await axios.get(`/api/unanswered/unanswered?${params}`);
      } else if (questionType === 'noAccepted') {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10'
        });
        if (searchQuery) params.append('search', searchQuery);
        if (filters.category !== 'all' && filters.category !== 'All Categories') params.append('category', filters.category);
        if (filters.difficulty !== 'all' && filters.difficulty !== 'All Levels') params.append('difficulty', filters.difficulty);
        response = await axios.get(`/api/unanswered/no-accepted-answer?${params}`);
      } else {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          sortBy: filters.sortBy
        });
        if (searchQuery) params.append('search', searchQuery);
        if (filters.category !== 'all') params.append('category', filters.category);
        if (filters.difficulty !== 'all') params.append('difficulty', filters.difficulty);
        response = await axios.get(`/api/questions?${params}`);
      }
      
      setQuestions(response.data.questions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    fetchQuestions(1);
  };

  const handlePageChange = (page) => {
    fetchQuestions(page);
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Questions
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Find answers to wireless communication questions
              </p>
            </div>
            <Link
              to="/ask"
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <FiPlus className="h-4 w-4" />
              Ask Question
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </form>

            <div className="flex flex-wrap gap-4">
              {questionType === 'all' && (
                <div className="flex items-center gap-2">
                  <FiFilter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
                  <div className="w-40">
                    <CustomSelect
                      value={filters.sortBy}
                      onChange={(value) => handleFilterChange('sortBy', value)}
                      options={[
                        { value: 'newest', label: 'Newest' },
                        { value: 'oldest', label: 'Oldest' },
                        { value: 'mostVoted', label: 'Most Voted' },
                        { value: 'mostAnswered', label: 'Most Answered' }
                      ]}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</span>
                <div className="w-56">
                  <CustomSelect
                    value={filters.category === 'all' ? 'All Categories' : filters.category}
                    onChange={(value) => handleFilterChange('category', value === 'All Categories' ? 'all' : value)}
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
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty:</span>
                <div className="w-40">
                  <CustomSelect
                    value={filters.difficulty === 'all' ? 'All Levels' : filters.difficulty}
                    onChange={(value) => handleFilterChange('difficulty', value === 'All Levels' ? 'all' : value)}
                    options={['All Levels', 'beginner', 'intermediate', 'advanced']}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Question Type Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setQuestionType('all');
                  setPagination({ ...pagination, currentPage: 1 });
                }}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  questionType === 'all'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                All Questions
              </button>
              <button
                onClick={() => {
                  setQuestionType('unanswered');
                  setPagination({ ...pagination, currentPage: 1 });
                }}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  questionType === 'unanswered'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Unanswered
              </button>
              <button
                onClick={() => {
                  setQuestionType('noAccepted');
                  setPagination({ ...pagination, currentPage: 1 });
                }}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  questionType === 'noAccepted'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Needs Answer
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No questions found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                  {searchQuery ? 'Try adjusting your search terms' : 'Be the first to ask a question!'}
                </p>
                {!searchQuery && (
                  <div className="mt-6">
                    <Link
                      to="/ask"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <FiPlus className="h-4 w-4" />
                      Ask Question
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              questions.map((question) => (
                <div
                  key={question._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                        <FiMessageSquare className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            to={`/question/${question._id}`}
                            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-2"
                          >
                            {question.title}
                          </Link>
                          
                          <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">
                            {question.description}
                          </p>
                          
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-300">
                            <Link 
                              to={`/profile/${question.author?._id}`}
                              className="flex items-center gap-1 hover:text-primary transition-colors"
                            >
                              <img
                                src={question.author?.avatar || `https://ui-avatars.com/api/?name=${question.author?.username}&background=1193d4&color=fff`}
                                alt={question.author?.username}
                                className="w-5 h-5 rounded-full"
                              />
                              <span className="hover:underline">{question.author?.username}</span>
                            </Link>
                            
                            <div className="flex items-center gap-1">
                              <FiClock className="h-4 w-4" />
                              <span>{formatDate(question.createdAt)}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <FiEye className="h-4 w-4" />
                              <span>{question.views} views</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <FiMessageSquare className="h-4 w-4" />
                              <span>{question.answerCount || question.answers?.length || 0} answers</span>
                              {questionType === 'noAccepted' && question.answerCount > 0 && (
                                <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400">(no accepted)</span>
                              )}
                              {questionType === 'unanswered' && (
                                <span className="ml-1 text-xs text-orange-600 dark:text-orange-400">(unanswered)</span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <FiThumbsUp className="h-4 w-4" />
                              <span>{question.votes?.upvotes || 0}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty}
                          </span>
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            {question.category}
                          </span>
                        </div>
                      </div>
                      
                      {question.tags && question.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {question.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-300 text-xs font-medium rounded-full border border-primary/20 dark:border-primary/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default Dashboard;


