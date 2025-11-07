import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactQuill, { Quill } from 'react-quill';
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
import { preserveFormulasOnPaste, renderFormulas } from '../utils/formulaHandler';
import { InlineMath, BlockMath } from 'react-katex';
import ConfirmModal from '../components/common/ConfirmModal';

// Question Details Component - View and interact with questions
const QuestionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [voting, setVoting] = useState({});
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    confirmButtonColor: 'bg-red-500 hover:bg-red-600'
  });

  // ReactQuill configuration with custom paste handler
  const quillModules = React.useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      // Custom paste handler to preserve LaTeX formulas
      matchVisual: false,
    }
  }), []);

  // Custom paste handler ref
  const quillRef = useRef(null);

  // Setup paste handler after Quill is initialized
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      
      // Custom paste handler to preserve LaTeX formulas
      quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
        const text = node.data;
        
        // If text contains LaTeX formulas, preserve them
        if (text && text.includes('$')) {
          // Keep the text as-is, ReactQuill will preserve it
          // We'll render formulas when displaying content
          return delta;
        }
        
        return delta;
      });
      
      // Also handle HTML paste
      quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
        if (node.tagName === 'P' || node.tagName === 'DIV') {
          const text = node.textContent || '';
          if (text.includes('$')) {
            // Preserve formulas in HTML
            return delta;
          }
        }
        return delta;
      });
    }
  }, []);

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'blockquote', 'code-block',
    'link', 'image'
  ];

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
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load question';
      toast.error(errorMessage);
      // Only navigate if it's a 404, otherwise stay on page to show error
      if (error.response?.status === 404) {
        navigate('/dashboard');
      }
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
      
      // Determine if we should remove the vote (user clicked same button again)
      let currentVote = null;
      if (targetType === 'questions') {
        currentVote = question.votes?.voters?.find(v => v.user === user?.id);
      } else {
        const answer = question.answers.find(a => a._id === targetId);
        currentVote = answer?.votes?.voters?.find(v => v.user === user?.id);
      }

      // If clicking the same vote type, remove the vote
      const voteType = (currentVote && currentVote.voteType === type) ? 'remove' : type;
      
      const response = await axios.post(`/api/${targetType}/${targetId}/vote`, {
        voteType: voteType
      });

      // Update the question or answer with new vote counts
      if (targetType === 'questions') {
        setQuestion(prev => ({
          ...prev,
          votes: {
            ...prev.votes,
            upvotes: response.data.upvotes,
            downvotes: response.data.downvotes,
            voters: prev.votes?.voters || []
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

      if (voteType === 'remove') {
        toast.success('Vote removed');
      } else {
        toast.success(`${type === 'upvote' ? 'Upvoted' : 'Downvoted'} successfully`);
      }
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
    if (!isAuthenticated || !question.author || 
        String(question.author._id) !== String(user?.id || user?._id)) {
      toast.error('Only the question author can accept answers');
      return;
    }

    try {
      const response = await axios.post(`/api/answers/${answerId}/accept`);
      
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

      toast.success(response.data.message || 'Answer accepted successfully');
    } catch (error) {
      console.error('Error accepting answer:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to accept answer';
      toast.error(errorMessage);
    }
  };

  const handleDeleteQuestion = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Question',
      message: 'Are you sure you want to delete this question? This action cannot be undone and will deduct 5 points.',
      confirmText: 'Delete Question',
      confirmButtonColor: 'bg-red-500 hover:bg-red-600',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/questions/${id}`);
          toast.success('Question deleted successfully (-5 points)');
          navigate('/dashboard');
        } catch (error) {
          console.error('Error deleting question:', error);
          toast.error('Failed to delete question');
        }
      }
    });
  };

  const handleDeleteAnswer = (answerId) => {
    const answerToDelete = question.answers.find(a => a._id === answerId);
    const isAccepted = answerToDelete?.isAccepted;
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Answer',
      message: isAccepted 
        ? 'Are you sure you want to delete this accepted answer? This action cannot be undone, will deduct points, and the question will be marked as unsolved.'
        : 'Are you sure you want to delete this answer? This action cannot be undone and will deduct points.',
      confirmText: 'Delete Answer',
      confirmButtonColor: 'bg-red-500 hover:bg-red-600',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/answers/${answerId}`);
          
          // Update the question state
          setQuestion(prev => {
            const updatedAnswers = prev.answers.filter(answer => answer._id !== answerId);
            const wasAccepted = prev.acceptedAnswer === answerId;
            
            return {
              ...prev,
              answers: updatedAnswers,
              // If deleted answer was accepted, unaccept it
              acceptedAnswer: wasAccepted ? null : prev.acceptedAnswer,
              isSolved: wasAccepted ? false : prev.isSolved
            };
          });

          toast.success('Answer deleted successfully');
        } catch (error) {
          console.error('Error deleting answer:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to delete answer';
          toast.error(errorMessage);
        }
      }
    });
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

  // Component to render content with LaTeX formulas
  const renderContentWithFormulas = (htmlContent) => {
    if (!htmlContent) return null;

    try {
      // Check if content contains LaTeX formulas by looking at the raw HTML
      if (!htmlContent.includes('$')) {
        return <div className="prose dark:prose-invert max-w-none mb-4" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
      }

      // Process HTML content to find and replace formulas
      // We'll replace $...$ and $$...$$ patterns with KaTeX rendered versions
      let processedContent = htmlContent;
      
      // Find all formulas in the content
      const inlineFormulaRegex = /\$([^$\n]+?)\$/g;
      const blockFormulaRegex = /\$\$([^$]+?)\$\$/g;
      
      // First, handle block formulas ($$...$$) - they take precedence
      const blockMatches = [];
      let blockMatch;
      while ((blockMatch = blockFormulaRegex.exec(htmlContent)) !== null) {
        blockMatches.push({
          index: blockMatch.index,
          length: blockMatch[0].length,
          formula: blockMatch[1].trim(),
          isBlock: true,
          original: blockMatch[0]
        });
      }
      
      // Then handle inline formulas ($...$), excluding those inside block formulas
      const inlineMatches = [];
      let inlineMatch;
      while ((inlineMatch = inlineFormulaRegex.exec(htmlContent)) !== null) {
        const isInsideBlock = blockMatches.some(bm => 
          inlineMatch.index >= bm.index && inlineMatch.index < bm.index + bm.length
        );
        if (!isInsideBlock) {
          inlineMatches.push({
            index: inlineMatch.index,
            length: inlineMatch[0].length,
            formula: inlineMatch[1].trim(),
            isBlock: false,
            original: inlineMatch[0]
          });
        }
      }
      
      // Combine and sort all matches
      const allMatches = [...blockMatches, ...inlineMatches].sort((a, b) => a.index - b.index);
      
      if (allMatches.length === 0) {
        return <div className="prose dark:prose-invert max-w-none mb-4" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
      }
      
      // Replace formulas with placeholders, then render
      const replacements = [];
      allMatches.forEach((match, idx) => {
        const placeholder = `__FORMULA_${idx}__`;
        replacements.push({
          placeholder,
          formula: match.formula,
          isBlock: match.isBlock
        });
        processedContent = processedContent.replace(match.original, placeholder);
      });
      
      // Split by placeholders and render
      const parts = processedContent.split(/(__FORMULA_\d+__)/);
      
      return (
        <div className="prose dark:prose-invert max-w-none mb-4">
          {parts.map((part, idx) => {
            const replacement = replacements.find(r => part === r.placeholder);
            if (replacement) {
              if (replacement.isBlock) {
                try {
                  return <BlockMath key={idx} math={replacement.formula} />;
                } catch (e) {
                  console.error('Error rendering block formula:', e);
                  return <div key={idx} className="font-mono my-4">$${replacement.formula}$$</div>;
                }
              } else {
                try {
                  return <InlineMath key={idx} math={replacement.formula} />;
                } catch (e) {
                  console.error('Error rendering inline formula:', e);
                  return <span key={idx} className="font-mono">${replacement.formula}$</span>;
                }
              }
            } else if (part) {
              return <span key={idx} dangerouslySetInnerHTML={{ __html: part }} />;
            }
            return null;
          })}
        </div>
      );
    } catch (error) {
      console.error('Error rendering content with formulas:', error);
      // Fallback to simple HTML rendering if formula processing fails
      return <div className="prose dark:prose-invert max-w-none mb-4" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
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
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
              >
                <FiArrowLeft className="h-4 w-4" />
                Back to Questions
              </button>

              {/* Delete Question Button - Only visible to question author */}
              {isAuthenticated && 
               question.author && 
               (String(question.author._id) === String(user?.id || user?._id)) && (
                <button
                  onClick={handleDeleteQuestion}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-300 dark:border-red-800"
                >
                  <FiTrash2 className="h-4 w-4" />
                  Delete Question
                </button>
              )}
            </div>

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

                {renderContentWithFormulas(question.description)}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-300 mb-4">
                  <Link
                    to={`/profile/${question.author?._id}`}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <img
                      src={question.author?.avatar || `https://ui-avatars.com/api/?name=${question.author?.username}&background=1193d4&color=fff`}
                      alt={question.author?.username}
                      className="w-6 h-6 rounded-full ring-2 ring-transparent hover:ring-primary transition-all"
                    />
                    <span className="hover:underline font-medium">{question.author?.username}</span>
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
                  {(() => {
                    const userVote = question.votes?.voters?.find(v => v.user === user?.id);
                    const hasUpvoted = userVote?.voteType === 'upvote';
                    const hasDownvoted = userVote?.voteType === 'downvote';
                    
                    return (
                      <>
                        <button
                          onClick={() => handleVote('upvote', question._id, 'questions')}
                          disabled={voting[question._id]}
                          className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                            hasUpvoted 
                              ? 'bg-green-500 text-white shadow-md' 
                              : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                          }`}
                        >
                          <FiThumbsUp className="h-4 w-4" />
                          <span className="font-semibold">{question.votes?.upvotes || 0}</span>
                        </button>
                        
                        <button
                          onClick={() => handleVote('downvote', question._id, 'questions')}
                          disabled={voting[question._id]}
                          className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                            hasDownvoted 
                              ? 'bg-red-500 text-white shadow-md' 
                              : 'hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
                          }`}
                        >
                          <FiThumbsDown className="h-4 w-4" />
                          <span className="font-semibold">{question.votes?.downvotes || 0}</span>
                        </button>
                      </>
                    );
                  })()}
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
                    <Link to={`/profile/${answer.author?._id}`}>
                      <img
                        src={answer.author?.avatar || `https://ui-avatars.com/api/?name=${answer.author?.username}&background=1193d4&color=fff`}
                        alt={answer.author?.username}
                        className="w-10 h-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-primary transition-all cursor-pointer"
                      />
                    </Link>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link
                          to={`/profile/${answer.author?._id}`}
                          className="font-bold text-gray-900 dark:text-white hover:text-primary hover:underline transition-colors"
                        >
                          {answer.author?.username}
                        </Link>
                        <span className="text-sm text-gray-500 dark:text-gray-300">
                          {formatDate(answer.createdAt)}
                        </span>
                        {answer.isEdited && (
                          <span className="text-xs text-gray-400 dark:text-gray-400">(edited)</span>
                        )}
                      </div>
                      
                      {renderContentWithFormulas(answer.content)}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {(() => {
                            const userVote = answer.votes?.voters?.find(v => v.user === user?.id);
                            const hasUpvoted = userVote?.voteType === 'upvote';
                            const hasDownvoted = userVote?.voteType === 'downvote';
                            
                            return (
                              <>
                                <button
                                  onClick={() => handleVote('upvote', answer._id, 'answers')}
                                  disabled={voting[answer._id]}
                                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                                    hasUpvoted 
                                      ? 'bg-green-500 text-white shadow-md' 
                                      : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                                  }`}
                                >
                                  <FiThumbsUp className="h-4 w-4" />
                                  <span className="font-semibold">{answer.votes?.upvotes || 0}</span>
                                </button>
                                
                                <button
                                  onClick={() => handleVote('downvote', answer._id, 'answers')}
                                  disabled={voting[answer._id]}
                                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                                    hasDownvoted 
                                      ? 'bg-red-500 text-white shadow-md' 
                                      : 'hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
                                  }`}
                                >
                                  <FiThumbsDown className="h-4 w-4" />
                                  <span className="font-semibold">{answer.votes?.downvotes || 0}</span>
                                </button>
                              </>
                            );
                          })()}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Accept Answer Button - Only visible to question author */}
                          {isAuthenticated && 
                           question.author && 
                           (String(question.author._id) === String(user?.id || user?._id)) && 
                           !question.isSolved && 
                           !answer.isAccepted && (
                            <button
                              onClick={() => handleAcceptAnswer(answer._id)}
                              className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                            >
                              <FiCheck className="w-4 h-4" />
                              Accept Answer
                            </button>
                          )}
                          
                          {/* Show message if answer is already accepted */}
                          {answer.isAccepted && (
                            <span className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                              <FiCheck className="w-4 h-4" />
                              Accepted Answer
                            </span>
                          )}
                          
                          {/* Delete Answer Button - Only visible to answer author */}
                          {isAuthenticated && 
                           answer.author && 
                           (String(answer.author._id) === String(user?.id || user?._id)) && (
                            <button
                              onClick={() => handleDeleteAnswer(answer._id)}
                              className="flex items-center gap-1 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm border border-red-300 dark:border-red-800"
                            >
                              <FiTrash2 className="h-4 w-4" />
                              Delete
                            </button>
                          )}
                        </div>
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
                <div className="mb-4 quill-wrapper">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={answerContent}
                    onChange={setAnswerContent}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Write your answer here. Click to start typing..."
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
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

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm || (() => {})}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmButtonColor={confirmModal.confirmButtonColor}
      />
    </div>
  );
};

export default QuestionDetails;


