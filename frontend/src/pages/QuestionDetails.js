import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  FiThumbsUp, 
  FiThumbsDown, 
  FiMessageSquare, 
  FiEye, 
  FiClock, 
  FiCheck, 
  FiEdit3,
  FiTrash2,
  FiArrowLeft
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const QuestionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [voting, setVoting] = useState({});

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/questions/${id}`);
      setQuestion(response.data);
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error('Failed to load question');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type, targetId, targetType) => {
    if (!isAuthenticated) {
      toast.error('Please log in to vote');
      return;
    }

    try {
      setVoting(prev => ({ ...prev, [targetId]: true }));
      
      const response = await axios.post(`/api/${targetType}/${targetId}/vote`, {
        voteType: type
      });

      // Update the question or answer with new vote counts
      if (targetType === 'questions') {
        setQuestion(prev => ({
          ...prev,
          votes: {
            ...prev.votes,
            upvotes: response.data.upvotes,
            downvotes: response.data.downvotes
          }
        }));
      } else {
        setQuestion(prev => ({
          ...prev,
          answers: prev.answers.map(answer => 
            answer._id === targetId 
              ? { ...answer, votes: response.data }
              : answer
          )
        }));
      }

      toast.success('Vote recorded');
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    } finally {
      setVoting(prev => ({ ...prev, [targetId]: false }));
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to answer');
      return;
    }

    if (!answerContent.trim()) {
      toast.error('Please enter an answer');
      return;
    }

    try {
      setSubmittingAnswer(true);
      
      const response = await axios.post('/api/answers', {
        content: answerContent,
        questionId: id
      });

      // Add the new answer to the question
      setQuestion(prev => ({
        ...prev,
        answers: [...prev.answers, response.data]
      }));

      setAnswerContent('');
      toast.success('Answer posted successfully');
    } catch (error) {
      console.error('Error posting answer:', error);
      toast.error('Failed to post answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    if (!isAuthenticated || question.author._id !== user?.id) {
      toast.error('Only the question author can accept answers');
      return;
    }

    try {
      await axios.post(`/api/answers/${answerId}/accept`);
      
      // Update the question to mark the answer as accepted
      setQuestion(prev => ({
        ...prev,
        acceptedAnswer: answerId,
        isSolved: true,
        answers: prev.answers.map(answer => ({
          ...answer,
          isAccepted: answer._id === answerId
        }))
      }));

      toast.success('Answer accepted');
    } catch (error) {
      console.error('Error accepting answer:', error);
      toast.error('Failed to accept answer');
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

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Question not found
          </h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Questions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors mb-6"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Questions
          </button>

          {/* Question */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                  <FiMessageSquare className="h-6 w-6 text-primary" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {question.title}
                  </h1>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {question.category}
                    </span>
                  </div>
                </div>

                <div 
                  className="prose dark:prose-invert max-w-none mb-4"
                  dangerouslySetInnerHTML={{ __html: question.description }}
                />

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={question.author?.avatar || `https://ui-avatars.com/api/?name=${question.author?.username}&background=1193d4&color=fff`}
                      alt={question.author?.username}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{question.author?.username}</span>
                  </div>
                  
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
                    <span>{question.answers?.length || 0} answers</span>
                  </div>
                </div>

                {question.tags && question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Voting */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleVote('upvote', question._id, 'questions')}
                    disabled={voting[question._id]}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-primary/10 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                  >
                    <FiThumbsUp className="h-4 w-4" />
                    <span>{question.votes?.upvotes || 0}</span>
                  </button>
                  
                  <button
                    onClick={() => handleVote('downvote', question._id, 'questions')}
                    disabled={voting[question._id]}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-primary/10 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                  >
                    <FiThumbsDown className="h-4 w-4" />
                    <span>{question.votes?.downvotes || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Answers */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Answers ({question.answers?.length || 0})
            </h2>
            
            <div className="space-y-6">
              {question.answers?.map((answer) => (
                <div
                  key={answer._id}
                  className={`p-6 rounded-lg border ${
                    answer.isAccepted 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  {answer.isAccepted && (
                    <div className="flex items-center gap-2 mb-4">
                      <FiCheck className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        Accepted Answer
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <img
                      src={answer.author?.avatar || `https://ui-avatars.com/api/?name=${answer.author?.username}&background=1193d4&color=fff`}
                      alt={answer.author?.username}
                      className="w-10 h-10 rounded-full"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {answer.author?.username}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(answer.createdAt)}
                        </span>
                        {answer.isEdited && (
                          <span className="text-xs text-gray-400">(edited)</span>
                        )}
                      </div>
                      
                      <div 
                        className="prose dark:prose-invert max-w-none mb-4"
                        dangerouslySetInnerHTML={{ __html: answer.content }}
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleVote('upvote', answer._id, 'answers')}
                            disabled={voting[answer._id]}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-primary/10 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                          >
                            <FiThumbsUp className="h-4 w-4" />
                            <span>{answer.votes?.upvotes || 0}</span>
                          </button>
                          
                          <button
                            onClick={() => handleVote('downvote', answer._id, 'answers')}
                            disabled={voting[answer._id]}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-primary/10 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                          >
                            <FiThumbsDown className="h-4 w-4" />
                            <span>{answer.votes?.downvotes || 0}</span>
                          </button>
                        </div>
                        
                        {isAuthenticated && question.author._id === user?.id && !question.isSolved && (
                          <button
                            onClick={() => handleAcceptAnswer(answer._id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                          >
                            Accept Answer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Answer Form */}
          {isAuthenticated && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Answer
              </h3>
              
              <form onSubmit={handleSubmitAnswer}>
                <div className="mb-4">
                  <ReactQuill
                    value={answerContent}
                    onChange={setAnswerContent}
                    placeholder="Write your answer here..."
                    style={{ minHeight: '150px' }}
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingAnswer || !answerContent.trim()}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingAnswer ? 'Posting...' : 'Post Answer'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDetails;


