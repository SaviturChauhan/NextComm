import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/layout/Navbar';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import AskQuestion from './pages/AskQuestion';
import QuestionDetails from './pages/QuestionDetails';
import Leaderboard from './pages/Leaderboard';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
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
              </Routes>
            </main>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                },
                success: {
                  duration: 3000,
                },
                error: {
                  duration: 5000,
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


