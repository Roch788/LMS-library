import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBooks from './pages/admin/AdminBooks';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFines from './pages/admin/AdminFines';
import AdminCatalog from './pages/admin/AdminCatalog';

import UserDashboard from './pages/user/UserDashboard';
import UserBooks from './pages/user/UserBooks';
import UserProfile from './pages/user/UserProfile';

import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './shared/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-library-paper text-library-ink antialiased">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/books"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/fines"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminFines />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/catalog"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminCatalog />
                </ProtectedRoute>
              }
            />

            {/* Protected Student Routes */}
            <Route
              path="/user/dashboard"
              element={
                <ProtectedRoute allowedRole="user">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/books"
              element={
                <ProtectedRoute allowedRole="user">
                  <UserBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/profile"
              element={
                <ProtectedRoute allowedRole="user">
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
