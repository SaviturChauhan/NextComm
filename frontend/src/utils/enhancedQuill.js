import Quill from 'quill';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// Register KaTeX for formula rendering
window.katex = katex;

// Custom toolbar button for LaTeX formulas
const Parchment = Quill.import('parchment');
const BlockEmbed = Quill.import('blots/block/embed');

// Formula button handler
export const setupFormulaButton = (quill) => {
  const toolbar = quill.getModule('toolbar');
  if (!toolbar) return;

  // Add formula button handler
  toolbar.addHandler('formula', function() {
    const range = this.quill.getSelection(true);
    if (!range) return;

    const formula = prompt('Enter LaTeX formula (e.g., E = mc^2 or \\frac{a}{b}):');
    if (formula && formula.trim()) {
      const formulaText = formula.trim();
      // Insert as inline formula: $formula$
      this.quill.insertText(range.index, `$${formulaText}$`, 'user');
      this.quill.setSelection(range.index + formulaText.length + 2);
    }
  });
};

// Code syntax highlighting for code blocks
export const setupCodeHighlighting = (quill) => {
  if (!quill) return;

  // Override code block rendering
  const codeBlock = Quill.import('formats/code-block');
  
  // Store original create method
  const originalCreate = codeBlock.create;
  
  codeBlock.create = function(value) {
    const node = originalCreate.call(this, value);
    
    // If value is an object with code and language
    if (typeof value === 'object' && value.code && value.language) {
      const { code, language } = value;
      node.setAttribute('data-language', language);
      
      if (hljs.getLanguage(language)) {
        try {
          const highlighted = hljs.highlight(code, { language });
          node.innerHTML = `<code class="hljs language-${language}">${highlighted.value}</code>`;
        } catch (e) {
          node.innerHTML = `<code>${code}</code>`;
        }
      } else {
        node.innerHTML = `<code>${code}</code>`;
      }
    } else if (typeof value === 'string' && value) {
      // Try to detect language from content or use plain text
      node.innerHTML = `<code>${value}</code>`;
    }
    
    return node;
  };
};

// Enhanced modules with formula and code buttons
export const getEnhancedQuillModules = () => {
  return {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['formula', 'code'], // Custom buttons
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        'formula': function() {
          const range = this.quill.getSelection(true);
          if (!range) return;

          const formula = prompt('Enter LaTeX formula (e.g., E = mc^2):');
          if (formula && formula.trim()) {
            const formulaText = formula.trim();
            this.quill.insertText(range.index, `$${formulaText}$`, 'user');
            this.quill.setSelection(range.index + formulaText.length + 2);
          }
        },
        'code': function() {
          const range = this.quill.getSelection(true);
          if (!range) return;

          const language = prompt('Enter programming language (python, javascript, matlab, cpp, etc.):', 'python');
          if (language) {
            const code = prompt('Enter your code:');
            if (code !== null) {
              // Insert code block with language
              const lang = language.trim().toLowerCase();
              this.quill.insertText(range.index, '\n', 'user');
              this.quill.formatLine(range.index, 1, 'code-block', { code, language: lang });
            }
          }
        }
      }
    },
    clipboard: {
      matchVisual: false,
    }
  };
};

// Formats including our custom formats
export const enhancedQuillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'blockquote', 'code-block',
  'link', 'image'
];

// Process content after rendering to highlight code and render formulas
export const processContent = (htmlContent) => {
  if (!htmlContent) return htmlContent;

  let processed = htmlContent;

  // Highlight code blocks
  const codeBlocks = processed.match(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/g);
  if (codeBlocks) {
    codeBlocks.forEach((block) => {
      const codeMatch = block.match(/<code[^>]*>([\s\S]*?)<\/code>/);
      if (codeMatch) {
        const code = codeMatch[1];
        // Try to detect language from class or use plain
        const langMatch = block.match(/class="[^"]*language-(\w+)/);
        const language = langMatch ? langMatch[1] : 'plaintext';
        
        if (hljs.getLanguage(language)) {
          try {
            const highlighted = hljs.highlight(code, { language });
            processed = processed.replace(block, `<pre><code class="hljs language-${language}">${highlighted.value}</code></pre>`);
          } catch (e) {
            // Keep original if highlighting fails
          }
        }
      }
    });
  }

  return processed;
};






