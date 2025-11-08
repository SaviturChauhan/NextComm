const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Strip HTML tags from text
 */
const stripHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
};

/**
 * Check for duplicate questions using semantic similarity
 */
const findDuplicateQuestions = async (
  questionTitle,
  questionDescription,
  existingQuestions
) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not set, skipping duplicate detection");
    return [];
  }

  try {
    // Use gemini-2.5-flash (faster and cheaper) or gemini-2.5-pro
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Strip HTML from descriptions for better matching
    const cleanDescription = stripHtml(questionDescription).substring(0, 500);

    // Create a prompt to find similar questions
    const prompt = `You are a question similarity detector for a wireless communication Q&A platform. Given a new question, find similar questions from the list below.

New Question Title: ${questionTitle}
New Question Description: ${cleanDescription}

Existing Questions:
${existingQuestions
  .slice(0, 50)
  .map(
    (q, idx) =>
      `${idx + 1}. Title: "${q.title}"\n   Description: "${stripHtml(
        q.description
      ).substring(0, 200)}..."`
  )
  .join("\n\n")}

Analyze the semantic similarity and return ONLY a JSON array of question indices (0-based) that are similar to the new question. 
If no similar questions exist, return an empty array [].
Consider questions similar if they:
1. Ask about the same technical concept or topic
2. Have similar intent or goal
3. Could be answered with the same solution
4. Discuss related wireless communication topics (e.g., MIMO, OFDM, 5G, signal processing)

Return format: [0, 2, 5] or []

Response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Parse JSON response
    let similarIndices = [];
    try {
      // Extract JSON array from response
      const jsonMatch = text.match(/\[[\d,\s]*\]/);
      if (jsonMatch) {
        similarIndices = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Error parsing duplicate detection response:", e);
      return [];
    }

    // Return similar questions (limit to top 5)
    return similarIndices
      .slice(0, 5)
      .map((idx) => existingQuestions[idx])
      .filter(Boolean);
  } catch (error) {
    console.error("Error in duplicate question detection:", error);
    return [];
  }
};

/**
 * Generate AI-assisted answer suggestion
 */
const generateAnswerSuggestion = async (
  questionTitle,
  questionDescription,
  existingAnswers = []
) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  try {
    // Use gemini-2.5-flash for faster responses (or gemini-2.5-pro for more advanced)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Strip HTML from question description
    const cleanDescription = stripHtml(questionDescription);

    // Create context from existing answers if available
    const context =
      existingAnswers.length > 0
        ? `\n\nExisting answers for reference (please provide a different or complementary perspective):\n${existingAnswers
            .slice(0, 3)
            .map(
              (a, idx) =>
                `${idx + 1}. ${stripHtml(a.content).substring(0, 300)}...`
            )
            .join("\n\n")}`
        : "";

    const prompt = `You are an expert in wireless communication, signal processing, and related technologies. Generate a helpful, accurate, and well-formatted answer for the following question.

Question Title: ${questionTitle}
Question Description: ${cleanDescription}${context}

Please provide a comprehensive answer in HTML format that:
1. Directly addresses the question
2. Includes technical details and clear explanations
3. Is well-structured with paragraphs
4. Uses proper technical terminology (MIMO, OFDM, 5G, RF, signal processing, etc.)
5. If applicable, includes examples, formulas, or code snippets
6. Uses HTML tags for formatting: <p> for paragraphs, <strong> for emphasis, <code> for code, <ul>/<li> for lists

Format the answer as HTML that can be displayed in a rich text editor. Use proper HTML tags but keep it clean and readable.

Important: This is an AI-generated suggestion. The user should review, verify, and edit this answer before posting.

Generate the answer in HTML format:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let answer = response.text().trim();

    // Clean up the response - remove markdown code blocks if present
    answer = answer
      .replace(/```html\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // If answer doesn't have HTML tags, wrap in paragraph tags
    if (!answer.includes("<")) {
      answer = `<p>${answer
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n/g, "<br>")}</p>`;
    }

    return answer;
  } catch (error) {
    console.error("Error generating AI answer:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      response: error.response?.data,
    });

    // Provide more specific error messages
    if (error.message?.includes("API key")) {
      throw new Error("Invalid API key. Please check your GEMINI_API_KEY.");
    } else if (
      error.message?.includes("quota") ||
      error.message?.includes("rate limit")
    ) {
      throw new Error("API quota exceeded. Please try again later.");
    } else if (error.message?.includes("safety")) {
      throw new Error(
        "Content was blocked by safety filters. Please try rephrasing the question."
      );
    } else {
      throw new Error(
        `Failed to generate AI answer: ${error.message || "Please try again."}`
      );
    }
  }
};

/**
 * Check for duplicates using simpler text matching (fallback)
 */
const findDuplicateQuestionsFallback = async (
  questionTitle,
  existingQuestions
) => {
  // Simple keyword-based similarity
  const titleWords = questionTitle
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const similar = existingQuestions.filter((q) => {
    const qWords = q.title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const commonWords = titleWords.filter((w) => qWords.includes(w));
    const similarity =
      commonWords.length / Math.max(titleWords.length, qWords.length);
    return similarity > 0.4; // 40% word overlap
  });

  return similar.slice(0, 5); // Return top 5 similar
};

module.exports = {
  findDuplicateQuestions,
  generateAnswerSuggestion,
  findDuplicateQuestionsFallback,
  stripHtml,
};
