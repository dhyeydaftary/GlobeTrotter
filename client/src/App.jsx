import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Page Imports
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import MyTrips from './pages/MyTrips';
import CreateTrip from './pages/CreateTrip';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import BudgetPage from './pages/BudgetPage';
import PublicTripView from './pages/PublicTripView';
import ProfilePage from './pages/ProfilePage';

// ProtectedRoute Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// PublicOnlyRoute Wrapper Component (redirects to /dashboard if authenticated)
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-textMain font-body">
      <Routes>
        {/* Root Route / and /landing ALWAYS render LandingPage */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />

        {/* Public Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <div className="flex-1">
                <Navbar />
                <LoginPage />
              </div>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <div className="flex-1">
                <Navbar />
                <SignupPage />
              </div>
            </PublicOnlyRoute>
          }
        />

        {/* Public Shared Trip Route */}
        <Route
          path="/public/trips/:slug"
          element={
            <div className="flex-1">
              <Navbar />
              <PublicTripView />
            </div>
          }
        />

        {/* Protected App Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="flex-1">
                <Navbar />
                <Dashboard />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <div className="flex-1">
                <Navbar />
                <MyTrips />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/new"
          element={
            <ProtectedRoute>
              <div className="flex-1">
                <Navbar />
                <CreateTrip />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:id"
          element={
            <ProtectedRoute>
              <div className="flex-1">
                <Navbar />
                <ItineraryBuilder />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:id/view"
          element={
            <ProtectedRoute>
              <div className="flex-1">
                <Navbar />
                <ItineraryView />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:id/budget"
          element={
            <ProtectedRoute>
              <div className="flex-1">
                <Navbar />
                <BudgetPage />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div className="flex-1">
                <Navbar />
                <ProfilePage />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
