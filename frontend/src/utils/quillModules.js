import Quill from "quill";
import katex from "katex";
import "katex/dist/katex.min.css";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

// Custom LaTeX formula button
const Inline = Quill.import("blots/inline");

class FormulaBlot extends Inline {
  static create(value) {
    const node = super.create();
    node.setAttribute("data-formula", value);
    node.classList.add("latex-formula");
    try {
      const rendered = katex.renderToString(value, {
        throwOnError: false,
        displayMode: false,
      });
      node.innerHTML = rendered;
    } catch (e) {
      node.textContent = `$${value}$`;
    }
    return node;
  }

  static value(node) {
    return node.getAttribute("data-formula") || "";
  }
}

FormulaBlot.blotName = "formula";
FormulaBlot.tagName = "span";
FormulaBlot.className = "latex-formula";

Quill.register(FormulaBlot);

// Custom code block with syntax highlighting
const Block = Quill.import("blots/block");

class CodeBlock extends Block {
  static create(value) {
    const node = super.create();
    const { code, language } = value || {};

    if (language) {
      node.setAttribute("data-language", language);
    }

    if (code) {
      if (language && hljs.getLanguage(language)) {
        try {
          const highlighted = hljs.highlight(code, { language });
          node.innerHTML = `<pre><code class="hljs language-${language}">${highlighted.value}</code></pre>`;
        } catch (e) {
          node.innerHTML = `<pre><code>${code}</code></pre>`;
        }
      } else {
        node.innerHTML = `<pre><code>${code}</code></pre>`;
      }
    } else {
      node.innerHTML = "<pre><code></code></pre>";
    }

    return node;
  }

  static value(node) {
    const codeElement = node.querySelector("code");
    const language = node.getAttribute("data-language") || "";
    return {
      code: codeElement ? codeElement.textContent : "",
      language: language,
    };
  }
}

CodeBlock.blotName = "codeBlock";
CodeBlock.tagName = "pre";
CodeBlock.className = "ql-code-block";

Quill.register(CodeBlock);

// LaTeX formula handler
class FormulaHandler {
  constructor(quill) {
    this.quill = quill;
    this.toolbar = quill.getModule("toolbar");
    if (this.toolbar) {
      this.toolbar.addHandler("formula", this.showFormulaDialog.bind(this));
    }
  }

  showFormulaDialog() {
    const range = this.quill.getSelection(true);
    if (!range) return;

    const formula = prompt("Enter LaTeX formula (without $ signs):");
    if (formula) {
      this.insertFormula(formula.trim());
    }
  }

  insertFormula(formula) {
    const range = this.quill.getSelection(true);
    if (!range) return;

    this.quill.insertText(range.index, `$${formula}$`, "formula", formula);
    this.quill.setSelection(range.index + formula.length + 2);
  }
}

// Code syntax handler
class CodeSyntaxHandler {
  constructor(quill) {
    this.quill = quill;
    this.toolbar = quill.getModule("toolbar");
    if (this.toolbar) {
      this.toolbar.addHandler("code", this.showCodeDialog.bind(this));
    }
  }

  showCodeDialog() {
    const range = this.quill.getSelection(true);
    if (!range) return;

    const language = prompt(
      "Enter programming language (e.g., python, javascript, matlab, cpp):",
      "python"
    );
    if (language) {
      const code = prompt("Enter code:");
      if (code !== null) {
        this.insertCode(code, language.trim().toLowerCase());
      }
    }
  }

  insertCode(code, language) {
    const range = this.quill.getSelection(true);
    if (!range) return;

    // Insert code block
    this.quill.insertEmbed(range.index, "codeBlock", { code, language });
    this.quill.setSelection(range.index + 1);
  }
}

// Enhanced modules configuration
export const getQuillModules = (options = {}) => {
  const { showFormulaButton = true, showCodeButton = true } = options;

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote"],
        ...(showCodeButton ? ["code"] : []),
        ...(showFormulaButton ? ["formula"] : []),
        ["link", "image"],
        ["clean"],
      ],
      handlers: {},
    },
    clipboard: {
      matchVisual: false,
    },
    syntax: {
      highlight: (text, language) => {
        if (language && hljs.getLanguage(language)) {
          try {
            return hljs.highlight(text, { language }).value;
          } catch (err) {
            return text;
          }
        }
        return text;
      },
    },
  };

  return modules;
};

// Initialize custom handlers
export const initializeQuillHandlers = (quill) => {
  if (quill) {
    new FormulaHandler(quill);
    new CodeSyntaxHandler(quill);
  }
};

// Formats for Quill
export const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "blockquote",
  "code",
  "codeBlock",
  "formula",
  "link",
  "image",
];

export { FormulaHandler, CodeSyntaxHandler };
