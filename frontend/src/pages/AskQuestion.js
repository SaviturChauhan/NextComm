import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FiTag, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

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
  const navigate = useNavigate();

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'blockquote', 'code-block', 'link', 'image'
  ];

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
    } else if (formData.description.length > 5000) {
      newErrors.description = 'Description must be less than 5000 characters';
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
            <p className="text-gray-600 dark:text-gray-400">
              Get help from the community by asking a detailed question
            </p>
          </div>

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
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <ReactQuill
                    value={formData.description}
                    onChange={(value) => handleChange('description', value)}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Include all the information someone would need to answer your question. Use LaTeX for math formulas, e.g., $$R = \frac{1}{2}\log_2(1 + \text{SNR})$$."
                    style={{ minHeight: '200px' }}
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
                    placeholder="e.g. 5G, OFDM, MIMO, channel-estimation"
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
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Other">Other</option>
                    <option value="5G">5G</option>
                    <option value="4G">4G</option>
                    <option value="MIMO">MIMO</option>
                    <option value="OFDM">OFDM</option>
                    <option value="Beamforming">Beamforming</option>
                    <option value="Channel Estimation">Channel Estimation</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e) => handleChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
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
    </div>
  );
};

export default AskQuestion;


