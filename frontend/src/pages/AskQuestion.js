import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FiTag, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import CustomSelect from '../components/common/CustomSelect';
import { createQuillModules, quillFormats } from '../utils/quillToolbar';
import hljs from 'highlight.js';
import FormulaModal from '../components/common/FormulaModal';
import CodeModal from '../components/common/CodeModal';
import DuplicateQuestionAlert from '../components/common/DuplicateQuestionAlert';

const AskQuestion = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    category: 'Other',
    difficulty: 'beginner'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formulaModalOpen, setFormulaModalOpen] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [quillInstance, setQuillInstance] = useState(null);
  const [quillRange, setQuillRange] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(true);
  const duplicateCheckTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Handle formula button click
  const handleFormulaClick = (quill, range) => {
    setQuillInstance(quill);
    setQuillRange(range);
    setFormulaModalOpen(true);
  };

  // Handle code button click
  const handleCodeClick = (quill, range) => {
    setQuillInstance(quill);
    setQuillRange(range);
    setCodeModalOpen(true);
  };

  // Enhanced ReactQuill configuration with LaTeX and Code buttons
  const quillModules = React.useMemo(() => 
    createQuillModules(handleFormulaClick, handleCodeClick), 
    []
  );

  // Handle formula insertion
  const handleFormulaConfirm = (formula, isBlock) => {
    if (quillInstance && quillRange) {
      const formulaText = isBlock ? `$$${formula}$$` : `$${formula}$`;
      quillInstance.insertText(quillRange.index, formulaText, 'user');
      quillInstance.setSelection(quillRange.index + formulaText.length);
    }
    setFormulaModalOpen(false);
    setQuillInstance(null);
    setQuillRange(null);
  };

  // Handle code insertion
  const handleCodeConfirm = (code, language) => {
    if (quillInstance && quillRange) {
      // Get current line
      const [line] = quillInstance.getLine(quillRange.index);
      const lineStart = quillInstance.getIndex(line);
      
      // Insert newline before code block if not at start
      let insertIndex = quillRange.index;
      if (lineStart < quillRange.index) {
        quillInstance.insertText(quillRange.index, '\n', 'user');
        insertIndex = quillRange.index + 1;
      }
      
      // Insert code
      quillInstance.insertText(insertIndex, code + '\n', 'user');
      
      // Format as code block
      const codeStart = insertIndex;
      quillInstance.formatText(codeStart, code.length, 'code-block', true);
      
      // Try to set language attribute
      try {
        const codeBlock = quillInstance.getLine(codeStart)[0];
        if (codeBlock && codeBlock.domNode) {
          codeBlock.domNode.setAttribute('data-language', language);
        }
      } catch (e) {
        // Ignore if we can't set attribute
      }
      
      // Move cursor after code block
      quillInstance.setSelection(codeStart + code.length + 1);
    }
    setCodeModalOpen(false);
    setQuillInstance(null);
    setQuillRange(null);
  };

  // Custom paste handler ref
  const quillRef = useRef(null);

  // Setup paste handler and syntax highlighting after Quill is initialized
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      
      // Custom paste handler to preserve LaTeX formulas
      quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
        const text = node.data;
        
        // If text contains LaTeX formulas, preserve them
        if (text && text.includes('$')) {
          return delta;
        }
        
        return delta;
      });
      
      // Also handle HTML paste
      quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
        if (node.tagName === 'P' || node.tagName === 'DIV') {
          const text = node.textContent || '';
          if (text.includes('$')) {
            return delta;
          }
        }
        return delta;
      });

      // Highlight code blocks on content change
      const highlightCodeBlocks = () => {
        const editor = quill.root;
        const codeBlocks = editor.querySelectorAll('pre.ql-syntax, pre code');
        codeBlocks.forEach((block) => {
          const code = block.textContent || '';
          const lang = block.getAttribute('data-language') || 
                      block.className.match(/language-(\w+)/)?.[1] || 
                      'plaintext';
          
          if (hljs.getLanguage(lang)) {
            try {
              const highlighted = hljs.highlight(code, { language: lang });
              block.innerHTML = highlighted.value;
              block.classList.add('hljs');
              block.classList.add(`language-${lang}`);
            } catch (e) {
              // Keep original if highlighting fails
            }
          }
        });
      };

      // Highlight on text change
      quill.on('text-change', () => {
        setTimeout(highlightCodeBlocks, 100);
      });
    }
  }, []);

  // Debounced duplicate check
  useEffect(() => {
    // Clear previous timeout
    if (duplicateCheckTimeoutRef.current) {
      clearTimeout(duplicateCheckTimeoutRef.current);
    }

    // Set new timeout - only check if title is long enough
    if (formData.title && formData.title.length >= 10) {
      duplicateCheckTimeoutRef.current = setTimeout(async () => {
        try {
          setCheckingDuplicates(true);
          const response = await axios.post('/api/ai/check-duplicates', {
            title: formData.title,
            description: formData.description || ''
          });
          setDuplicates(response.data.duplicates || []);
        } catch (error) {
          console.error('Error checking duplicates:', error);
          // Silently fail - don't block user from posting
          setDuplicates([]);
        } finally {
          setCheckingDuplicates(false);
        }
      }, 1000); // Wait 1 second after user stops typing
    } else {
      // Clear duplicates if title is too short
      setDuplicates([]);
      setCheckingDuplicates(false);
    }

    return () => {
      if (duplicateCheckTimeoutRef.current) {
        clearTimeout(duplicateCheckTimeoutRef.current);
      }
    };
  }, [formData.title, formData.description]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Reset duplicate alert when title changes significantly
    if (field === 'title' && duplicates.length > 0) {
      setShowDuplicateAlert(true);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (formData.description.length > 15000) {
      newErrors.description = 'Description must be less than 15000 characters';
    }

    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (tagsArray.length === 0) {
      newErrors.tags = 'At least one tag is required';
    } else if (tagsArray.length > 5) {
      newErrors.tags = 'Maximum 5 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const questionData = {
        title: formData.title.trim(),
        description: formData.description,
        tags: tagsArray,
        category: formData.category,
        difficulty: formData.difficulty
      };

      const response = await axios.post('/api/questions', questionData);
      
      toast.success('Question posted successfully!');
      navigate(`/question/${response.data._id}`);
    } catch (error) {
      console.error('Error posting question:', error);
      const message = error.response?.data?.message || 'Failed to post question';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Ask a Question
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Get help from the community by asking a detailed question
            </p>
          </div>

          {/* Duplicate Question Alert */}
          {showDuplicateAlert && duplicates.length > 0 && (
            <DuplicateQuestionAlert
              duplicates={duplicates}
              onDismiss={() => setShowDuplicateAlert(false)}
              onViewDuplicate={() => setShowDuplicateAlert(false)}
            />
          )}

          {/* Loading indicator for duplicate check */}
          {checkingDuplicates && (
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              Checking for similar questions...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {/* Title */}
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. How to calculate the coherence time for a MIMO channel?"
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FiAlertCircle className="h-4 w-4" />
                    {errors.title}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Be specific and imagine you're asking a question to another person.
                </p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <div className="rounded-lg quill-wrapper">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={formData.description}
                    onChange={(value) => handleChange('description', value)}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Include all the information someone would need to answer your question. Click here to start typing..."
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FiAlertCircle className="h-4 w-4" />
                    {errors.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Include all the information someone would need to answer your question.
                </p>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiTag className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    placeholder="e.g. fading, path-loss, diversity, massive-mimo, papr, cyclic-prefix"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.tags ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                </div>
                {errors.tags && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FiAlertCircle className="h-4 w-4" />
                    {errors.tags}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Add up to 5 tags to describe what your question is about, separated by commas.
                </p>
              </div>

              {/* Category and Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <CustomSelect
                    value={formData.category}
                    onChange={(value) => handleChange('category', value)}
                    options={[
                      { value: 'Other', label: 'Other' },
                      { value: 'Introduction & Performance', label: 'Introduction & Performance' },
                      { value: 'Wireless Channel Models', label: 'Wireless Channel Models' },
                      { value: 'Diversity & Channel Capacity', label: 'Diversity & Channel Capacity' },
                      { value: 'MIMO Systems', label: 'MIMO Systems' },
                      { value: 'OFDM (Multi-carrier Modulation)', label: 'OFDM (Multi-carrier Modulation)' },
                      { value: 'Cellular Standards', label: 'Cellular Standards' }
                    ]}
                  />
                </div>

                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <CustomSelect
                    value={formData.difficulty}
                    onChange={(value) => handleChange('difficulty', value)}
                    options={[
                      { value: 'beginner', label: 'Beginner' },
                      { value: 'intermediate', label: 'Intermediate' },
                      { value: 'advanced', label: 'Advanced' }
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="spinner"></div>
                    Posting Question...
                  </div>
                ) : (
                  'Post Your Question'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Formula Modal */}
      <FormulaModal
        isOpen={formulaModalOpen}
        onClose={() => {
          setFormulaModalOpen(false);
          setQuillInstance(null);
          setQuillRange(null);
        }}
        onConfirm={handleFormulaConfirm}
      />

      {/* Code Modal */}
      <CodeModal
        isOpen={codeModalOpen}
        onClose={() => {
          setCodeModalOpen(false);
          setQuillInstance(null);
          setQuillRange(null);
        }}
        onConfirm={handleCodeConfirm}
      />
    </div>
  );
};

export default AskQuestion;


