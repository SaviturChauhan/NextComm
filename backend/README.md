# Wireless Q&A Hub - Backend API

RESTful API for the Wireless Q&A Hub platform built with Node.js, Express, and MongoDB Atlas.

## Features

- User authentication and authorization
- Question management with voting
- Answer system with acceptance
- User profiles and leaderboards
- Search and filtering
- Rate limiting and security

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your MongoDB Atlas connection string and JWT secret.

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Start production server**
   ```bash
   npm start
   ```

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wireless-qa-hub
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Question Endpoints

#### Get All Questions
```http
GET /api/questions?page=1&limit=10&search=5G&category=5G&difficulty=beginner&sortBy=newest
```

#### Get Single Question
```http
GET /api/questions/:id
```

#### Create Question
```http
POST /api/questions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "How does 5G work?",
  "description": "I want to understand the basic principles...",
  "tags": ["5G", "wireless", "technology"],
  "category": "5G",
  "difficulty": "beginner"
}
```

#### Vote on Question
```http
POST /api/questions/:id/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "voteType": "upvote" // or "downvote" or "remove"
}
```

### Answer Endpoints

#### Create Answer
```http
POST /api/answers
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "5G works by using higher frequency bands...",
  "questionId": "question_id_here"
}
```

#### Accept Answer
```http
POST /api/answers/:id/accept
Authorization: Bearer <token>
```

### User Endpoints

#### Get User Profile
```http
GET /api/users/:id
```

#### Get User's Questions
```http
GET /api/users/:id/questions?page=1&limit=10
```

### Leaderboard Endpoints

#### Get Leaderboard
```http
GET /api/leaderboard?page=1&limit=20
```

#### Get Top Users
```http
GET /api/leaderboard/top
```

#### Get Leaderboard by Category
```http
GET /api/leaderboard/category/points?page=1&limit=20
```

## Database Models

### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  avatar: String,
  bio: String,
  points: Number,
  badges: [Badge],
  questionsAsked: Number,
  answersGiven: Number,
  reputation: Number,
  isActive: Boolean,
  lastActive: Date
}
```

### Question Model
```javascript
{
  title: String,
  description: String,
  author: ObjectId (User),
  tags: [String],
  votes: {
    upvotes: Number,
    downvotes: Number,
    voters: [Vote]
  },
  views: Number,
  answers: [ObjectId (Answer)],
  acceptedAnswer: ObjectId (Answer),
  isSolved: Boolean,
  difficulty: String,
  category: String
}
```

### Answer Model
```javascript
{
  content: String,
  author: ObjectId (User),
  question: ObjectId (Question),
  votes: {
    upvotes: Number,
    downvotes: Number,
    voters: [Vote]
  },
  isAccepted: Boolean,
  isEdited: Boolean,
  editedAt: Date
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation with express-validator
- MongoDB injection protection

## Error Handling

All endpoints return consistent error responses:

```javascript
{
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

## Rate Limiting

- 100 requests per 15 minutes per IP
- Applied to all routes except health check

## CORS Configuration

- Development: `http://localhost:3000`
- Production: Configure your frontend domain

## Health Check

```http
GET /api/health
```

Returns server status and timestamp.

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

### Project Structure
```
backend/
├── models/          # MongoDB models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

## Deployment

### Heroku
1. Create Heroku app
2. Set environment variables
3. Connect GitHub repository
4. Enable automatic deploys

### Environment Variables for Production
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wireless-qa-hub
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
```

## Monitoring

- Health check endpoint for monitoring
- Error logging to console
- Request logging (can be enhanced with Winston)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License

