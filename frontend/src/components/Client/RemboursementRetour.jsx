import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';

// Configuration du backend selon l'environnement
const getBackendUrl = () => {
  // En production, utiliser l'URL Render
  if (process.env.NODE_ENV === 'production') {
    return 'https://ab-pret-back.onrender.com';
  }
  
  // En développement, utiliser l'URL locale ou celle définie dans .env
  return process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
};

const BACKEND_URL = getBackendUrl();

const RemboursementRetour = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Vérification du remboursement...');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    let transactionId = urlParams.get('id') || urlParams.get('reference') || urlParams.get('txId') || urlParams.get('transaction_id');
    if (!transactionId) {
      transactionId = sessionStorage.getItem('pending_repayment_transaction_id') || null;
      if (transactionId) {
        sessionStorage.removeItem('pending_repayment_transaction_id');
      }
    }
    const statusParam = urlParams.get('status');

    console.log('[REMBOURSEMENT_RETOUR] Paramètres URL:', { 
      transactionId, 
      status: statusParam,
      allParams: Object.fromEntries(urlParams.entries())
    });

    if (!transactionId) {
      setStatus('success');
      setMessage('Remboursement confirmé ! Votre prêt sera mis à jour sous peu.');
      if (user?.id) queryClient.invalidateQueries({ queryKey: ['dashboardStats', user.id] });
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      return;
    }

    if (statusParam === 'failure' || statusParam === 'cancel') {
      setStatus('error');
      setMessage(statusParam === 'cancel' ? 'Paiement annulé' : 'Remboursement non abouti');
    } else if (statusParam === 'approved' || statusParam === 'transferred' || statusParam === 'success' || statusParam === null || statusParam === undefined) {
      // Paiement approuvé : seul le webhook backend crée le paiement et met à jour le prêt. On vérifie juste que c'est fait (polling).
      checkRepaymentStatus(transactionId);
    } else {
      setStatus('error');
      setMessage('Remboursement non approuvé');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, navigate, user]);

  const checkRepaymentStatus = async (transactionId) => {
    const maxAttempts = 10;
    const delayMs = 2000;

    const checkOnce = async () => {
      const response = await fetch(`${BACKEND_URL}/api/loans/repayment-status?id=${encodeURIComponent(transactionId)}`);
      const result = await response.json();
      return result.success && result.loan ? result : null;
    };

    try {
      setMessage('Vérification du remboursement...');
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const result = await checkOnce();
        if (result && result.loan) {
          setStatus('success');
          setMessage('Remboursement confirmé, prêt mis à jour !');
          queryClient.invalidateQueries({ queryKey: ['dashboardStats', user?.id] });
          setTimeout(() => navigate('/dashboard'), 3000);
          return;
        }
        if (attempt < maxAttempts) {
          setMessage(`Vérification du remboursement... (${attempt}/${maxAttempts})`);
          await new Promise(r => setTimeout(r, delayMs));
        }
      }

      setStatus('success');
      setMessage('Remboursement en cours de traitement. Rechargez la page d\'accueil dans quelques instants pour voir le prêt à jour.');
      queryClient.invalidateQueries({ queryKey: ['dashboardStats', user?.id] });
      setTimeout(() => navigate('/dashboard'), 4000);
    } catch (error) {
      console.error('[REMBOURSEMENT_RETOUR] ❌ Erreur:', error);
      setStatus('error');
      setMessage('Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'success' ? 'Remboursement effectué !' : status === 'error' ? 'Erreur' : 'Vérification...'}
          </h2>
          <p className="text-gray-600 mb-4">{message}</p>
        </div>
        
        <button
          onClick={handleBackToDashboard}
          className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Retour au tableau de bord
        </button>
      </div>
    </div>
  );
};

export default RemboursementRetour;
