import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { testAllConnections } from './utils/supabaseAPI';
import { Toaster } from 'react-hot-toast';
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
import RepaymentSuccess from './components/Client/RepaymentSuccess';
import RepaymentFailure from './components/Client/RepaymentFailure';
import RepaymentCancel from './components/Client/RepaymentCancel';
import Profile from './components/Client/Profile';
import Menu from './components/Client/Menu';
import ABEpargne from './components/Client/ABEpargne';
import ABLogement from './components/Client/ABLogement';
import CoachingFinance from './components/Client/CoachingFinance';

import LoyaltyScore from './components/Client/LoyaltyScore';
import TestOTP from './components/TestOTP';
import TestHealth from './components/TestHealth';
import TestFedaPay from './components/TestFedaPay';
import './styles/globals.css';

// Composant de configuration pour Supabase manquant
const ConfigurationPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AB Campus Finance</h1>
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Configuration requise</h3>
            <p className="text-yellow-700">
              L'application nécessite une configuration Supabase pour fonctionner.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-gray-800 mb-2">Étapes de configuration :</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm">
              <li>Créez un projet sur <a href="https://supabase.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Supabase.com</a></li>
              <li>Copiez l'URL et la clé anonyme depuis Settings → API</li>
              <li>Créez un fichier <code className="bg-gray-200 px-1 rounded">.env.local</code> à la racine du projet</li>
              <li>Ajoutez vos clés Supabase</li>
              <li>Redémarrez l'application</li>
            </ol>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Exemple de fichier .env.local :</h4>
            <pre className="text-xs text-blue-700 bg-blue-100 p-3 rounded overflow-x-auto">
{`REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
REACT_APP_BACKEND_URL=http://localhost:5000`}
            </pre>
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Recharger après configuration
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [isConfigured, setIsConfigured] = useState(true); // Par défaut, on suppose que c'est configuré
  const [isChecking, setIsChecking] = useState(true);

  // Test de connexion au démarrage (uniquement en développement)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setIsChecking(true);
      testAllConnections().then(result => {
        if (result.success) {
          console.log('[APP] ✅ Configuration Supabase validée');
          setIsConfigured(true);
        } else {
          console.error('[APP] ❌ Erreur de configuration Supabase:', result.error);
          setIsConfigured(false);
        }
        setIsChecking(false);
      }).catch(error => {
        console.error('[APP] ❌ Erreur lors du test de connexion:', error);
        setIsConfigured(false);
        setIsChecking(false);
      });
    } else {
      setIsChecking(false);
    }
  }, []);

  // Afficher un loader pendant la vérification
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de la configuration...</p>
        </div>
      </div>
    );
  }

  // Si Supabase n'est pas configuré, afficher la page de configuration
  if (!isConfigured) {
    return <ConfigurationPage />;
  }

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
                path="/remboursement/success" 
                element={
                  <ProtectedRoute>
                    <RepaymentSuccess />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/remboursement/failure" 
                element={
                  <ProtectedRoute>
                    <RepaymentFailure />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/remboursement/cancel" 
                element={
                  <ProtectedRoute>
                    <RepaymentCancel />
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
                    <CoachingFinance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/coaching-finance"
                element={
                  <ProtectedRoute>
                    <CoachingFinance />
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

              {/* Routes de test temporaires */}
              <Route path="/test-otp" element={<TestOTP />} />
              <Route path="/test-health" element={<TestHealth />} />
              <Route path="/test-fedapay" element={<TestFedaPay />} />

              {/* Redirection par défaut */}
              <Route path="/" element={<Navigate to="/login" />} />
              

            </Routes>
          </div>
        </Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;