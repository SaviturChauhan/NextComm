import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const CustomSelect = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select...',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle both string and object options
  const normalizeOptions = options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  // Find the selected option - check both value and label for matching
  const selectedOption = normalizeOptions.find(opt => {
    if (!value && value !== '') return false;
    // Exact match on value
    if (opt.value === value) return true;
    // Match on label (useful when value is converted for display)
    if (opt.label === value) return true;
    // Case-insensitive match
    if (typeof value === 'string' && typeof opt.value === 'string') {
      if (opt.value.toLowerCase() === value.toLowerCase()) return true;
      if (opt.label.toLowerCase() === value.toLowerCase()) return true;
    }
    return false;
  });
  
  // Use the selected option's label if found, otherwise use the value or placeholder
  const displayValue = selectedOption 
    ? selectedOption.label 
    : (value && normalizeOptions.length > 0 ? value : placeholder);

  const handleSelect = (optionValue) => {
    // If option is an object, use its value; otherwise use the optionValue directly
    const selectedOpt = normalizeOptions.find(opt => opt.value === optionValue || opt.label === optionValue);
    onChange(selectedOpt ? selectedOpt.value : optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-sm font-normal text-left
          bg-white dark:bg-gray-700
          border border-gray-300 dark:border-gray-600
          rounded-lg
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          transition-all duration-200
          flex items-center justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary dark:hover:border-blue-400'}
          ${isOpen ? 'ring-2 ring-primary border-primary dark:border-blue-400' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-gray-900 dark:text-gray-100 truncate">
          {displayValue}
        </span>
        <FiChevronDown 
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden animate-fade-in">
          <ul 
            className="max-h-60 overflow-auto"
            role="listbox"
          >
            {normalizeOptions.map((option, index) => {
              const isSelected = value === option.value || value === option.label;
              return (
                <li
                  key={option.value || index}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    px-3 py-2.5 text-sm cursor-pointer
                    transition-colors duration-150
                    ${isSelected 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-300 font-semibold' 
                      : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }
                  `}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {isSelected && (
                      <svg 
                        className="w-4 h-4 text-primary dark:text-blue-400" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;


