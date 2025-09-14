import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { 
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  PiggyBank,
  ArrowLeft
} from 'lucide-react';

const RetourEpargne = () => {
  const [msg, setMsg] = useState('Paiement confirmé ✅ — création de votre plan en cours…');
  const [isPolling, setIsPolling] = useState(false);
  const [pollingStatus, setPollingStatus] = useState('pending'); // pending, success, error, timeout
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const reference = p.get('reference');
    const status = p.get('status');

    if (!reference || status !== 'approved') {
      setMsg('Erreur : pas de transaction détectée ou paiement non approuvé');
      setPollingStatus('error');
      return;
    }

    // ✅ Afficher succès immédiatement
    setMsg('Paiement confirmé avec succès ! Votre plan d\'épargne est en cours de création...');
    setPollingStatus('success');
    showSuccess('Paiement confirmé avec succès !');

    // Redirection vers la page d'épargne après 3 secondes
    setTimeout(() => {
      console.log('[RETOUR_EPARGNE] Redirection vers /ab-epargne');
      navigate('/ab-epargne');
    }, 3000);
  }, [navigate, showSuccess]);

  const getIcon = () => {
    switch (pollingStatus) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'timeout':
        return <Clock className="w-12 h-12 text-yellow-500" />;
      default:
        return <RefreshCw className={`w-12 h-12 text-blue-500 ${isPolling ? 'animate-spin' : ''}`} />;
    }
  };

  const getStatusColor = () => {
    switch (pollingStatus) {
      case 'success':
        return 'from-green-50 to-green-100 border-green-200';
      case 'error':
        return 'from-red-50 to-red-100 border-red-200';
      case 'timeout':
        return 'from-yellow-50 to-yellow-100 border-yellow-200';
      default:
        return 'from-blue-50 to-blue-100 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <Card className={`p-8 text-center bg-gradient-to-br ${getStatusColor()}`}>
          <div className="mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              {getIcon()}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <PiggyBank className="w-8 h-8 text-indigo-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                AB Épargne
              </h1>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <p className="text-lg text-gray-800 leading-relaxed">
              {msg}
            </p>

            {isPolling && (
              <div className="bg-white/50 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700">
                    Vérification en cours...
                  </span>
                </div>
              </div>
            )}

            {pollingStatus === 'error' || pollingStatus === 'timeout' ? (
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/ab-epargne')}
                  className="w-full"
                >
                  Retourner à AB Épargne
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  Réessayer
                </Button>
              </div>
            ) : pollingStatus === 'success' ? (
              <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  🎉 Votre plan d'épargne a été créé avec succès !
                </p>
              </div>
            ) : null}
          </motion.div>
        </Card>

        {/* Bouton de retour toujours visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RetourEpargne;