import React from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle, FiX, FiExternalLink } from "react-icons/fi";

const DuplicateQuestionAlert = ({ duplicates, onDismiss, onViewDuplicate }) => {
  if (!duplicates || duplicates.length === 0) return null;

  return (
    <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 animate-slide-down">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <FiAlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Similar questions found
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
            We found {duplicates.length} similar question
            {duplicates.length > 1 ? "s" : ""} that might have the answer you're
            looking for:
          </p>
          <div className="space-y-2 mb-3">
            {duplicates.slice(0, 3).map((question) => (
              <Link
                key={question._id}
                to={`/question/${question._id}`}
                onClick={onViewDuplicate}
                className="block p-2 bg-white dark:bg-gray-800 rounded border border-yellow-300 dark:border-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 flex-1">
                    {question.title}
                  </p>
                  <FiExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                </div>
                {question.author && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    by {question.author.username}
                  </p>
                )}
              </Link>
            ))}
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            Please check if your question has already been answered. If not, you
            can still post your question.
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors"
            aria-label="Dismiss"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DuplicateQuestionAlert;
