# NextComm - Frontend

Modern React frontend for the NextComm platform with responsive design and dark/light theme support.

## Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Rich Text Editor**: React Quill integration for questions and answers
- **Real-time Notifications**: Toast notifications for user feedback
- **Authentication**: Secure login/register with JWT tokens
- **Search & Filter**: Advanced question filtering and search
- **Voting System**: Upvote/downvote questions and answers
- **User Profiles**: Comprehensive user activity tracking
- **Leaderboard**: Multiple ranking categories

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm start
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.js
│   │   └── layout/
│   │       └── Navbar.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── ThemeContext.js
│   ├── pages/
│   │   ├── Welcome.js
│   │   ├── Dashboard.js
│   │   ├── AskQuestion.js
│   │   ├── QuestionDetails.js
│   │   ├── Leaderboard.js
│   │   ├── UserProfile.js
│   │   ├── Login.js
│   │   └── Register.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── README.md
```

## Pages

### Welcome Page
- Hero section with call-to-action
- Feature highlights
- Authentication buttons

### Dashboard
- Question listing with search and filters
- Pagination
- Category and difficulty filters
- Sort options (newest, most voted, etc.)

### Ask Question
- Rich text editor for question content
- Tag system
- Category and difficulty selection
- Form validation

### Question Details
- Full question display
- Answer listing with voting
- Answer acceptance
- Answer form for authenticated users

### Leaderboard
- Top 3 users display
- Full leaderboard table
- Category-based rankings
- Pagination

### User Profile
- User information and stats
- Activity history (questions/answers)
- Badge system
- Progress tracking

### Authentication
- Login form with validation
- Registration form
- Password visibility toggle
- Error handling

## Components

### Navbar
- Responsive navigation
- Search functionality
- User menu dropdown
- Theme toggle
- Mobile menu

### ProtectedRoute
- Authentication guard
- Redirect to login if not authenticated
- Loading state

## Context Providers

### AuthContext
- User authentication state
- Login/logout functions
- Token management
- User data

### ThemeContext
- Dark/light theme state
- Theme toggle function
- Local storage persistence

## Styling

### Tailwind CSS
- Utility-first CSS framework
- Custom color palette
- Responsive design utilities
- Dark mode support

### Custom Styles
- Loading spinner
- Scrollbar styling
- Quill editor customization
- Animation utilities

## API Integration

### Axios Configuration
- Base URL configuration
- Request/response interceptors
- Error handling
- Token attachment

### API Endpoints
- Authentication: `/api/auth/*`
- Questions: `/api/questions/*`
- Answers: `/api/answers/*`
- Users: `/api/users/*`
- Leaderboard: `/api/leaderboard/*`

## State Management

### Local State
- Component-level state with useState
- Form data management
- UI state (modals, loading, etc.)

### Global State
- Authentication context
- Theme context
- User data

## Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile Features
- Collapsible navigation
- Touch-friendly buttons
- Optimized forms
- Swipe gestures

## Performance

### Code Splitting
- Route-based code splitting
- Lazy loading of components
- Dynamic imports

### Optimization
- React.memo for expensive components
- useCallback for event handlers
- useMemo for computed values

## Accessibility

### ARIA Labels
- Form labels
- Button descriptions
- Navigation landmarks

### Keyboard Navigation
- Tab order
- Focus management
- Keyboard shortcuts

### Screen Reader Support
- Semantic HTML
- Alt text for images
- Descriptive text

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Prerequisites
- Node.js 14+
- npm or yarn

### Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Start development server: `npm start`
4. Open http://localhost:3000

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:5000
```

## Deployment

### Build Process
1. Run `npm run build`
2. Deploy `build/` folder to hosting service
3. Configure environment variables

### Hosting Options
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

## Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License

