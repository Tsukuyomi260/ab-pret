import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Common/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ClientDashboard from './components/Client/Dashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import LoanRequest from './components/Client/LoanRequest';
import LoanHistory from './components/Client/LoanHistory';
import Repayment from './components/Client/Repayment';
import './styles/globals.css';

// Composant pour protéger les routes
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return <Layout>{children}</Layout>;
};

// Composant pour les routes publiques (redirections si connecté)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Routes publiques */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />

            {/* Routes protégées - Client */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/loan-request" 
              element={
                <ProtectedRoute>
                  <LoanRequest />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/loan-history" 
              element={
                <ProtectedRoute>
                  <LoanHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/repayment" 
              element={
                <ProtectedRoute>
                  <Repayment />
                </ProtectedRoute>
              } 
            />

            {/* Routes protégées - Admin */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Redirection par défaut */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;