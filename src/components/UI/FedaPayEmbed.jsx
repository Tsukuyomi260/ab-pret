import React, { useEffect, useRef, useState } from 'react';
import { X, Loader, CreditCard, Smartphone, CheckCircle } from 'lucide-react';

const FedaPayEmbed = ({ 
  transactionId, 
  publicKey, 
  amount, 
  currency = 'XOF',
  onSuccess, 
  onError, 
  onClose 
}) => {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStep, setPaymentStep] = useState('loading'); // loading, payment, success, error
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    console.log('[FEDAPAY_EMBED] Vérification des données:', {
      transactionId,
      publicKey: publicKey ? `${publicKey.substring(0, 10)}...` : 'NON CONFIGURÉE',
      amount,
      currency
    });

    if (!transactionId || !publicKey) {
      const errorMsg = `Données de transaction manquantes - Transaction ID: ${transactionId}, Public Key: ${publicKey ? 'CONFIGURÉE' : 'NON CONFIGURÉE'}`;
      console.error('[FEDAPAY_EMBED] Erreur:', errorMsg);
      setError(errorMsg);
      return;
    }

    // Simuler le chargement
    setTimeout(() => {
      setLoading(false);
      setPaymentStep('payment');
    }, 2000);

  }, [transactionId, publicKey, amount, onSuccess, onError, onClose]);

  const handlePaymentMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedMethod || !phoneNumber) {
      return;
    }

    setProcessing(true);
    
    // Simuler le traitement du paiement
    setTimeout(() => {
      setProcessing(false);
      setPaymentStep('success');
      
      // Simuler le succès du paiement
      setTimeout(() => {
        onSuccess({
          transaction_id: transactionId,
          status: 'approved',
          amount: amount,
          paid_at: new Date().toISOString(),
          fedapay_data: {
            payment_method: selectedMethod,
            phone_number: phoneNumber
          }
        });
      }, 2000);
    }, 3000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CI', {
      style: 'currency',
      currency: currency
    }).format(amount / 100);
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <button
              onClick={onClose}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">F</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Paiement FedaPay</h3>
              <p className="text-sm text-gray-600">
                Montant: {formatCurrency(amount)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <Loader className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Chargement du formulaire de paiement...</p>
            </div>
          )}

          {paymentStep === 'payment' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Choisissez votre méthode de paiement</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => handlePaymentMethodSelect('moov')}
                    className={`w-full p-4 border-2 rounded-xl flex items-center space-x-3 transition-colors ${
                      selectedMethod === 'moov' 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">M</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Moov Money</p>
                      <p className="text-sm text-gray-600">Paiement via Moov Money</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handlePaymentMethodSelect('mtn')}
                    className={`w-full p-4 border-2 rounded-xl flex items-center space-x-3 transition-colors ${
                      selectedMethod === 'mtn' 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 font-bold text-sm">M</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">MTN Mobile Money</p>
                      <p className="text-sm text-gray-600">Paiement via MTN</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handlePaymentMethodSelect('orange')}
                    className={`w-full p-4 border-2 rounded-xl flex items-center space-x-3 transition-colors ${
                      selectedMethod === 'orange' 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">O</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Orange Money</p>
                      <p className="text-sm text-gray-600">Paiement via Orange</p>
                    </div>
                  </button>
                </div>
              </div>

              {selectedMethod && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ex: +225 0701234567"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}

              <button
                onClick={handlePaymentSubmit}
                disabled={!selectedMethod || !phoneNumber || processing}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Payer {formatCurrency(amount)}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Paiement réussi !</h4>
              <p className="text-gray-600 mb-4">
                Votre paiement de {formatCurrency(amount)} a été traité avec succès.
              </p>
              <p className="text-sm text-gray-500">
                Redirection en cours...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FedaPayEmbed;
