import React, { useState, useEffect } from "react";
import { FiX, FiCode } from "react-icons/fi";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

// Component to safely render formula preview
const FormulaPreview = ({ formula, isBlock }) => {
  // Simple rendering - errors will be caught by React's error boundary or handled gracefully by KaTeX
  // KaTeX's throwOnError is set to false in react-katex by default, so it won't throw
  if (isBlock) {
    return <BlockMath math={formula} throwOnError={false} />;
  } else {
    return <InlineMath math={formula} throwOnError={false} />;
  }
};

const FormulaModal = ({ isOpen, onClose, onConfirm, initialValue = "" }) => {
  const [formula, setFormula] = useState(initialValue);
  const [isBlock, setIsBlock] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setFormula(initialValue);
      setIsBlock(false);
      setError("");
      setPreview(null);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialValue]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (formula.trim()) {
      // Validate formula by trying to render it (we'll catch errors in the render)
      setPreview(formula.trim());
      setError("");
    } else {
      setPreview(null);
      setError("");
    }
  }, [formula, isBlock]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formula.trim()) {
      setError("Please enter a formula");
      return;
    }

    onConfirm(formula.trim(), isBlock);
    setFormula("");
    setIsBlock(false);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full transform transition-all duration-300 animate-fade-in scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
              <FiCode className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Insert LaTeX Formula
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Enter a LaTeX formula to insert into your content
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Formula Type Toggle */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Formula Type:
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsBlock(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !isBlock
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Inline ($...$)
                </button>
                <button
                  type="button"
                  onClick={() => setIsBlock(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isBlock
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Block ($$...$$)
                </button>
              </div>
            </div>

            {/* Formula Input */}
            <div>
              <label
                htmlFor="formula"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                LaTeX Formula {isBlock ? "(Block)" : "(Inline)"}
              </label>
              <textarea
                id="formula"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isBlock
                    ? "Enter block formula, e.g., \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}"
                    : "Enter inline formula, e.g., E = mc^2 or \\frac{a}{b}"
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                rows="3"
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Tip: Use LaTeX syntax. Common examples:{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                  {"\\frac{a}{b}"}
                </code>
                ,{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                  {"\\sum_{i=1}^{n}"}
                </code>
                ,{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                  {"\\int_{0}^{\\infty}"}
                </code>
              </p>
            </div>

            {/* Preview */}
            {preview && !error && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview:
                </p>
                <div className="flex items-center justify-center min-h-[60px] p-4 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                  <FormulaPreview formula={preview} isBlock={isBlock} />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              Insert Formula
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormulaModal;
