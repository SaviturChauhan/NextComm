// Custom toolbar configuration with LaTeX and Code buttons
import Quill from 'quill';

// Register custom toolbar buttons
const icons = Quill.import('ui/icons');

// Formula button icon (Sigma symbol)
icons['formula'] = `
  <svg viewBox="0 0 18 18">
    <text x="9" y="14" font-size="14" font-weight="bold" text-anchor="middle" fill="currentColor">Σ</text>
  </svg>
`;

// Code button icon
icons['code'] = `
  <svg viewBox="0 0 18 18">
    <polyline class="ql-stroke" points="5 7 3 9 5 11"></polyline>
    <polyline class="ql-stroke" points="13 7 15 9 13 11"></polyline>
    <line class="ql-stroke" x1="10" x2="8" y1="5" y2="13"></line>
  </svg>
`;

export const createQuillModules = (onFormulaClick, onCodeClick) => {
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
        'header': function(value) {
          // Handle header format selection (1, 2, 3, or false for Normal)
          // This ensures the dropdown works properly
          this.quill.format('header', value);
        },
        'formula': function() {
          const range = this.quill.getSelection(true);
          if (!range) {
            return;
          }
          
          // Store quill instance and range for later use
          if (onFormulaClick) {
            onFormulaClick(this.quill, range);
          }
        },
        'code': function() {
          const range = this.quill.getSelection(true);
          if (!range) {
            return;
          }
          
          // Store quill instance and range for later use
          if (onCodeClick) {
            onCodeClick(this.quill, range);
          }
        }
      }
    },
    clipboard: {
      matchVisual: false,
    }
  };
};

export const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'blockquote', 'code-block',
  'link', 'image',
  'formula', 'code' // Custom formats for formula and code
];

