import React, { useState, useRef } from 'react';
import { FiX, FiUpload, FiImage, FiCamera } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const AvatarEditor = ({ isOpen, onClose, currentAvatar, onSave, userId, username = 'User' }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Generate personalized sample avatars with better-looking options
  const getSampleAvatars = () => {
    const encodedName = encodeURIComponent(username);
    const seed = username || 'User';
    
    return [
      // Professional Letter Avatars (Clean and modern)
      {
        name: 'Blue Professional',
        url: `https://ui-avatars.com/api/?name=${encodedName}&background=3b82f6&color=fff&size=200&bold=true&font-size=0.5`
      },
      {
        name: 'Purple Professional',
        url: `https://ui-avatars.com/api/?name=${encodedName}&background=8b5cf6&color=fff&size=200&bold=true&font-size=0.5`
      },
      {
        name: 'Green Professional',
        url: `https://ui-avatars.com/api/?name=${encodedName}&background=10b981&color=fff&size=200&bold=true&font-size=0.5`
      },
      {
        name: 'Orange Professional',
        url: `https://ui-avatars.com/api/?name=${encodedName}&background=f97316&color=fff&size=200&bold=true&font-size=0.5`
      },
      {
        name: 'Pink Professional',
        url: `https://ui-avatars.com/api/?name=${encodedName}&background=ec4899&color=fff&size=200&bold=true&font-size=0.5`
      },
      {
        name: 'Teal Professional',
        url: `https://ui-avatars.com/api/?name=${encodedName}&background=14b8a6&color=fff&size=200&bold=true&font-size=0.5`
      },
      {
        name: 'Indigo Professional',
        url: `https://ui-avatars.com/api/?name=${encodedName}&background=6366f1&color=fff&size=200&bold=true&font-size=0.5`
      },
      {
        name: 'Rose Professional',
        url: `https://ui-avatars.com/api/?name=${encodedName}&background=f43f5e&color=fff&size=200&bold=true&font-size=0.5`
      },
      // Modern Character Avatars (Better quality styles)
      {
        name: 'Adventurer',
        url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=200`
      },
      {
        name: 'Adventurer Neutral',
        url: `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=200`
      },
      {
        name: 'Shapes',
        url: `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=200`
      },
      {
        name: 'Initials',
        url: `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=200`
      },
      {
        name: 'Lorelei',
        url: `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=200`
      },
      {
        name: 'Micah',
        url: `https://api.dicebear.com/7.x/micah/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=200`
      },
      {
        name: 'Miniavs',
        url: `https://api.dicebear.com/7.x/miniavs/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=200`
      },
      {
        name: 'Open Peeps',
        url: `https://api.dicebear.com/7.x/open-peeps/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=200`
      },
      {
        name: 'Personas',
        url: `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=200`
      },
      {
        name: 'Croodles',
        url: `https://api.dicebear.com/7.x/croodles/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=200`
      }
    ];
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Read file and convert to base64 or URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedAvatar(reader.result);
    };
    reader.onerror = () => {
      toast.error('Error reading image file');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!selectedAvatar) {
      toast.error('Please select an avatar');
      return;
    }

    try {
      setUploading(true);
      
      // Handle base64 images - convert to data URL that can be stored
      // Note: For production, you should upload to a cloud service like Cloudinary
      // For now, we'll store the base64 data URL directly (works for small images)
      let avatarUrl = selectedAvatar;
      
      if (selectedAvatar.startsWith('data:')) {
        // Check if the base64 image is too large (more than 100KB)
        const base64Size = (selectedAvatar.length * 3) / 4;
        if (base64Size > 100 * 1024) {
          toast.error('Image is too large. Please use an image smaller than 100KB or use a URL.');
          setUploading(false);
          return;
        }
        // Use the base64 data URL directly
        avatarUrl = selectedAvatar;
      }

      // Update avatar via API
      await axios.put('/api/auth/profile', {
        avatar: avatarUrl
      });

      if (onSave) {
        onSave(avatarUrl);
      }
      
      toast.success('Profile photo updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile photo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setUploading(true);
      await axios.put('/api/auth/profile', {
        avatar: ''
      });
      // Response is not needed here

      if (onSave) {
        onSave('');
      }
      
      toast.success('Profile photo removed');
      onClose();
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove profile photo');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <FiCamera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change Profile Photo</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose a sample avatar or upload your own</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Avatar Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={selectedAvatar || `https://ui-avatars.com/api/?name=User&background=1193d4&color=fff&size=128`}
                  alt="Preview"
                  className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-700 object-cover"
                />
                {selectedAvatar && (
                  <button
                    onClick={() => setSelectedAvatar('')}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    title="Clear selection"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedAvatar ? 'Selected avatar' : 'No avatar selected'}
                </p>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Your Own Photo
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={handleUploadClick}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <FiUpload className="w-4 h-4" />
                <span>Choose File</span>
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                PNG, JPG up to 5MB
              </span>
            </div>
          </div>

          {/* Or Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or choose from samples
              </span>
            </div>
          </div>

          {/* Sample Avatars */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Sample Avatars
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {getSampleAvatars().map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAvatar(avatar.url)}
                  className={`relative p-2 rounded-lg border-2 transition-all ${
                    selectedAvatar === avatar.url
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                  }`}
                  title={avatar.name}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.name}
                    className="w-full aspect-square rounded-full object-cover"
                  />
                  {selectedAvatar === avatar.url && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <FiImage className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom URL Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Or Enter Image URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={selectedAvatar && !selectedAvatar.startsWith('data:') ? selectedAvatar : ''}
              onChange={(e) => setSelectedAvatar(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter a direct URL to an image
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleRemove}
            disabled={uploading || !currentAvatar}
            className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Remove Photo
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={uploading || !selectedAvatar}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiImage className="w-4 h-4" />
                  <span>Save Photo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarEditor;

