# NextComm

<div align="center">

![NextComm Logo](https://img.shields.io/badge/NextComm-Wireless%20Communication-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

**A comprehensive Q&A platform for wireless communication students and professionals**

[Features](#-features) • [Installation](#-getting-started) • [API Documentation](#-api-endpoints) • [Deployment](#-deployment) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Key Features Documentation](#-key-features-documentation)
- [Admin System](#-admin-system)
- [AI Features](#-ai-features)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

NextComm is a modern Q&A platform specifically designed for wireless communication enthusiasts, students, and professionals. It provides a collaborative environment for asking questions, sharing knowledge, and building expertise in areas like MIMO systems, OFDM, channel models, and more.

### Key Highlights

- 🚀 **Modern Tech Stack**: Built with React 18, Node.js, and MongoDB
- 🎨 **Beautiful UI**: Responsive design with dark/light theme support
- 📝 **Rich Text Editor**: LaTeX formulas and code syntax highlighting
- 🤖 **AI-Powered**: Duplicate question detection and AI-assisted answers
- 🏆 **Gamification**: Points system, badges, and leaderboard
- 📱 **Real-time Notifications**: In-app notifications for user interactions
- 🔐 **Secure Authentication**: JWT-based auth with Google OAuth support
- 👥 **Admin Dashboard**: Comprehensive admin panel for content moderation

## ✨ Features

### Core Features

#### 1. **User Authentication & Profiles**

- Secure registration and login system
- Google OAuth integration
- User profiles with customizable avatars
- Profile photo editing (upload or choose from samples)
- Username editing
- Bio and activity tracking

#### 2. **Question Management**

- Ask questions with rich text editor
- LaTeX formula support (KaTeX)
- Code syntax highlighting
- Tag system for categorization
- Category classification (5G, 4G, MIMO, OFDM, etc.)
- Difficulty levels (Beginner, Intermediate, Advanced)
- Search and filter functionality
- Question editing and deletion
- Voting system (upvote/downvote)
- View tracking

#### 3. **Answer System**

- Rich text answers with formatting
- Edit answers after posting
- Voting system for answer quality
- Answer acceptance by question author
- Admin override for answer acceptance
- Answer deletion
- Markdown support

#### 4. **Points & Reputation System**

- **Earn Points**:
  - Ask a question: +5 points
  - Post an answer: +10 points
  - Question upvoted: +2 points
  - Answer upvoted: +3 points
  - Answer accepted: +50 points
- **Lose Points**:
  - Question downvoted: -1 point
  - Answer downvoted: -2 points
  - Delete question: -5 points
  - Delete answer: -10 points
- Badge system with 8 achievement levels
- Real-time point updates
- Detailed points guide page

#### 5. **Leaderboard**

- Multiple ranking categories
- Top contributors by points
- Most questions asked
- Most answers given
- User rankings and statistics
- Real-time updates

#### 6. **Rich Text Editor**

- LaTeX/KaTeX formula support
- Code syntax highlighting (30+ languages)
- Custom formula modal
- Custom code modal
- Math equation rendering
- Code block styling

#### 7. **AI-Powered Features**

- **Duplicate Question Detection**: Real-time semantic search for similar questions
- **AI-Assisted Answers**: Generate draft answers using Google Gemini API
- Context-aware suggestions
- Non-blocking user experience

#### 8. **Bookmarks & Saved Lists**

- Bookmark questions and answers
- Create custom bookmark lists
- Organize saved content
- Private lists management
- Quick access from profile

#### 9. **Unanswered Queues**

- "Unanswered" tab: Questions with zero answers
- "Needs Answer" tab: Questions with no accepted answer
- Dedicated pages for highlighting unanswered questions
- Improve community engagement

#### 10. **In-App Notifications**

- Real-time notifications (polling-based)
- Notifications for:
  - New answers on your questions
  - Answer upvotes/acceptance
  - @mentions in questions/answers
  - Badge achievements
- Notification dropdown
- Mark as read/unread
- Delete notifications

#### 11. **Admin Dashboard**

- User management (view, edit, delete)
- Role management (promote/demote users)
- Content moderation
- Site statistics and analytics
- Question/answer management
- Answer acceptance override

#### 12. **Theme Support**

- Dark mode
- Light mode
- System preference detection
- Smooth theme transitions

#### 13. **Responsive Design**

- Mobile-friendly interface
- Tablet optimization
- Desktop experience
- Touch-friendly interactions

## 🛠 Tech Stack

### Frontend

- **React** 18.2.0 - UI library
- **React Router DOM** 6.15.0 - Routing
- **Tailwind CSS** 3.3.3 - Styling
- **React Quill** 2.0.0 - Rich text editor
- **KaTeX** 0.16.25 - Math rendering
- **Highlight.js** 11.11.1 - Code syntax highlighting
- **React Hot Toast** 2.4.1 - Notifications
- **React Icons** 4.12.0 - Icon library
- **Axios** 1.5.0 - HTTP client
- **Date-fns** 4.1.0 - Date formatting

### Backend

- **Node.js** - Runtime environment
- **Express.js** 4.18.2 - Web framework
- **MongoDB** 6.20.0 - Database
- **Mongoose** 7.5.0 - ODM
- **JWT** 9.0.2 - Authentication
- **Bcryptjs** 2.4.3 - Password hashing
- **Passport.js** 0.7.0 - Authentication middleware
- **Passport Google OAuth20** 2.0.0 - Google OAuth
- **Express Validator** 7.0.1 - Input validation
- **Helmet** 7.0.0 - Security headers
- **CORS** 2.8.5 - Cross-origin resource sharing
- **Express Rate Limit** 6.10.0 - Rate limiting
- **Google Generative AI** 0.24.1 - Gemini API integration

### Database

- **MongoDB Atlas** - Cloud database
- **Mongoose** - Schema modeling

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB)
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd WCOM_PROJECT
```

#### 2. Set Up the Backend

```bash
cd backend
npm install
cp env.example .env
```

Edit the `.env` file with your configuration (see [Environment Variables](#-environment-variables)).

#### 3. Set Up the Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5001
```

#### 4. Start the Development Servers

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

#### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

## 🔐 Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nextcomm?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
SESSION_SECRET=your-session-secret-here

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=/api/auth/google/callback

# Google Gemini API (Optional)
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5001
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint                    | Description           | Auth Required |
| ------ | --------------------------- | --------------------- | ------------- |
| POST   | `/api/auth/register`        | Register new user     | No            |
| POST   | `/api/auth/login`           | Login user            | No            |
| GET    | `/api/auth/me`              | Get current user      | Yes           |
| PUT    | `/api/auth/profile`         | Update user profile   | Yes           |
| GET    | `/api/auth/google`          | Google OAuth login    | No            |
| GET    | `/api/auth/google/callback` | Google OAuth callback | No            |

### Questions

| Method | Endpoint                     | Description                           | Auth Required |
| ------ | ---------------------------- | ------------------------------------- | ------------- |
| GET    | `/api/questions`             | Get all questions (with filters)      | No            |
| GET    | `/api/questions/:id`         | Get single question                   | No            |
| POST   | `/api/questions`             | Create new question                   | Yes           |
| PUT    | `/api/questions/:id`         | Update question                       | Yes           |
| DELETE | `/api/questions/:id`         | Delete question                       | Yes           |
| POST   | `/api/questions/:id/vote`    | Vote on question                      | Yes           |
| GET    | `/api/questions/unanswered`  | Get unanswered questions              | No            |
| GET    | `/api/questions/no-accepted` | Get questions with no accepted answer | No            |

### Answers

| Method | Endpoint                  | Description       | Auth Required |
| ------ | ------------------------- | ----------------- | ------------- |
| POST   | `/api/answers`            | Create new answer | Yes           |
| PUT    | `/api/answers/:id`        | Update answer     | Yes           |
| DELETE | `/api/answers/:id`        | Delete answer     | Yes           |
| POST   | `/api/answers/:id/vote`   | Vote on answer    | Yes           |
| POST   | `/api/answers/:id/accept` | Accept answer     | Yes           |

### Users

| Method | Endpoint                   | Description          | Auth Required |
| ------ | -------------------------- | -------------------- | ------------- |
| GET    | `/api/users/:id`           | Get user profile     | No            |
| GET    | `/api/users/:id/questions` | Get user's questions | No            |
| GET    | `/api/users/:id/answers`   | Get user's answers   | No            |

### Leaderboard

| Method | Endpoint                        | Description     | Auth Required |
| ------ | ------------------------------- | --------------- | ------------- |
| GET    | `/api/leaderboard`              | Get leaderboard | No            |
| GET    | `/api/leaderboard/top`          | Get top 3 users | No            |
| GET    | `/api/leaderboard/rank/:userId` | Get user's rank | No            |

### Bookmarks

| Method | Endpoint                   | Description           | Auth Required |
| ------ | -------------------------- | --------------------- | ------------- |
| GET    | `/api/bookmarks`           | Get user's bookmarks  | Yes           |
| POST   | `/api/bookmarks`           | Create bookmark       | Yes           |
| DELETE | `/api/bookmarks/:id`       | Delete bookmark       | Yes           |
| GET    | `/api/bookmarks/check`     | Check bookmark status | Yes           |
| GET    | `/api/bookmarks/lists`     | Get bookmark lists    | Yes           |
| POST   | `/api/bookmarks/lists`     | Create bookmark list  | Yes           |
| PUT    | `/api/bookmarks/lists/:id` | Update bookmark list  | Yes           |
| DELETE | `/api/bookmarks/lists/:id` | Delete bookmark list  | Yes           |

### Notifications

| Method | Endpoint                      | Description               | Auth Required |
| ------ | ----------------------------- | ------------------------- | ------------- |
| GET    | `/api/notifications`          | Get user's notifications  | Yes           |
| PUT    | `/api/notifications/:id/read` | Mark notification as read | Yes           |
| DELETE | `/api/notifications/:id`      | Delete notification       | Yes           |
| PUT    | `/api/notifications/read-all` | Mark all as read          | Yes           |

### AI Features

| Method | Endpoint                   | Description                   | Auth Required |
| ------ | -------------------------- | ----------------------------- | ------------- |
| POST   | `/api/ai/check-duplicates` | Check for duplicate questions | Yes           |
| POST   | `/api/ai/generate-answer`  | Generate AI answer            | Yes           |

### Admin

| Method | Endpoint                        | Description              | Auth Required |
| ------ | ------------------------------- | ------------------------ | ------------- |
| GET    | `/api/admin/stats`              | Get site statistics      | Admin         |
| GET    | `/api/admin/users`              | Get all users            | Admin         |
| PUT    | `/api/admin/users/:id/role`     | Change user role         | Admin         |
| DELETE | `/api/admin/users/:id`          | Delete user              | Admin         |
| DELETE | `/api/admin/questions/:id`      | Delete any question      | Admin         |
| DELETE | `/api/admin/answers/:id`        | Delete any answer        | Admin         |
| POST   | `/api/admin/answers/:id/accept` | Accept answer (override) | Admin         |

## 📁 Project Structure

```
WCOM_PROJECT/
├── backend/
│   ├── config/
│   │   └── passport.js          # Passport.js configuration
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── admin.js             # Admin role middleware
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Question.js          # Question model
│   │   ├── Answer.js            # Answer model
│   │   ├── Notification.js      # Notification model
│   │   ├── Bookmark.js          # Bookmark model
│   │   └── BookmarkList.js      # BookmarkList model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── questions.js         # Question routes
│   │   ├── answers.js           # Answer routes
│   │   ├── users.js             # User routes
│   │   ├── leaderboard.js       # Leaderboard routes
│   │   ├── notifications.js     # Notification routes
│   │   ├── bookmarks.js         # Bookmark routes
│   │   ├── unanswered.js        # Unanswered questions routes
│   │   ├── ai.js                # AI features routes
│   │   └── admin.js             # Admin routes
│   ├── utils/
│   │   ├── aiService.js         # Gemini API service
│   │   └── notifications.js     # Notification utilities
│   ├── scripts/
│   │   ├── createAdmin.js       # Create admin user script
│   │   ├── syncPoints.js        # Sync points script
│   │   └── ...                  # Other utility scripts
│   ├── server.js                # Express server
│   ├── package.json
│   └── env.example              # Environment variables example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── ProtectedRoute.js
│   │   │   │   └── AdminRoute.js
│   │   │   ├── common/
│   │   │   │   ├── FormulaModal.js
│   │   │   │   ├── CodeModal.js
│   │   │   │   ├── BadgeModal.js
│   │   │   │   ├── BookmarkButton.js
│   │   │   │   ├── AISuggestionModal.js
│   │   │   │   └── ...
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.js
│   │   │   │   └── Footer.js
│   │   │   └── notifications/
│   │   │       └── NotificationDropdown.js
│   │   ├── contexts/
│   │   │   ├── AuthContext.js
│   │   │   ├── ThemeContext.js
│   │   │   └── NotificationContext.js
│   │   ├── pages/
│   │   │   ├── Welcome.js
│   │   │   ├── Dashboard.js
│   │   │   ├── AskQuestion.js
│   │   │   ├── QuestionDetails.js
│   │   │   ├── Leaderboard.js
│   │   │   ├── UserProfile.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── AdminDashboard.js
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── quillToolbar.js
│   │   │   ├── quillModules.js
│   │   │   └── ...
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
│
├── README.md
├── ADMIN_ROLE_README.md
├── AI_FEATURES_README.md
├── RICH_TEXT_EDITOR_README.md
├── GOOGLE_SIGNIN_SETUP.md
└── ...
```

## 📚 Key Features Documentation

### 1. Rich Text Editor

The platform includes an advanced rich text editor with:

- LaTeX/KaTeX formula support
- Code syntax highlighting (30+ languages)
- Custom modals for formula and code input
- Math equation rendering
- Code block styling

See [RICH_TEXT_EDITOR_README.md](./RICH_TEXT_EDITOR_README.md) for detailed documentation.

### 2. AI Features

AI-powered features using Google Gemini API:

- Duplicate question detection
- AI-assisted answer generation

See [AI_FEATURES_README.md](./AI_FEATURES_README.md) for setup and usage.

### 3. Admin System

Comprehensive admin dashboard for:

- User management
- Content moderation
- Site statistics
- Role management

See [ADMIN_ROLE_README.md](./ADMIN_ROLE_README.md) for detailed documentation.

### 4. Google Sign-In

OAuth integration with Google for seamless authentication.

See [GOOGLE_SIGNIN_SETUP.md](./GOOGLE_SIGNIN_SETUP.md) for setup instructions.

### 5. Points System

Detailed points and reputation system with badges.

See [backend/POINTS_SYSTEM_SUMMARY.md](./backend/POINTS_SYSTEM_SUMMARY.md) for complete breakdown.

## 👨‍💼 Admin System

### Creating an Admin User

#### Method 1: Using the Script (Recommended)

```bash
cd backend
npm run create-admin
```

Follow the prompts to create an admin user.

#### Method 2: Manual Database Update

```javascript
// In MongoDB shell or Compass
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "ADMIN" } });
```

### Admin Features

- **User Management**: View, edit, delete users
- **Role Management**: Promote/demote users to admin
- **Content Moderation**: Delete any question or answer
- **Statistics**: View site-wide analytics
- **Answer Override**: Accept/unaccept answers on any question

## 🤖 AI Features

### Setup

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to backend `.env`:
   ```env
   GEMINI_API_KEY=your-api-key-here
   ```
3. Restart the backend server

### Features

- **Duplicate Question Detection**: Real-time semantic search
- **AI Answer Generation**: Context-aware answer suggestions

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)

1. **Create a new app** on your hosting platform
2. **Set environment variables** in the dashboard
3. **Connect GitHub repository**
4. **Deploy**

**Required Environment Variables:**

- `PORT` (auto-set by platform)
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV=production`
- `FRONTEND_URL`
- `GOOGLE_CLIENT_ID` (optional)
- `GOOGLE_CLIENT_SECRET` (optional)
- `GEMINI_API_KEY` (optional)

### Frontend Deployment (Netlify/Vercel)

1. **Build the React app**:

   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy the `build` folder** to your hosting service

3. **Set environment variables**:
   - `REACT_APP_API_URL` - Your backend API URL

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist IP addresses (0.0.0.0/0 for development)
5. Get connection string and update `MONGODB_URI`

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd frontend
npm test
```

## 📝 Scripts

### Backend Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run create-admin` - Create an admin user
- `npm run sync-points` - Sync user points

### Frontend Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**:
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to the branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Code Style

- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Add comments for complex logic

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@nextcomm.com or create an issue in the repository.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Quill](https://github.com/zenoamaro/react-quill)
- [KaTeX](https://katex.org/)
- [Highlight.js](https://highlightjs.org/)
- [Google Gemini AI](https://ai.google.dev/)

## 📊 Database Schema

### User

```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  googleId: String (optional),
  authProvider: String ('local' | 'google'),
  avatar: String,
  bio: String,
  points: Number,
  badges: Array,
  reputation: Number,
  questionsAsked: Number,
  answersGiven: Number,
  role: String ('USER' | 'ADMIN'),
  isActive: Boolean,
  lastActive: Date
}
```

### Question

```javascript
{
  title: String,
  description: String (HTML),
  author: ObjectId (User),
  tags: Array,
  category: String,
  difficulty: String,
  votes: {
    upvotes: Number,
    downvotes: Number,
    voters: Array
  },
  views: Number,
  answers: Array (ObjectId),
  acceptedAnswer: ObjectId,
  isSolved: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Answer

```javascript
{
  content: String (HTML),
  author: ObjectId (User),
  question: ObjectId (Question),
  votes: {
    upvotes: Number,
    downvotes: Number,
    voters: Array
  },
  isAccepted: Boolean,
  isEdited: Boolean,
  editedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification

```javascript
{
  user: ObjectId (User),
  type: String,
  message: String,
  link: String,
  isRead: Boolean,
  createdAt: Date
}
```

### Bookmark

```javascript
{
  user: ObjectId (User),
  question: ObjectId (Question) (optional),
  answer: ObjectId (Answer) (optional),
  list: ObjectId (BookmarkList) (optional),
  createdAt: Date
}
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API routes
- Helmet.js for security headers
- CORS configuration
- Input validation with express-validator
- XSS protection
- SQL injection prevention (MongoDB)
- Secure session management

## 📈 Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] Email notifications
- [ ] Advanced search with Elasticsearch
- [ ] File upload support
- [ ] Image hosting
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Question/answer moderation queue
- [ ] Community guidelines enforcement
- [ ] Badge customization
- [ ] Social sharing
- [ ] Export data functionality

## 🐛 Known Issues

- None at the moment. Please report any issues in the repository.

## 📞 Contact

- **Email**: support@nextcomm.com
- **GitHub**: [Repository URL]
- **Issues**: [GitHub Issues](https://github.com/your-repo/nextcomm/issues)

---

<div align="center">

**Made with ❤️ for Wireless Communication Students**

⭐ Star this repo if you find it helpful!

</div>
