import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiAward, 
  FiPlusCircle, 
  FiMinusCircle, 
  FiThumbsUp, 
  FiThumbsDown,
  FiMessageSquare,
  FiCheckCircle,
  FiTrash2,
  FiTrendingUp
} from 'react-icons/fi';

const PointsGuide = () => {
  const earningActions = [
    {
      icon: <FiMessageSquare className="w-8 h-8 text-green-500" />,
      action: 'Ask a Question',
      points: '+5',
      reputation: '+1',
      description: 'Earn points by asking well-formatted questions that help the community.',
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    },
    {
      icon: <FiMessageSquare className="w-8 h-8 text-blue-500" />,
      action: 'Post an Answer',
      points: '+10',
      reputation: '+2',
      description: 'Provide helpful answers to questions. More points than asking!',
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    },
    {
      icon: <FiThumbsUp className="w-8 h-8 text-purple-500" />,
      action: 'Upvote on Your Question',
      points: '+2',
      reputation: '+2',
      description: 'Receive points when someone upvotes your question.',
      color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    },
    {
      icon: <FiThumbsUp className="w-8 h-8 text-indigo-500" />,
      action: 'Upvote on Your Answer',
      points: '+3',
      reputation: '+3',
      description: 'Get more points when your answer receives an upvote (higher value than question upvotes).',
      color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
    },
    {
      icon: <FiCheckCircle className="w-8 h-8 text-yellow-500" />,
      action: 'Answer Accepted',
      points: '+50',
      reputation: '+50',
      description: 'Huge reward when the question author accepts your answer as the best solution!',
      color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    }
  ];

  const losingActions = [
    {
      icon: <FiThumbsDown className="w-8 h-8 text-orange-500" />,
      action: 'Downvote on Your Question',
      points: '-1',
      reputation: '-1',
      description: 'Lose points when your question receives a downvote.',
      color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
    },
    {
      icon: <FiThumbsDown className="w-8 h-8 text-red-500" />,
      action: 'Downvote on Your Answer',
      points: '-2',
      reputation: '-2',
      description: 'Lose more points for downvotes on answers.',
      color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    },
    {
      icon: <FiTrash2 className="w-8 h-8 text-gray-500" />,
      action: 'Delete Your Question',
      points: '-5',
      reputation: '-1',
      description: 'Points are deducted when you delete a question.',
      color: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
    },
    {
      icon: <FiTrash2 className="w-8 h-8 text-gray-600" />,
      action: 'Delete Your Answer',
      points: '-10 + (-3 per upvote)',
      reputation: '-2 + (-1 per upvote)',
      description: 'Base points plus all earned upvote points are deducted.',
      color: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
    }
  ];

  const badges = [
    { 
      name: 'Beginner', 
      points: 0, 
      description: 'Welcome to NextComm!',
      color: 'from-gray-400 to-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-800/50',
      borderColor: 'border-gray-300 dark:border-gray-600',
      textColor: 'text-gray-700 dark:text-gray-300',
      iconBg: 'bg-gray-100 dark:bg-gray-700',
      shadow: 'shadow-sm'
    },
    { 
      name: 'Contributor', 
      points: 100, 
      description: 'Earned at 100 points milestone',
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-300 dark:border-green-700',
      textColor: 'text-green-700 dark:text-green-300',
      iconBg: 'bg-green-100 dark:bg-green-800/50',
      shadow: 'shadow-md'
    },
    { 
      name: 'Scholar', 
      points: 250, 
      description: 'Earned at 250 points milestone',
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-300 dark:border-blue-700',
      textColor: 'text-blue-700 dark:text-blue-300',
      iconBg: 'bg-blue-100 dark:bg-blue-800/50',
      shadow: 'shadow-md shadow-blue-200/50 dark:shadow-blue-900/30'
    },
    { 
      name: 'Expert', 
      points: 500, 
      description: 'Earned at 500 points milestone',
      color: 'from-purple-400 to-indigo-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-300 dark:border-purple-700',
      textColor: 'text-purple-700 dark:text-purple-300',
      iconBg: 'bg-purple-100 dark:bg-purple-800/50',
      shadow: 'shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30',
      glow: true
    },
    { 
      name: 'Master', 
      points: 1000, 
      description: 'Earned at 1000 points milestone',
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
      borderColor: 'border-orange-400 dark:border-orange-600',
      textColor: 'text-orange-700 dark:text-orange-300',
      iconBg: 'bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-800/50 dark:to-red-800/50',
      shadow: 'shadow-xl shadow-orange-300/60 dark:shadow-orange-900/40',
      glow: true,
      ring: 'ring-2 ring-orange-300 dark:ring-orange-700'
    },
    { 
      name: 'Legend', 
      points: 2000, 
      description: 'Earned at 2000 points milestone',
      color: 'from-yellow-400 via-amber-500 to-orange-500',
      bgColor: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-900/20 dark:via-amber-900/20 dark:to-orange-900/20',
      borderColor: 'border-yellow-400 dark:border-yellow-600',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      iconBg: 'bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 dark:from-yellow-800/50 dark:via-amber-800/50 dark:to-orange-800/50',
      shadow: 'shadow-2xl shadow-yellow-400/70 dark:shadow-yellow-900/50',
      glow: true,
      ring: 'ring-2 ring-yellow-400 dark:ring-yellow-600',
      animate: 'animate-pulse-slow'
    },
    { 
      name: 'Elite', 
      points: 3000, 
      description: 'Earned at 3000 points milestone',
      color: 'from-pink-400 via-rose-500 to-red-500',
      bgColor: 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 dark:from-pink-900/30 dark:via-rose-900/30 dark:to-red-900/30',
      borderColor: 'border-pink-400 dark:border-pink-600',
      textColor: 'text-pink-700 dark:text-pink-300',
      iconBg: 'bg-gradient-to-br from-pink-100 via-rose-100 to-red-100 dark:from-pink-800/50 dark:via-rose-800/50 dark:to-red-800/50',
      shadow: 'shadow-2xl shadow-pink-400/70 dark:shadow-pink-900/50',
      glow: true,
      ring: 'ring-4 ring-pink-400 dark:ring-pink-600',
      animate: 'animate-pulse-slow'
    },
    { 
      name: 'Guru', 
      points: 5000, 
      description: 'Earned at 5000 points milestone',
      color: 'from-purple-500 via-fuchsia-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 dark:from-purple-900/30 dark:via-fuchsia-900/30 dark:to-pink-900/30',
      borderColor: 'border-purple-500 dark:border-purple-600',
      textColor: 'text-purple-800 dark:text-purple-200',
      iconBg: 'bg-gradient-to-br from-purple-100 via-fuchsia-100 to-pink-100 dark:from-purple-800/60 dark:via-fuchsia-800/60 dark:to-pink-800/60',
      shadow: 'shadow-2xl shadow-purple-500/80 dark:shadow-purple-900/60',
      glow: true,
      ring: 'ring-4 ring-purple-500 dark:ring-purple-600',
      animate: 'animate-pulse-slow',
      sparkle: true
    }
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <FiAward className="w-16 h-16 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How to Earn Points
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Build your reputation by contributing to the NextComm community. 
              Here's how our points system works!
            </p>
          </div>

          {/* Points Overview */}
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 mb-12 text-white shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <FiTrendingUp className="w-10 h-10" />
              <h2 className="text-3xl font-bold">Points & Reputation</h2>
            </div>
            <p className="text-lg mb-4">
              Points reflect your overall contribution to the community. Your reputation score 
              determines your standing and unlocks special privileges as you progress.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">Points</div>
                <div className="text-sm opacity-90">Your total score from all activities</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">Reputation</div>
                <div className="text-sm opacity-90">Community trust and credibility</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">Badges</div>
                <div className="text-sm opacity-90">Achievements earned through milestones</div>
              </div>
            </div>
          </div>

          {/* Earning Points Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <FiPlusCircle className="w-8 h-8 text-green-500" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Ways to Earn Points
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {earningActions.map((item, index) => (
                <div
                  key={index}
                  className={`${item.color} border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-102`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {item.action}
                        </h3>
                        <div className="text-right ml-4">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {item.points}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Rep: {item.reputation}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Losing Points Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <FiMinusCircle className="w-8 h-8 text-red-500" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Ways to Lose Points
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {losingActions.map((item, index) => (
                <div
                  key={index}
                  className={`${item.color} border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {item.action}
                        </h3>
                        <div className="text-right ml-4">
                          <div className="text-lg font-bold text-red-600 dark:text-red-400">
                            {item.points}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Rep: {item.reputation}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <FiAward className="w-8 h-8 text-yellow-500" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Badge Milestones
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
              Earn prestigious badges as you progress! Each badge gets more impressive as you climb the ranks.
            </p>
            
            {/* Grid Layout for Badges - Properly Synchronized */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className={`relative ${badge.bgColor} ${badge.borderColor} ${badge.shadow} ${badge.ring || ''} 
                    border-2 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${badge.animate || ''}
                    flex flex-col h-full overflow-hidden`}
                >
                  {/* Badge Icon with Gradient */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`${badge.iconBg} p-4 rounded-xl ${badge.shadow} relative flex-shrink-0`}>
                      <div className={`w-12 h-12 bg-gradient-to-br ${badge.color} rounded-lg flex items-center justify-center ${badge.glow ? 'animate-pulse' : ''}`}>
                        <FiAward className="w-7 h-7 text-white drop-shadow-lg" />
                      </div>
                      
                      {/* Sparkle effect for highest badge */}
                      {badge.sparkle && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Badge Name */}
                      <h3 className={`text-2xl font-extrabold ${badge.textColor} mb-2 flex items-center gap-2`}>
                        {badge.name}
                        {index >= 5 && <span className="text-yellow-500">✨</span>}
                      </h3>
                      
                      {/* Points Required */}
                      <div className="mb-3">
                        <span className={`inline-block px-4 py-1.5 bg-gradient-to-r ${badge.color} text-white rounded-full text-sm font-bold shadow-md`}>
                          {badge.points}+ points
                        </span>
                      </div>
                      
                      {/* Description */}
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Indicator - Always at bottom */}
                  <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Tier {index + 1} of {badges.length}</span>
                      <span className="font-semibold">{badge.name}</span>
                    </div>
                  </div>
                  
                  {/* Glow effect overlay for high-tier badges */}
                  {badge.glow && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-5 rounded-2xl pointer-events-none`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiTrendingUp className="w-6 h-6 text-blue-500" />
              Pro Tips to Maximize Your Points
            </h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold mt-1">•</span>
                <span><strong>Quality over quantity:</strong> Well-researched, detailed answers earn more upvotes and acceptance.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold mt-1">•</span>
                <span><strong>Answer early:</strong> Be one of the first to provide a helpful answer to trending questions.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold mt-1">•</span>
                <span><strong>Format properly:</strong> Use code blocks, images, and clear explanations to make your content stand out.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold mt-1">•</span>
                <span><strong>Be respectful:</strong> Constructive, helpful contributions get more engagement than negative ones.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold mt-1">•</span>
                <span><strong>Stay active:</strong> Regular participation builds reputation and increases visibility.</span>
              </li>
            </ul>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Start Earning Points?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Join the community and climb the leaderboard!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/ask"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg"
              >
                <FiMessageSquare className="w-5 h-5" />
                Ask a Question
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FiMessageSquare className="w-5 h-5" />
                Answer Questions
              </Link>
              <Link
                to="/leaderboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FiAward className="w-5 h-5" />
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsGuide;

