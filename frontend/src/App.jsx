import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import RecipeDetail from './pages/RecipeDetail';
import CreateRecipe from './pages/CreateRecipe';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import { PageLoader } from './components/SkeletonLoader';

// Protected Route Wrapper for general users
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <PageLoader />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Protected Route Wrapper for administrators only
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <PageLoader />;
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-150 transition-colors duration-300 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected General Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          
          <Route path="/explore" element={
            <ProtectedRoute>
              <Explore />
            </ProtectedRoute>
          } />
          
          <Route path="/recipe/create" element={
            <ProtectedRoute>
              <CreateRecipe />
            </ProtectedRoute>
          } />
          
          <Route path="/recipe/:id" element={
            <ProtectedRoute>
              <RecipeDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/recipe/edit/:id" element={
            <ProtectedRoute>
              <CreateRecipe />
            </ProtectedRoute>
          } />
          
          <Route path="/profile/:username" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Admin Restricted Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* Premium Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 transition-colors duration-300">
        <p>© {new Date().getFullYear()} RecipeNet Social. All Rights Reserved. CODTECH Project.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
