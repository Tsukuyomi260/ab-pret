import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { testAllConnections } from './utils/supabaseAPI';
import { Toaster } from 'react-hot-toast';
import updateNotifier from './utils/updateNotifier';
import Layout from './components/Common/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import CreateAccount from './components/Auth/CreateAccount';
import PendingApproval from './components/Auth/PendingApproval';

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
import ABLogement from './components/Client/ABLogement';
import ABEpargne from './components/Client/ABEpargne';
import RetourEpargne from './components/Client/RetourEpargne';
import PlanEpargne from './components/Client/PlanEpargne';
import DepotRetour from './components/Client/DepotRetour';
import RemboursementRetour from './components/Client/RemboursementRetour';
import TestPlanEpargne from './components/Client/TestPlanEpargne';
import CoachingFinance from './components/Client/CoachingFinance';

import LoyaltyScore from './components/Client/LoyaltyScore';
import TestOTP from './components/TestOTP';
import TestHealth from './components/TestHealth';
import TestFedaPay from './components/TestFedaPay';
import './styles/globals.css';

// Composant de notification de mise à jour
const UpdateNotification = ({ onUpdate }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Nouvelle version disponible</p>
          <p className="text-xs opacity-90">Cliquez pour mettre à jour</p>
        </div>
        <button
          onClick={onUpdate}
          className="flex-shrink-0 bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
        >
          Mettre à jour
        </button>
      </div>
    </div>
  );
};

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
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Composant principal de l'application
const AppContent = () => {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  useEffect(() => {
    // Démarrer la vérification des mises à jour
    updateNotifier.startChecking(() => {
      setShowUpdateNotification(true);
    });

    // Nettoyer à la fermeture
    return () => {
      updateNotifier.stopChecking();
    };
  }, []);

  const handleUpdate = () => {
    updateNotifier.applyUpdate();
  };

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <ClientDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/loan-requests" element={
            <ProtectedRoute adminOnly>
              <Layout>
                <LoanRequests />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/user-management" element={
            <ProtectedRoute adminOnly>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/analytics" element={
            <ProtectedRoute adminOnly>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/settings" element={
            <ProtectedRoute adminOnly>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/loan-request" element={
            <ProtectedRoute>
              <Layout>
                <LoanRequest />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/loan-history" element={
            <ProtectedRoute>
              <Layout>
                <LoanHistory />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/repayment" element={
            <ProtectedRoute>
              <Layout>
                <Repayment />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/repayment/success" element={
            <ProtectedRoute>
              <Layout>
                <RepaymentSuccess />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/repayment/failure" element={
            <ProtectedRoute>
              <Layout>
                <RepaymentFailure />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/repayment/cancel" element={
            <ProtectedRoute>
              <Layout>
                <RepaymentCancel />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/menu" element={
            <ProtectedRoute>
              <Layout>
                <Menu />
              </Layout>
            </ProtectedRoute>
          } />
          
          
          <Route path="/ab-logement" element={
            <ProtectedRoute>
              <Layout>
                <ABLogement />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/ab-epargne" element={
            <ProtectedRoute>
              <Layout>
                <ABEpargne />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/ab-epargne/retour" element={
            <ProtectedRoute>
              <Layout>
                <RetourEpargne />
              </Layout>
            </ProtectedRoute>
          } />
          
            <Route path="/ab-epargne/plan/:id" element={
              <ProtectedRoute>
                <Layout>
                  <PlanEpargne />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/ab-epargne/depot-retour" element={
              <ProtectedRoute>
                <Layout>
                  <DepotRetour />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/remboursement-retour" element={
              <ProtectedRoute>
                <Layout>
                  <RemboursementRetour />
                </Layout>
              </ProtectedRoute>
            } />
          
          <Route path="/coaching-finance" element={
            <ProtectedRoute>
              <Layout>
                <CoachingFinance />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/loyalty-score" element={
            <ProtectedRoute>
              <Layout>
                <LoyaltyScore />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/test-otp" element={<TestOTP />} />
          <Route path="/test-health" element={<TestHealth />} />
          <Route path="/test-fedapay" element={<TestFedaPay />} />
          <Route path="/test-plan-epargne/:id" element={<TestPlanEpargne />} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>

      {/* Notification de mise à jour */}
      {showUpdateNotification && (
        <UpdateNotification onUpdate={handleUpdate} />
      )}
    </>
  );
};

// Composant principal avec les providers
const App = () => {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const checkConfiguration = async () => {
      try {
        const result = await testAllConnections();
        setIsConfigured(result.success);
      } catch (error) {
        console.error('Erreur lors de la vérification de la configuration:', error);
        setIsConfigured(false);
      }
    };

    checkConfiguration();
  }, []);

  if (!isConfigured) {
    return <ConfigurationPage />;
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
        <Toaster position="top-right" />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;