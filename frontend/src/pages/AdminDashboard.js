import React, { useState, useEffect } from 'react';
import { FiUsers, FiMessageSquare, FiCheckCircle, FiTrash2, FiShield, FiX, FiCheck, FiBarChart2 } from 'react-icons/fi';
// Removed unused imports: FiEdit2, FiSettings
import apiClient from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPagination, setUserPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [questionPagination, setQuestionPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [answerPagination, setAnswerPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [deleteModal, setDeleteModal] = useState({ show: false, type: '', id: '', title: '' });
  const [roleChangeModal, setRoleChangeModal] = useState({ show: false, user: null, newRole: '' });

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'questions') {
      fetchQuestions();
    } else if (activeTab === 'answers') {
      fetchAnswers();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch statistics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/admin/users?page=${page}&limit=20`);
      setUsers(response.data.users);
      setUserPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (page = 1) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/admin/questions?page=${page}&limit=20`);
      setQuestions(response.data.questions);
      setQuestionPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch questions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/admin/answers?page=${page}&limit=20`);
      setAnswers(response.data.answers);
      setAnswerPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch answers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await apiClient.delete(`/api/admin/users/${deleteModal.id}`);
      toast.success('User deleted successfully');
      setDeleteModal({ show: false, type: '', id: '', title: '' });
      fetchUsers(userPagination.currentPage);
      if (activeTab === 'stats') fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      await apiClient.delete(`/api/admin/questions/${deleteModal.id}`);
      toast.success('Question deleted successfully');
      setDeleteModal({ show: false, type: '', id: '', title: '' });
      fetchQuestions(questionPagination.currentPage);
      if (activeTab === 'stats') fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete question');
    }
  };

  const handleDeleteAnswer = async () => {
    try {
      await apiClient.delete(`/api/admin/answers/${deleteModal.id}`);
      toast.success('Answer deleted successfully');
      setDeleteModal({ show: false, type: '', id: '', title: '' });
      fetchAnswers(answerPagination.currentPage);
      if (activeTab === 'stats') fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete answer');
    }
  };

  const handleDelete = () => {
    if (deleteModal.type === 'user') {
      handleDeleteUser();
    } else if (deleteModal.type === 'question') {
      handleDeleteQuestion();
    } else if (deleteModal.type === 'answer') {
      handleDeleteAnswer();
    }
  };

  const handleRoleChange = async () => {
    try {
      await apiClient.put(`/api/admin/users/${roleChangeModal.user._id}/role`, {
        role: roleChangeModal.newRole
      });
      toast.success(`User role changed to ${roleChangeModal.newRole}`);
      setRoleChangeModal({ show: false, user: null, newRole: '' });
      fetchUsers(userPagination.currentPage);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change user role');
    }
  };

  const handleAcceptAnswer = async (answerId, isAccepted) => {
    try {
      await apiClient.post(`/api/admin/answers/${answerId}/accept`, { isAccepted });
      toast.success(`Answer ${isAccepted ? 'accepted' : 'unaccepted'} successfully`);
      fetchAnswers(answerPagination.currentPage);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update answer');
    }
  };

  const tabs = [
    { id: 'stats', label: 'Statistics', icon: FiBarChart2 },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'questions', label: 'Questions', icon: FiMessageSquare },
    { id: 'answers', label: 'Answers', icon: FiCheckCircle }
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, questions, and answers
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {loading && activeTab !== 'stats' ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Statistics Tab */}
            {activeTab === 'stats' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalUsers}</p>
                    </div>
                    <FiUsers className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    {stats.newUsersThisWeek} new this week
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Questions</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalQuestions}</p>
                    </div>
                    <FiMessageSquare className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    {stats.newQuestionsThisWeek} new this week
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Answers</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalAnswers}</p>
                    </div>
                    <FiCheckCircle className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    {stats.newAnswersThisWeek} new this week
                  </p>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Points</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.avatar ? (
                                <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.username} />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                                  {user.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'ADMIN' 
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.points || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setRoleChangeModal({
                                  show: true,
                                  user,
                                  newRole: user.role === 'ADMIN' ? 'USER' : 'ADMIN'
                                })}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Change Role"
                              >
                                <FiShield className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setDeleteModal({
                                  show: true,
                                  type: 'user',
                                  id: user._id,
                                  title: `Delete user ${user.username}?`
                                })}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete User"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {userPagination.totalPages > 1 && (
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => fetchUsers(userPagination.currentPage - 1)}
                      disabled={!userPagination.hasPrev}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Page {userPagination.currentPage} of {userPagination.totalPages}
                    </span>
                    <button
                      onClick={() => fetchUsers(userPagination.currentPage + 1)}
                      disabled={!userPagination.hasNext}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Questions Tab */}
            {activeTab === 'questions' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Author</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Answers</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {questions.map((question) => (
                        <tr key={question._id}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white max-w-md truncate">{question.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {question.author?.username || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{question.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{question.answers?.length || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(question.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => setDeleteModal({
                                show: true,
                                type: 'question',
                                id: question._id,
                                title: `Delete question "${question.title}"?`
                              })}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete Question"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {questionPagination.totalPages > 1 && (
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => fetchQuestions(questionPagination.currentPage - 1)}
                      disabled={!questionPagination.hasPrev}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Page {questionPagination.currentPage} of {questionPagination.totalPages}
                    </span>
                    <button
                      onClick={() => fetchQuestions(questionPagination.currentPage + 1)}
                      disabled={!questionPagination.hasNext}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Answers Tab */}
            {activeTab === 'answers' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Answer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Author</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Question</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {answers.map((answer) => (
                        <tr key={answer._id}>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white max-w-md truncate" dangerouslySetInnerHTML={{ __html: answer.content.substring(0, 100) + '...' }} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {answer.author?.username || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {answer.question?.title || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {answer.isAccepted ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Accepted
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(answer.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptAnswer(answer._id, !answer.isAccepted)}
                                className={`${answer.isAccepted ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'} dark:text-green-400 dark:hover:text-green-300`}
                                title={answer.isAccepted ? 'Unaccept Answer' : 'Accept Answer'}
                              >
                                {answer.isAccepted ? <FiX className="w-5 h-5" /> : <FiCheck className="w-5 h-5" />}
                              </button>
                              <button
                                onClick={() => setDeleteModal({
                                  show: true,
                                  type: 'answer',
                                  id: answer._id,
                                  title: 'Delete this answer?'
                                })}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete Answer"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {answerPagination.totalPages > 1 && (
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => fetchAnswers(answerPagination.currentPage - 1)}
                      disabled={!answerPagination.hasPrev}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Page {answerPagination.currentPage} of {answerPagination.totalPages}
                    </span>
                    <button
                      onClick={() => fetchAnswers(answerPagination.currentPage + 1)}
                      disabled={!answerPagination.hasNext}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.show}
        title={deleteModal.title}
        message="This action cannot be undone."
        onConfirm={handleDelete}
        onClose={() => setDeleteModal({ show: false, type: '', id: '', title: '' })}
        confirmText="Delete"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
      />

      {/* Role Change Modal */}
      {roleChangeModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Change User Role
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Change {roleChangeModal.user?.username}'s role to {roleChangeModal.newRole}?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRoleChangeModal({ show: false, user: null, newRole: '' })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleChange}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

