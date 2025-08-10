import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { testAllConnections } from './utils/supabaseAPI';
import Layout from './components/Common/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import CreateAccount from './components/Auth/CreateAccount';
import PendingApproval from './components/Auth/PendingApproval';
import VerifyOTP from './components/Auth/VerifyOTP';
import ClientDashboard from './components/Client/Dashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import LoanRequests from './components/Admin/LoanRequests';
import UserManagement from './components/Admin/UserManagement';
import Analytics from './components/Admin/Analytics';
import Settings from './components/Admin/Settings';

import LoanRequest from './components/Client/LoanRequest';
import LoanHistory from './components/Client/LoanHistory';
import Repayment from './components/Client/Repayment';
import Profile from './components/Client/Profile';
import Menu from './components/Client/Menu';
import ABEpargne from './components/Client/ABEpargne';
import ABLogement from './components/Client/ABLogement';
import ABNutrition from './components/Client/ABNutrition';

import LoyaltyScore from './components/Client/LoyaltyScore';
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

  // Rediriger les admins vers leur dashboard s'ils essaient d'accéder aux pages client
  if (!adminOnly && user?.role === 'admin') {
    return <Navigate to="/admin" />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return <Layout>{children}</Layout>;
};

// Composant pour les routes publiques (redirections si connecté)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Ne pas bloquer la page publique pendant le chargement de l'auth
  if (loading) return children;

  if (isAuthenticated) {
    // Rediriger vers la page appropriée selon le rôle
    if (user?.role === 'admin') {
      return <Navigate to="/admin" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
  }

  return children;
};



function App() {
  // Test de connexion au démarrage (uniquement en développement)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      testAllConnections().then(result => {
        if (result.success) {
          console.log('[APP] ✅ Configuration Supabase validée');
        } else {
          console.error('[APP] ❌ Erreur de configuration Supabase:', result.error);
        }
      });
    }
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
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
                path="/create-account" 
                element={
                  <PublicRoute>
                    <CreateAccount />
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
              <Route 
                path="/pending-approval" 
                element={
                  <PublicRoute>
                    <PendingApproval />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/verify-otp" 
                element={
                  <PublicRoute>
                    <VerifyOTP />
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
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
                                        <Route
                            path="/menu"
                            element={
                              <ProtectedRoute>
                                <Menu />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/ab-epargne"
                            element={
                              <ProtectedRoute>
                                <ABEpargne />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/ab-logement"
                            element={
                              <ProtectedRoute>
                                <ABLogement />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/ab-nutrition"
                            element={
                              <ProtectedRoute>
                                <ABNutrition />
                              </ProtectedRoute>
                            }
                          />
                          
                          <Route
                            path="/loyalty-score"
                            element={
                              <ProtectedRoute>
                                <LoyaltyScore />
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
              <Route 
                path="/admin/loan-requests" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <LoanRequests />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/user-management" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/analytics" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <Analytics />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/settings" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <Settings />
                  </ProtectedRoute>
                } 
              />


              {/* Redirection par défaut */}
              <Route path="/" element={<Navigate to="/login" />} />
              

            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;