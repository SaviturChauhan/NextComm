import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/layout/Navbar';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import AskQuestion from './pages/AskQuestion';
import QuestionDetails from './pages/QuestionDetails';
import Leaderboard from './pages/Leaderboard';
import UserProfile from './pages/UserProfile';
import PointsGuide from './pages/PointsGuide';
import Login from './pages/Login';
import Register from './pages/Register';
import GoogleCallback from './pages/GoogleCallback';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
          <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/ask" element={
                  <ProtectedRoute>
                    <AskQuestion />
                  </ProtectedRoute>
                } />
                <Route path="/question/:id" element={<QuestionDetails />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile/:id" element={<UserProfile />} />
                <Route path="/points-guide" element={<PointsGuide />} />
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
              </Routes>
            </main>
            <Toaster
              position="top-center"
              containerStyle={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                position: 'fixed',
              }}
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '16px',
                  padding: '18px 24px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  fontSize: '15px',
                  fontWeight: '600',
                  minWidth: '320px',
                  maxWidth: '500px',
                  backdropFilter: 'blur(10px)',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                  style: {
                    background: 'rgba(240, 253, 244, 0.95)',
                    color: '#166534',
                    border: '2px solid #86efac',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                  style: {
                    background: 'rgba(254, 242, 242, 0.95)',
                    color: '#991b1b',
                    border: '2px solid #fca5a5',
                  },
                },
              }}
            />
          </div>
        </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


