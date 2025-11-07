# Advanced Rich Text Editor - LaTeX & Code Syntax Highlighting

This document describes the enhanced rich text editor features added to NextComm.

## Features Added

### 1. LaTeX/KaTeX Formula Support

Users can now insert mathematical formulas and equations using LaTeX syntax:

- **Inline Formulas**: Use `$...$` for inline formulas (e.g., `$E = mc^2$`)
- **Block Formulas**: Use `$$...$$` for displayed equations (e.g., `$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$`)

**How to Use:**
1. Click the **Σ (Sigma)** button in the editor toolbar
2. Enter your LaTeX formula (without the $ signs)
3. The formula will be inserted and rendered using KaTeX

**Examples:**
- `E = mc^2` → Renders as: E = mc²
- `\frac{a}{b}` → Renders as a fraction
- `\sum_{i=1}^{n} x_i` → Renders as summation
- `\int_{0}^{\infty} f(x) dx` → Renders as integral

### 2. Code Syntax Highlighting

Users can now insert code blocks with proper syntax highlighting for various programming languages.

**Supported Languages:**
- Python
- JavaScript
- MATLAB
- C/C++
- Java
- HTML/CSS
- And many more (via highlight.js)

**How to Use:**
1. Click the **</> (Code)** button in the editor toolbar
2. Enter the programming language (e.g., `python`, `javascript`, `matlab`)
3. Paste or type your code
4. The code will be inserted with syntax highlighting

**Alternative Method:**
- You can also use the existing "code-block" button and manually type code
- Code blocks are automatically highlighted when displayed

## Implementation Details

### Files Modified/Created

1. **`frontend/src/utils/quillToolbar.js`**
   - Custom toolbar configuration with LaTeX and Code buttons
   - Handlers for formula and code insertion

2. **`frontend/src/pages/AskQuestion.js`**
   - Updated to use enhanced editor with LaTeX and code support
   - Added syntax highlighting for code blocks in editor

3. **`frontend/src/pages/QuestionDetails.js`**
   - Updated answer editor with enhanced features
   - Enhanced content rendering with syntax highlighting and LaTeX

4. **`frontend/src/index.css`**
   - Added styles for syntax highlighting
   - Added styles for LaTeX formula rendering
   - Dark mode support for code blocks

5. **`frontend/src/components/common/ContentRenderer.js`** (Optional utility)
   - Reusable component for rendering content with formulas and code

### Dependencies Added

- `highlight.js` - For code syntax highlighting

### Existing Dependencies Used

- `katex` - Already installed, used for LaTeX rendering
- `react-katex` - Already installed, React components for KaTeX
- `react-quill` - Rich text editor

## Usage Examples

### Example 1: Inline Formula
```
The energy-mass equivalence is $E = mc^2$ where E is energy.
```

### Example 2: Block Formula
```
The Gaussian integral is:
$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$
```

### Example 3: Code Block
```python
def calculate_path_loss(distance, frequency):
    """Calculate free space path loss"""
    c = 3e8  # Speed of light
    wavelength = c / frequency
    path_loss = (4 * np.pi * distance / wavelength) ** 2
    return 10 * np.log10(path_loss)
```

### Example 4: MATLAB Code
```matlab
% MIMO channel capacity
H = randn(Nr, Nt) + 1j*randn(Nr, Nt);
capacity = log2(det(eye(Nr) + (SNR/Nt) * H * H'));
```

## Technical Notes

### LaTeX Formula Rendering
- Formulas are detected using regex patterns: `$...$` for inline and `$$...$$` for block
- Formulas are rendered using KaTeX which is fast and doesn't require MathJax
- Formulas are preserved when pasting content

### Code Syntax Highlighting
- Code blocks are highlighted using highlight.js
- Language is detected from the `data-language` attribute or class name
- Falls back to plain text if language is not recognized
- Supports dark mode with appropriate color schemes

### Editor Integration
- Custom toolbar buttons are registered with Quill
- Formula and code buttons appear in the toolbar
- Syntax highlighting happens automatically when code blocks are inserted
- Content is processed both in the editor and when displaying

## Styling

### Code Blocks
- Dark background (#1e1e1e) for better readability
- Syntax highlighting with language-specific colors
- Rounded corners and proper padding
- Scrollable for long code blocks

### LaTeX Formulas
- Inline formulas: Highlighted with light blue background
- Block formulas: Centered with padding and background
- Proper spacing and alignment

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- KaTeX and highlight.js work in all modern browsers
- No additional polyfills required

## Future Enhancements

Potential improvements:
1. Formula preview while typing
2. Code block language auto-detection
3. Copy code button for code blocks
4. Line numbers for code blocks
5. Formula editor with visual editor
6. More LaTeX packages support

## Troubleshooting

### Formulas not rendering
- Ensure formulas are wrapped in `$...$` or `$$...$$`
- Check browser console for KaTeX errors
- Verify KaTeX CSS is loaded

### Code not highlighting
- Ensure language is specified correctly
- Check that highlight.js supports the language
- Verify highlight.js CSS is loaded

### Editor buttons not showing
- Clear browser cache
- Verify `quillToolbar.js` is imported correctly
- Check browser console for errors

## Notes

- LaTeX formulas are stored as text with `$` delimiters in the database
- Code blocks are stored as HTML `<pre><code>` elements
- Both are processed when rendering content
- The editor preserves formatting when pasting content

