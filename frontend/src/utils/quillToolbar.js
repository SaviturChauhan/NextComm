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

export const createQuillModules = (onFormulaClick, onCodeClick, onImageUpload) => {
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
        },
        'image': function() {
          // Create file input
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            // Check file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
              alert('Image size must be less than 5MB');
              return;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
              alert('Please select an image file');
              return;
            }

            const range = this.quill.getSelection(true);
            if (!range) return;

            // Show loading indicator
            this.quill.insertText(range.index, 'Uploading image...', 'user');
            this.quill.setSelection(range.index + 20);

            try {
              // Upload image using custom handler or default
              if (onImageUpload) {
                const imageUrl = await onImageUpload(file);
                if (imageUrl) {
                  // Remove loading text and insert image
                  this.quill.deleteText(range.index, 20);
                  this.quill.insertEmbed(range.index, 'image', imageUrl);
                  this.quill.setSelection(range.index + 1);
                } else {
                  // Remove loading text on error
                  this.quill.deleteText(range.index, 20);
                  // Error message is already shown by onImageUpload handler
                }
              } else {
                // Fallback: use default image handler (base64)
                console.warn('Image upload handler not provided, using base64 fallback');
                const reader = new FileReader();
                reader.onload = (e) => {
                  this.quill.deleteText(range.index, 20);
                  this.quill.insertEmbed(range.index, 'image', e.target.result);
                  this.quill.setSelection(range.index + 1);
                };
                reader.onerror = () => {
                  this.quill.deleteText(range.index, 20);
                  alert('Failed to read image file. Please try again.');
                };
                reader.readAsDataURL(file);
              }
            } catch (error) {
              console.error('Error uploading image:', error);
              this.quill.deleteText(range.index, 20);
              const errorMessage = error.message || 'Failed to upload image. Please try again.';
              alert(errorMessage);
            }
          };
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

