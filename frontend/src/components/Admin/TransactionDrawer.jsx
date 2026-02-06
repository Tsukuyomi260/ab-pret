import React from 'react';
import { X, User, Calendar, Clock, DollarSign, CreditCard, AlertTriangle, CheckCircle, Receipt } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const TransactionDrawer = ({ transaction, isOpen, onClose }) => {
  if (!isOpen || !transaction) return null;

  const user = transaction.users || transaction.loans?.users;
  const loan = transaction.loans;
  const paymentDate = transaction.payment_date || transaction.created_at;
  const dateObj = new Date(paymentDate);
  const formattedDate = dateObj.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  const formattedTime = dateObj.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Calculer les intérêts
  const loanAmount = loan?.amount || 0;
  const interestRate = loan?.interest_rate || 0;
  const interestAmount = Math.round(loanAmount * (interestRate / 100));
  
  // Vérifier si en pénalité (statut failed ou overdue)
  const isPenalty = transaction.status === 'failed' || transaction.status === 'overdue';
  const isSuccess = transaction.status === 'completed' || transaction.status === 'success';

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 pb-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Receipt size={24} />
              </div>
              <h2 className="text-xl font-bold">Détails de la transaction</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-120px)] px-6 py-6">
          {/* Statut */}
          <div className="mb-6">
            <div className={`flex items-center gap-3 p-4 rounded-2xl ${
              isSuccess 
                ? 'bg-green-50 border border-green-200' 
                : isPenalty 
                ? 'bg-red-50 border border-red-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              {isSuccess ? (
                <CheckCircle size={24} className="text-green-600" />
              ) : isPenalty ? (
                <AlertTriangle size={24} className="text-red-600" />
              ) : (
                <Clock size={24} className="text-yellow-600" />
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {isSuccess ? 'Transaction réussie' : isPenalty ? 'Transaction échouée' : 'En attente'}
                </p>
                <p className="text-sm text-gray-600 capitalize">{transaction.status}</p>
              </div>
            </div>
          </div>

          {/* Montant */}
          <div className="mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign size={24} className="text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Montant</span>
              </div>
              <p className="text-3xl font-bold text-purple-900">{formatCurrency(transaction.amount || 0)}</p>
            </div>
          </div>

          {/* Informations utilisateur */}
          {user && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <User size={18} className="text-purple-600" />
                Utilisateur
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Nom complet</p>
                  <p className="font-semibold text-gray-900">
                    {user.first_name} {user.last_name}
                  </p>
                </div>
                {user.email && (
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-700">{user.email}</p>
                  </div>
                )}
                {user.phone_number && (
                  <div>
                    <p className="text-xs text-gray-500">Téléphone</p>
                    <p className="text-gray-700">{user.phone_number}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informations prêt */}
          {loan && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CreditCard size={18} className="text-purple-600" />
                Prêt associé
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Montant du prêt</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(loanAmount)}</p>
                </div>
                {loan.purpose && (
                  <div>
                    <p className="text-xs text-gray-500">Objectif</p>
                    <p className="text-gray-700">{loan.purpose}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">Taux d'intérêt</p>
                  <p className="text-gray-700">{interestRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Montant des intérêts</p>
                  <p className="font-semibold text-purple-700">{formatCurrency(interestAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Statut du prêt</p>
                  <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${
                    loan.status === 'completed' ? 'bg-green-100 text-green-700' :
                    loan.status === 'active' || loan.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                    loan.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {loan.status === 'completed' ? 'Remboursé' :
                     loan.status === 'active' || loan.status === 'approved' ? 'Actif' :
                     loan.status === 'pending' ? 'En attente' : 'Rejeté'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Date et heure */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Calendar size={18} className="text-purple-600" />
              Date et heure
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <p className="text-gray-700">{formattedDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <p className="text-gray-700">{formattedTime}</p>
              </div>
            </div>
          </div>

          {/* Informations transaction */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Informations transaction</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {transaction.payment_method && (
                <div>
                  <p className="text-xs text-gray-500">Méthode de paiement</p>
                  <p className="text-gray-700 capitalize">{transaction.payment_method}</p>
                </div>
              )}
              {transaction.fedapay_transaction_id && (
                <div>
                  <p className="text-xs text-gray-500">ID Transaction FedaPay</p>
                  <p className="text-gray-700 font-mono text-sm">{transaction.fedapay_transaction_id}</p>
                </div>
              )}
              {transaction.id && (
                <div>
                  <p className="text-xs text-gray-500">ID Transaction</p>
                  <p className="text-gray-700 font-mono text-sm">{transaction.id}</p>
                </div>
              )}
            </div>
          </div>

          {/* Pénalité */}
          {isPenalty && (
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={20} className="text-red-600" />
                  <p className="font-semibold text-red-900">Transaction en pénalité</p>
                </div>
                <p className="text-sm text-red-700">
                  Cette transaction a échoué ou est en retard de paiement.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TransactionDrawer;
