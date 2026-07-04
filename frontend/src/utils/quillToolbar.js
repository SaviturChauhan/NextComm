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
          // Get current selection and preserve content
          const quill = this.quill;
          const range = quill.getSelection(true);
          if (!range) {
            // If no selection, set cursor to end
            const length = quill.getLength();
            quill.setSelection(length - 1, 0);
            return;
          }

          // Create file input
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            // Only accept image files
            if (!file.type.startsWith('image/')) {
              alert('Please select an image file');
              return;
            }

            // Get current selection again (in case it changed)
            let currentRange = quill.getSelection(true);
            if (!currentRange) {
              // If no selection, insert at end
              const length = quill.getLength();
              currentRange = { index: length - 1, length: 0 };
            }

            // Preserve current content by getting the full content

            // Show loading indicator
            quill.insertText(currentRange.index, 'Uploading image...', 'user');
            const loadingIndex = currentRange.index;
            const loadingTextLength = 20;
            quill.setSelection(loadingIndex + loadingTextLength, 0);

            try {
              // Upload image using custom handler or default
              if (onImageUpload) {
                const imageUrl = await onImageUpload(file);
                if (imageUrl) {
                  // Remove loading text - search for it in the document
                  const fullText = quill.getText();
                  const loadingTextIndex = fullText.indexOf('Uploading image...');
                  
                  if (loadingTextIndex !== -1) {
                    
                    // Find the actual index in Quill's delta
                    const contents = quill.getContents();
                    let textPos = 0;
                    
                    for (let i = 0; i < contents.ops.length; i++) {
                      const op = contents.ops[i];
                      if (typeof op.insert === 'string') {
                        if (textPos <= loadingTextIndex && loadingTextIndex < textPos + op.insert.length) {
                          break;
                        }
                        textPos += op.insert.length;
                      }
                    }
                    
                    // Delete the loading text using the stored index
                    quill.deleteText(loadingIndex, loadingTextLength);
                  }
                  
                  // Get selection after removing loading text
                  let insertRange = quill.getSelection(true);
                  if (!insertRange) {
                    // If no selection, insert at the position where loading text was
                    insertRange = { index: loadingIndex, length: 0 };
                  }
                  
                  // Insert image at the correct position
                  quill.insertEmbed(insertRange.index, 'image', imageUrl, 'user');
                  
                  // Move cursor after image
                  quill.setSelection(insertRange.index + 1, 0);
                  
                  // Force ReactQuill to recognize the change by triggering a text-change event
                  // This ensures the onChange handler in ReactQuill component is called
                  const event = new Event('text-change', { bubbles: true });
                  quill.root.dispatchEvent(event);
                  
                  // Also trigger input event to ensure React detects the change
                  const inputEvent = new Event('input', { bubbles: true });
                  quill.root.dispatchEvent(inputEvent);
                } else {
                  // Remove loading text on error - use the stored index
                  quill.deleteText(loadingIndex, loadingTextLength);
                  quill.setSelection(loadingIndex, 0);
                  // Error message is already shown by onImageUpload handler
                }
              } else {
                // Fallback: use default image handler (base64)
                console.warn('Image upload handler not provided, using base64 fallback');
                const reader = new FileReader();
                reader.onload = (e) => {
                  // Remove loading text using stored index
                  quill.deleteText(loadingIndex, loadingTextLength);
                  
                  // Insert image at the position where loading text was
                  quill.insertEmbed(loadingIndex, 'image', e.target.result, 'user');
                  quill.setSelection(loadingIndex + 1, 0);
                  
                  // Force ReactQuill to recognize the change
                  const event = new Event('text-change', { bubbles: true });
                  quill.root.dispatchEvent(event);
                  const inputEvent = new Event('input', { bubbles: true });
                  quill.root.dispatchEvent(inputEvent);
                };
                reader.onerror = () => {
                  // Remove loading text on error
                  quill.deleteText(loadingIndex, loadingTextLength);
                  quill.setSelection(loadingIndex, 0);
                  alert('Failed to read image file. Please try again.');
                };
                reader.readAsDataURL(file);
              }
            } catch (error) {
              console.error('Error uploading image:', error);
              // Remove loading text on error using stored index
              quill.deleteText(loadingIndex, loadingTextLength);
              quill.setSelection(loadingIndex, 0);
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

