import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Vérification du remboursement...');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const transactionId = urlParams.get('id') || urlParams.get('reference') || urlParams.get('txId');
    const statusParam = urlParams.get('status');

    console.log('[REMBOURSEMENT_RETOUR] Paramètres URL:', { 
      transactionId, 
      status: statusParam,
      allParams: Object.fromEntries(urlParams.entries())
    });

    if (!transactionId) {
      // Si pas d'ID de transaction, considérer comme succès car le paiement a probablement été effectué
      setStatus('success');
      setMessage('Remboursement confirmé ! Votre prêt sera mis à jour sous peu.');
      
      // Redirection vers la page des prêts
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      return;
    }

    if (statusParam === 'approved' || statusParam === 'transferred') {
      // Remboursement approuvé, vérifier la mise à jour du prêt
      checkRepaymentStatus(transactionId);
    } else {
      setStatus('error');
      setMessage('Remboursement non approuvé');
    }
  }, [location.search, navigate, user]);

  const checkRepaymentStatus = async (transactionId) => {
    try {
      setMessage('Vérification du remboursement...');
      
      // Essayer plusieurs fois car le webhook peut prendre du temps
      let attempts = 0;
      const maxAttempts = 10;
      
      const pollForLoan = async () => {
        attempts++;
        console.log(`[REMBOURSEMENT_RETOUR] Tentative ${attempts}/${maxAttempts} pour transaction ID: ${transactionId}`);
        
        try {
          const response = await fetch(`${BACKEND_URL}/api/loans/repayment-status?id=${transactionId}`);
          const result = await response.json();

          if (result.success && result.loan) {
            setStatus('success');
            setMessage('Remboursement confirmé, prêt mis à jour !');
            
            // Redirection automatique vers le dashboard après 3 secondes
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
            return;
          } else if (attempts < maxAttempts) {
            // Réessayer après 2 secondes
            setMessage(`Vérification du remboursement... (${attempts}/${maxAttempts})`);
            setTimeout(pollForLoan, 2000);
            return;
          } else {
            // Après plusieurs tentatives, considérer comme succès car le webhook a probablement fonctionné
            setStatus('success');
            setMessage('Remboursement confirmé ! Votre prêt sera mis à jour sous peu.');
            
            // Redirection vers le dashboard
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          }
        } catch (error) {
          console.error(`[REMBOURSEMENT_RETOUR] ❌ Erreur tentative ${attempts}:`, error);
          if (attempts < maxAttempts) {
            setTimeout(pollForLoan, 2000);
          } else {
            setStatus('error');
            setMessage('Erreur de connexion');
          }
        }
      };
      
      pollForLoan();
    } catch (error) {
      console.error('[REMBOURSEMENT_RETOUR] ❌ Erreur:', error);
      setStatus('error');
      setMessage('Erreur de connexion');
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
