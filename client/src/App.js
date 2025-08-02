import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import Stores from './components/stores/Stores';
import RatingStars from './components/RatingStars';
import AdminUsers from './components/admin/AdminUsers';
import AdminStores from './components/admin/AdminStores';
import StoreOwnerDashboard from './components/storeowner/StoreOwnerDashboard';
import Profile from './components/Profile';
import AdminDashboard from './components/admin/AdminDashboard';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Main App Component
const AppContent = () => {
  const { user } = useAuth();

  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" />
        {user && <Navbar />}
        <div className="container">
          <Routes>
            <Route path="/login" element={
              user ? <Navigate to="/dashboard" /> : <Login />
            } />
            <Route path="/register" element={
              user ? <Navigate to="/dashboard" /> : <Register />
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/stores" element={
              <ProtectedRoute>
                <Stores />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/stores" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminStores />
              </ProtectedRoute>
            } />
            <Route path="/store-owner" element={
              <ProtectedRoute allowedRoles={['store_owner']}>
                <StoreOwnerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/" element={
              user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

// Root App Component with Auth Provider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App; 