import React, { useState } from 'react';
import { X, CreditCard, User, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { formatCurrency } from '../../utils/helpers';

const WithdrawalRequestModal = ({ plan, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1 = Formulaire, 2 = Confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    recipientName: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleNext = () => {
    // Validation
    if (!formData.phoneNumber || !formData.recipientName) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    // Validation du numéro de téléphone (format basique)
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('Numéro de téléphone invalide');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('[WITHDRAWAL] Création de la demande de retrait...');

      // Créer la demande de retrait
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .insert([{
          user_id: plan.user_id,
          savings_plan_id: plan.id,
          amount: plan.current_balance,
          phone_number: formData.phoneNumber,
          recipient_name: formData.recipientName,
          status: 'pending'
        }])
        .select()
        .single();

      if (withdrawalError) {
        console.error('[WITHDRAWAL] Erreur création demande:', withdrawalError);
        throw new Error('Erreur lors de la création de la demande');
      }

      console.log('[WITHDRAWAL] Demande créée:', withdrawalData);

      // Mettre à jour le statut du plan en 'withdrawal_pending'
      const { error: updateError } = await supabase
        .from('savings_plans')
        .update({ 
          status: 'withdrawal_pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', plan.id);

      if (updateError) {
        console.error('[WITHDRAWAL] Erreur mise à jour plan:', updateError);
      }

      // Créer une notification pour l'admin
      const { data: adminData } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .single();

      if (adminData) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: adminData.id,
            title: 'Nouvelle demande de retrait',
            message: `${plan.user?.first_name} ${plan.user?.last_name} demande un retrait de ${formatCurrency(plan.current_balance)}`,
            type: 'withdrawal_request',
            data: {
              withdrawal_id: withdrawalData.id,
              plan_id: plan.id,
              user_id: plan.user_id,
              amount: plan.current_balance
            }
          }]);

        // Envoyer une notification push à l'admin
        try {
          const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
          const notifResponse = await fetch(`${BACKEND_URL}/api/notify-admin-withdrawal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              withdrawalId: withdrawalData.id,
              clientName: `${plan.user?.first_name} ${plan.user?.last_name}`,
              amount: plan.current_balance,
              userId: plan.user_id
            })
          });

          if (notifResponse.ok) {
            console.log('[WITHDRAWAL] ✅ Notification push envoyée à l\'admin');
          } else {
            console.error('[WITHDRAWAL] ⚠️ Erreur notification push:', await notifResponse.text());
          }
        } catch (notifError) {
          console.error('[WITHDRAWAL] ⚠️ Erreur envoi notification push:', notifError);
          // Ne pas bloquer la demande si la notification échoue
        }
      }

      console.log('[WITHDRAWAL] ✅ Demande de retrait envoyée avec succès');
      
      if (onSuccess) {
        onSuccess('Demande de retrait envoyée avec succès !');
      }
      
      onClose();
    } catch (err) {
      console.error('[WITHDRAWAL] Erreur:', err);
      setError(err.message || 'Erreur lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-bold">Demande de retrait</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-green-100 text-sm">
            {step === 1 ? 'Étape 1/2 : Informations de transfert' : 'Étape 2/2 : Confirmation'}
          </p>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {step === 1 ? (
            /* Étape 1 : Formulaire */
            <div className="space-y-6">
              {/* Info plan */}
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <p className="text-sm text-green-800 mb-2">Montant disponible</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(plan.current_balance)}
                </p>
              </div>

              {/* Numéro de téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} />
                    Numéro de téléphone Mobile Money
                  </div>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+229 XX XX XX XX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Le numéro qui recevra le transfert
                </p>
              </div>

              {/* Nom du bénéficiaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User size={18} />
                    Nom sur le numéro
                  </div>
                </label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="Nom complet du bénéficiaire"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Le nom associé au numéro Mobile Money
                </p>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={20} className="text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Bouton suivant */}
              <button
                onClick={handleNext}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Suivant
              </button>
            </div>
          ) : (
            /* Étape 2 : Confirmation */
            <div className="space-y-6">
              {/* Récapitulatif */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500 rounded-xl">
                    <CheckCircle size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Récapitulatif</h4>
                    <p className="text-sm text-gray-600">Vérifiez les informations</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-green-200">
                    <span className="text-sm text-gray-600">Montant</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(plan.current_balance)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-green-200">
                    <span className="text-sm text-gray-600">Numéro</span>
                    <span className="font-semibold text-gray-900">{formData.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Bénéficiaire</span>
                    <span className="font-semibold text-gray-900">{formData.recipientName}</span>
                  </div>
                </div>
              </div>

              {/* Info importante */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                  ℹ️ Votre demande sera traitée par un administrateur. Vous recevrez une notification une fois le transfert effectué.
                </p>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={20} className="text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
                >
                  Retour
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Envoi...</span>
                    </div>
                  ) : (
                    'Confirmer le retrait'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalRequestModal;

