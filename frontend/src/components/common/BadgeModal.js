import React, { useEffect, useState } from 'react';
import { FiX, FiDownload } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const BadgeModal = ({ badge, isOpen, onClose, userName }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      // Trigger animation after a short delay
      setTimeout(() => setShowAnimation(true), 100);
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    } else {
      setShowAnimation(false);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !badge) return null;

  const displayName = userName || user?.username || 'User';

  // Get badge description based on badge name (ensures correct description regardless of DB)
  const getBadgeDescription = (badgeName, defaultDescription) => {
    const badgeDescriptions = {
      'Beginner': 'Welcome to NextComm!',
      'Contributor': 'Earned at 100 points milestone',
      'Scholar': 'Earned at 250 points milestone',
      'Expert': 'Earned at 500 points milestone',
      'Master': 'Earned at 1000 points milestone',
      'Legend': 'Earned at 2000 points milestone',
      'Elite': 'Earned at 3000 points milestone',
      'Guru': 'Earned at 5000 points milestone'
    };
    return badgeDescriptions[badgeName] || defaultDescription;
  };

  // Get badge icon based on badge name
  const getBadgeIcon = (badgeName) => {
    const lowerName = badgeName.toLowerCase();
    if (lowerName.includes('beginner')) return '🌱';
    if (lowerName.includes('contributor')) return '📝';
    if (lowerName.includes('scholar')) return '📚';
    if (lowerName.includes('expert')) return '⭐';
    if (lowerName.includes('master')) return '🏆';
    if (lowerName.includes('legend')) return '👑';
    if (lowerName.includes('elite')) return '💎';
    if (lowerName.includes('guru')) return '🧙';
    return '🎖️';
  };

  // Get badge color based on badge name
  const getBadgeColor = (badgeName) => {
    const lowerName = badgeName.toLowerCase();
    if (lowerName.includes('beginner')) return '#10b981'; // Green
    if (lowerName.includes('contributor')) return '#3b82f6'; // Blue
    if (lowerName.includes('scholar')) return '#8b5cf6'; // Purple
    if (lowerName.includes('expert')) return '#f59e0b'; // Amber
    if (lowerName.includes('master')) return '#ef4444'; // Red
    if (lowerName.includes('legend')) return '#ec4899'; // Pink
    if (lowerName.includes('elite')) return '#06b6d4'; // Cyan
    if (lowerName.includes('guru')) return '#fbbf24'; // Yellow
    return '#1193d4'; // Primary blue
  };

  const badgeIcon = getBadgeIcon(badge.name);
  const badgeColor = getBadgeColor(badge.name);
  const badgeDescription = getBadgeDescription(badge.name, badge.description);

  const handleDownload = () => {
    // Create a canvas element to generate the badge image
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Draw spotlight effect
    const spotlightGradient = ctx.createRadialGradient(400, 100, 0, 400, 100, 400);
    spotlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    spotlightGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spotlightGradient;
    ctx.fillRect(0, 0, 800, 600);

    // Draw text
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Congratulations', 400, 100);
    
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`${badge.name}`, 400, 150);

    // Draw description
    ctx.font = '24px Arial';
    ctx.fillText(badgeDescription, 400, 480);

    // Draw badge (simplified)
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(badgeIcon, 400, 300);

    // Convert to image and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${badge.name.replace(/\s+/g, '_')}_badge.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

      {/* Modal Content */}
      <div 
        className={`relative w-full max-w-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 ${showAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => {
          // Prevent clicks inside modal from closing it
          e.stopPropagation();
        }}
      >
        {/* Close Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <FiX className="w-6 h-6" />
        </button>

        {/* Spotlight Effect */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-b from-white/30 via-white/10 to-transparent rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-20 p-8 md:p-12">
          {/* Top Section */}
          <div className="flex justify-between items-start mb-8">
            <p className="text-amber-400/90 text-sm md:text-base font-medium">
              Dear {displayName}
            </p>
            <div className="text-white font-bold text-lg">NextComm</div>
          </div>

          {/* Congratulatory Text */}
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">
              Congratulations
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-amber-300 mb-6">
              {badge.name}!
            </h3>
          </div>

          {/* Badge Container */}
          <div className="relative flex items-center justify-center mb-8">
            {/* Sparkles */}
            {showAnimation && (
              <>
                <Sparkle className="absolute top-10 left-20 animate-sparkle-1" />
                <Sparkle className="absolute top-16 right-24 animate-sparkle-2" />
                <Sparkle className="absolute bottom-12 left-32 animate-sparkle-3" />
                <Sparkle className="absolute bottom-20 right-20 animate-sparkle-4" />
                <Sparkle className="absolute top-1/2 left-10 animate-sparkle-5" />
                <Sparkle className="absolute top-1/2 right-12 animate-sparkle-6" />
              </>
            )}

            {/* Badge */}
            <div className={`relative ${showAnimation ? 'animate-badge-pop' : ''}`}>
              <div className={`w-56 h-56 md:w-72 md:h-72 relative`}>
                {/* Outer Glow */}
                <div 
                  className={`absolute inset-0 opacity-60 blur-2xl ${showAnimation ? 'animate-pulse' : ''}`} 
                  style={{ 
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${badgeColor}40, transparent 70%)`
                  }}
                ></div>
                
                {/* Badge Hexagon Container */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Hexagon Badge */}
                  <svg 
                    width="100%" 
                    height="100%" 
                    viewBox="0 0 200 200" 
                    className="absolute inset-0 filter drop-shadow-2xl"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <linearGradient id={`badge-gradient-${badge.name.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={`${badgeColor}cc`} />
                        <stop offset="50%" stopColor={`${badgeColor}99`} />
                        <stop offset="100%" stopColor={`${badgeColor}66`} />
                      </linearGradient>
                      <filter id={`glow-${badge.name.replace(/\s+/g, '-')}`}>
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    {/* Hexagon shape */}
                    <polygon
                      points="100,20 170,60 170,140 100,180 30,140 30,60"
                      fill={`url(#badge-gradient-${badge.name.replace(/\s+/g, '-')})`}
                      stroke={badgeColor}
                      strokeWidth="4"
                      filter={`url(#glow-${badge.name.replace(/\s+/g, '-')})`}
                      className={`${showAnimation ? 'animate-pulse' : ''}`}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                  </svg>
                  
                  {/* Badge Tab */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-900 px-6 py-1.5 rounded-t-md border-2 border-white/30 shadow-lg z-10">
                    <span className="text-white text-xs font-bold uppercase tracking-wider">Badge</span>
                  </div>
                  
                  {/* Badge Icon/Content */}
                  <div className="relative z-10 text-9xl md:text-[10rem] filter drop-shadow-2xl transform transition-transform duration-300" style={{ textShadow: `0 0 20px ${badgeColor}80` }}>
                    {badgeIcon}
                  </div>

                  {/* Inner shine effect */}
                  <div 
                    className="absolute inset-0 pointer-events-none rounded-full"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 50%)`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="text-center mb-8">
            <p className="text-amber-300/90 text-lg md:text-xl font-medium">
              {badgeDescription}
            </p>
          </div>

          {/* Download Button */}
          <div className="flex justify-center">
            <button
              onClick={handleDownload}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:from-amber-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <FiDownload className="w-5 h-5" />
              Generate Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sparkle Component
const Sparkle = ({ className }) => {
  return (
    <div className={`w-3 h-3 ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
        <path
          d="M12 0L13.09 8.26L21 12L13.09 15.74L12 24L10.91 15.74L3 12L10.91 8.26L12 0Z"
          fill="currentColor"
          opacity="0.8"
        />
      </svg>
    </div>
  );
};

export default BadgeModal;

