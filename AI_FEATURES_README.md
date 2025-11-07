# AI-Powered Features

NextComm now includes AI-powered features using Google's Gemini API to enhance the user experience.

## Features

### 1. Duplicate Question Detection
- **Location**: Ask Question page
- **Functionality**: As users type their question title and description, the system automatically checks for similar questions in real-time
- **Technology**: Uses Gemini API for semantic similarity detection
- **Fallback**: If API is unavailable, falls back to keyword-based matching
- **User Experience**: 
  - Shows up to 5 similar questions
  - Displays as a dismissible alert
  - Clickable links to view similar questions
  - Non-blocking - users can still post their question

### 2. AI-Assisted Answer Generation
- **Location**: Question Details page
- **Functionality**: Generates draft answers using AI when users click "Get AI Suggestion"
- **Technology**: Uses Gemini API to generate contextual, technical answers
- **Features**:
  - Takes into account existing answers for context
  - Generates HTML-formatted content compatible with the rich text editor
  - Clearly labeled as AI-generated
  - Users can review, edit, and verify before posting

## Setup Instructions

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### 2. Configure Backend

Add the API key to your backend `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Restart Backend Server

After adding the API key, restart your backend server:

```bash
cd backend
npm run dev
```

## How It Works

### Duplicate Detection

1. User types a question (title + description)
2. After 1 second of no typing (debounced), system checks for duplicates
3. Compares against the 100 most recent questions
4. Uses semantic similarity to find related questions
5. Displays results in a non-intrusive alert

### AI Answer Generation

1. User clicks "Get AI Suggestion" button on a question page
2. System sends question title, description, and existing answers to Gemini API
3. AI generates a comprehensive answer in HTML format
4. Answer is displayed in a modal with clear AI disclaimers
5. User can copy or insert the suggestion into the editor
6. User reviews and edits before posting

## API Endpoints

### POST `/api/ai/check-duplicates`
- **Auth**: Required
- **Body**: 
  ```json
  {
    "title": "Question title",
    "description": "Question description (optional)"
  }
  ```
- **Response**: 
  ```json
  {
    "duplicates": [...],
    "count": 3
  }
  ```

### POST `/api/ai/generate-answer`
- **Auth**: Required
- **Body**: 
  ```json
  {
    "questionId": "question_id_here"
  }
  ```
- **Response**: 
  ```json
  {
    "answer": "HTML formatted answer",
    "disclaimer": "This is an AI-generated suggestion..."
  }
  ```

## Fallback Behavior

- If `GEMINI_API_KEY` is not configured, duplicate detection uses keyword-based matching
- AI answer generation will show an error message if API key is missing
- All features gracefully degrade if the API is unavailable

## Privacy & Ethics

- All AI-generated content is clearly labeled
- Users are encouraged to review and verify AI suggestions
- No user data is shared with Google beyond what's necessary for API calls
- AI suggestions are meant to assist, not replace human knowledge

## Limitations

- Duplicate detection checks only the 100 most recent questions
- AI answers may contain inaccuracies and should always be reviewed
- API rate limits may apply (check Google's pricing)
- Requires internet connection for AI features

## Future Enhancements

- Real-time duplicate detection as user types (currently debounced)
- AI-powered tag suggestions
- AI content moderation
- Personalized answer recommendations
- Advanced semantic search

