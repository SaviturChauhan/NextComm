import React, { useEffect, useRef } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

/**
 * Component to render rich text content with LaTeX formulas and syntax highlighting
 */
const ContentRenderer = ({ content, className = '' }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current || !content) return;

    // Process code blocks for syntax highlighting
    const codeBlocks = contentRef.current.querySelectorAll('pre code, pre.ql-syntax');
    codeBlocks.forEach((block) => {
      // Skip if already highlighted
      if (block.classList.contains('hljs')) return;

      const code = block.textContent || '';
      const lang = block.getAttribute('data-language') || 
                  block.className.match(/language-(\w+)/)?.[1] ||
                  block.parentElement?.getAttribute('data-language') ||
                  'plaintext';

      if (hljs.getLanguage(lang)) {
        try {
          const highlighted = hljs.highlight(code, { language: lang });
          block.innerHTML = highlighted.value;
          block.classList.add('hljs');
          block.classList.add(`language-${lang}`);
        } catch (e) {
          console.error('Error highlighting code:', e);
        }
      }
    });
  }, [content]);

  if (!content) return null;

  // Check if content contains LaTeX formulas
  const hasFormulas = content.includes('$');

  if (!hasFormulas) {
    // Simple HTML rendering without formulas
    return (
      <div
        ref={contentRef}
        className={`prose dark:prose-invert max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Process content with LaTeX formulas
  try {
    // Split content by LaTeX formulas
    const parts = [];
    let lastIndex = 0;
    
    // Match block formulas first ($$...$$)
    const blockFormulaRegex = /\$\$([^$]+?)\$\$/g;
    const blockMatches = [];
    let blockMatch;
    while ((blockMatch = blockFormulaRegex.exec(content)) !== null) {
      blockMatches.push({
        index: blockMatch.index,
        length: blockMatch[0].length,
        formula: blockMatch[1].trim(),
        isBlock: true
      });
    }

    // Match inline formulas ($...$), excluding those inside block formulas
    const inlineFormulaRegex = /\$([^$\n]+?)\$/g;
    const inlineMatches = [];
    let inlineMatch;
    while ((inlineMatch = inlineFormulaRegex.exec(content)) !== null) {
      const isInsideBlock = blockMatches.some(bm => 
        inlineMatch.index >= bm.index && inlineMatch.index < bm.index + bm.length
      );
      if (!isInsideBlock) {
        inlineMatches.push({
          index: inlineMatch.index,
          length: inlineMatch[0].length,
          formula: inlineMatch[1].trim(),
          isBlock: false
        });
      }
    }

    // Combine and sort all matches
    const allMatches = [...blockMatches, ...inlineMatches].sort((a, b) => a.index - b.index);

    if (allMatches.length === 0) {
      return (
        <div
          ref={contentRef}
          className={`prose dark:prose-invert max-w-none ${className}`}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    // Build parts array
    allMatches.forEach((match, idx) => {
      // Add text before formula
      if (match.index > lastIndex) {
        const textPart = content.substring(lastIndex, match.index);
        if (textPart) {
          parts.push({ type: 'html', content: textPart, key: `text-${idx}` });
        }
      }

      // Add formula
      parts.push({
        type: 'formula',
        formula: match.formula,
        isBlock: match.isBlock,
        key: `formula-${idx}`
      });

      lastIndex = match.index + match.length;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      const textPart = content.substring(lastIndex);
      if (textPart) {
        parts.push({ type: 'html', content: textPart, key: 'text-final' });
      }
    }

    return (
      <div
        ref={contentRef}
        className={`prose dark:prose-invert max-w-none ${className}`}
      >
        {parts.map((part) => {
          if (part.type === 'formula') {
            try {
              if (part.isBlock) {
                return <BlockMath key={part.key} math={part.formula} />;
              } else {
                return <InlineMath key={part.key} math={part.formula} />;
              }
            } catch (e) {
              console.error('Error rendering formula:', e);
              return (
                <span key={part.key} className="font-mono text-red-500">
                  {part.isBlock ? `$$${part.formula}$$` : `$${part.formula}$`}
                </span>
              );
            }
          } else {
            return (
              <span
                key={part.key}
                dangerouslySetInnerHTML={{ __html: part.content }}
              />
            );
          }
        })}
      </div>
    );
  } catch (error) {
    console.error('Error rendering content:', error);
    // Fallback to simple HTML rendering
    return (
      <div
        ref={contentRef}
        className={`prose dark:prose-invert max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
};

export default ContentRenderer;


