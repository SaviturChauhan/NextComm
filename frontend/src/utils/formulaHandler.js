// Utility functions for handling LaTeX formulas in ReactQuill

/**
 * Preserves LaTeX formulas in pasted text
 * Converts LaTeX formulas ($...$ or $$...$$) to a format that ReactQuill can handle
 */
export const preserveFormulasOnPaste = (html) => {
  if (!html) return html;

  // Match inline formulas: $...$ (non-greedy to avoid matching across multiple formulas)
  html = html.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
    // Escape HTML and preserve the formula
    const escaped = formula.trim();
    return `<span class="latex-formula" data-formula="${escaped.replace(/"/g, '&quot;')}">$${escaped}$</span>`;
  });

  // Match block formulas: $$...$$
  html = html.replace(/\$\$([^$]+?)\$\$/g, (match, formula) => {
    const escaped = formula.trim();
    return `<div class="latex-formula-block" data-formula="${escaped.replace(/"/g, '&quot;')}">$$${escaped}$$</div>`;
  });

  return html;
};

/**
 * Renders LaTeX formulas in HTML content using KaTeX
 */
export const renderFormulas = (html) => {
  if (!html) return html;

  // Import KaTeX dynamically
  const katex = require('katex');
  
  try {
    // Render inline formulas
    html = html.replace(/<span class="latex-formula" data-formula="([^"]+)">.*?<\/span>/g, (match, formula) => {
      try {
        const rendered = katex.renderToString(formula, {
          throwOnError: false,
          displayMode: false
        });
        return rendered;
      } catch (e) {
        console.error('Error rendering inline formula:', e);
        return `<span class="latex-error">$${formula}$</span>`;
      }
    });

    // Render block formulas
    html = html.replace(/<div class="latex-formula-block" data-formula="([^"]+)">.*?<\/div>/g, (match, formula) => {
      try {
        const rendered = katex.renderToString(formula, {
          throwOnError: false,
          displayMode: true
        });
        return `<div class="latex-block">${rendered}</div>`;
      } catch (e) {
        console.error('Error rendering block formula:', e);
        return `<div class="latex-error">$$${formula}$$</div>`;
      }
    });

    // Also handle raw LaTeX in $...$ format (for backward compatibility)
    html = html.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
      try {
        const rendered = katex.renderToString(formula.trim(), {
          throwOnError: false,
          displayMode: false
        });
        return rendered;
      } catch (e) {
        return match; // Return original if rendering fails
      }
    });

    // Handle block formulas $$...$$
    html = html.replace(/\$\$([^$]+?)\$\$/g, (match, formula) => {
      try {
        const rendered = katex.renderToString(formula.trim(), {
          throwOnError: false,
          displayMode: true
        });
        return `<div class="latex-block">${rendered}</div>`;
      } catch (e) {
        return match; // Return original if rendering fails
      }
    });
  } catch (e) {
    console.error('Error in renderFormulas:', e);
  }

  return html;
};



