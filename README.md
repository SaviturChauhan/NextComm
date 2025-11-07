# NextComm

A comprehensive Q&A platform for wireless communication students and professionals, built with React frontend and Node.js/Express backend with MongoDB Atlas.

## Features

- **User Authentication**: Secure registration and login system
- **Question Management**: Ask, edit, and delete questions with rich text editor
- **Answer System**: Provide answers with voting and acceptance features
- **Leaderboard**: Track top contributors by points, questions, and answers
- **User Profiles**: View user activity and achievements
- **Search & Filter**: Find questions by keywords, tags, category, and difficulty
- **Responsive Design**: Mobile-friendly interface with dark/light theme support
- **Real-time Updates**: Live voting and answer notifications

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- React Quill (Rich Text Editor)
- React Hot Toast (Notifications)
- React Icons
- Axios (HTTP Client)

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose (ODM)
- JWT Authentication
- Bcrypt (Password Hashing)
- Express Validator
- CORS
- Helmet (Security)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nextcomm
   ```

2. **Set up the Backend**
   ```bash
   cd backend
   npm install
   cp env.example .env
   ```
   
   Update the `.env` file with your MongoDB Atlas connection string and JWT secret:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nextcomm?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   ```

3. **Set up the Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the Development Servers**
   
   Backend (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Questions
- `GET /api/questions` - Get all questions (with pagination and filters)
- `GET /api/questions/:id` - Get single question
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/vote` - Vote on question

### Answers
- `POST /api/answers` - Create new answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer
- `POST /api/answers/:id/vote` - Vote on answer
- `POST /api/answers/:id/accept` - Accept answer

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/questions` - Get user's questions
- `GET /api/users/:id/answers` - Get user's answers
- `PUT /api/users/:id` - Update user profile

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/leaderboard/top` - Get top 3 users
- `GET /api/leaderboard/rank/:userId` - Get user's rank
- `GET /api/leaderboard/category/:category` - Get leaderboard by category

## Database Schema

### User
- username, email, password
- avatar, bio
- points, badges, reputation
- questionsAsked, answersGiven
- isActive, lastActive

### Question
- title, description, author
- tags, category, difficulty
- votes (upvotes, downvotes, voters)
- views, answers, acceptedAnswer
- isSolved, createdAt, updatedAt

### Answer
- content, author, question
- votes (upvotes, downvotes, voters)
- isAccepted, isEdited, editedAt
- createdAt, updatedAt

## Features in Detail

### Question System
- Rich text editor for detailed questions
- Tag system for categorization
- Difficulty levels (Beginner, Intermediate, Advanced)
- Category classification (5G, 4G, MIMO, OFDM, etc.)
- Voting system for question quality

### Answer System
- Rich text answers with formatting
- Voting system for answer quality
- Answer acceptance by question author
- Edit history tracking

### User System
- Profile management with avatars
- Point-based reputation system
- Badge achievements
- Activity tracking

### Leaderboard
- Multiple ranking categories
- Real-time updates
- User statistics

## Deployment

### Backend Deployment (Heroku)
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Connect GitHub repository
4. Enable automatic deploys

### Frontend Deployment (Netlify/Vercel)
1. Build the React app: `npm run build`
2. Deploy the build folder to your hosting service
3. Set environment variables for API URL

### MongoDB Atlas
1. Create a MongoDB Atlas cluster
2. Set up database user with appropriate permissions
3. Whitelist your server IP addresses
4. Get connection string and update environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@nextcomm.com or create an issue in the repository.

