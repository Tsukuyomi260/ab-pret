import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { 
  PiggyBank,
  ArrowLeft,
  Plus,
  Minus,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Wallet,
  CreditCard,
  Banknote,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ABEpargne = () => {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);

  // Données fictives du compte épargne
  const [savingsData, setSavingsData] = useState({
    balance: 125000,
    monthlyGoal: 50000,
    monthlySaved: 35000,
    interestRate: 3.5,
    totalInterest: 8750,
    transactions: [
      {
        id: 1,
        type: 'deposit',
        amount: 25000,
        date: '2024-01-15',
        description: 'Dépôt mensuel'
      },
      {
        id: 2,
        type: 'withdrawal',
        amount: 15000,
        date: '2024-01-10',
        description: 'Retrait pour vacances'
      },
      {
        id: 3,
        type: 'deposit',
        amount: 10000,
        date: '2024-01-05',
        description: 'Dépôt ponctuel'
      }
    ]
  });

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    
    setIsProcessing(true);
    
    // Simulation d'une transaction
    setTimeout(() => {
      const amount = parseFloat(depositAmount);
      setSavingsData(prev => ({
        ...prev,
        balance: prev.balance + amount,
        monthlySaved: prev.monthlySaved + amount,
        transactions: [
          {
            id: Date.now(),
            type: 'deposit',
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            description: 'Dépôt effectué'
          },
          ...prev.transactions
        ]
      }));
      
      setDepositAmount('');
      setShowDepositModal(false);
      setIsProcessing(false);
      setTransactionSuccess(true);
      
      setTimeout(() => setTransactionSuccess(false), 3000);
    }, 1500);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    
    const amount = parseFloat(withdrawAmount);
    if (amount > savingsData.balance) {
      alert('Montant insuffisant sur votre compte épargne');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulation d'une transaction
    setTimeout(() => {
      setSavingsData(prev => ({
        ...prev,
        balance: prev.balance - amount,
        transactions: [
          {
            id: Date.now(),
            type: 'withdrawal',
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            description: 'Retrait effectué'
          },
          ...prev.transactions
        ]
      }));
      
      setWithdrawAmount('');
      setShowWithdrawModal(false);
      setIsProcessing(false);
      setTransactionSuccess(true);
      
      setTimeout(() => setTransactionSuccess(false), 3000);
    }, 1500);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-0">
      {/* Section Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 opacity-15"></div>
        
        <div className="relative px-4 lg:px-8 py-8 lg:py-12 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <motion.button
                onClick={() => navigate('/menu')}
                className="flex items-center space-x-2 text-green-700 hover:text-green-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Retour au menu</span>
              </motion.button>
              
              <motion.button
                onClick={() => setShowBalance(!showBalance)}
                className="flex items-center space-x-2 text-green-700 hover:text-green-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
                <span className="font-medium">{showBalance ? 'Masquer' : 'Afficher'}</span>
              </motion.button>
            </div>

            {/* Titre */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 rounded-full border border-green-200 mb-6"
              >
                <PiggyBank size={20} className="text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  AB Épargne
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl lg:text-6xl font-bold text-gray-900 font-montserrat mb-4"
              >
                Mon{' '}
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Compte Épargne
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-gray-600 font-montserrat"
              >
                Gérez vos économies et suivez vos objectifs financiers
              </motion.p>
            </div>

            {/* Solde principal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <div className="p-8 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <PiggyBank size={32} className="mr-3" />
                    <h2 className="text-2xl font-bold">Solde disponible</h2>
                  </div>
                  
                  <div className="text-5xl lg:text-7xl font-bold mb-4">
                    {showBalance ? formatCurrency(savingsData.balance) : '••••••'}
                  </div>
                  
                  <div className="flex items-center justify-center space-x-4 text-green-100">
                    <div className="flex items-center space-x-1">
                      <TrendingUp size={16} />
                      <span className="text-sm">{savingsData.interestRate}% d'intérêts</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign size={16} />
                      <span className="text-sm">+{formatCurrency(savingsData.totalInterest)} d'intérêts</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Actions principales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => setShowDepositModal(true)}
                  className="w-full p-6 h-auto flex-col space-y-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl"
                >
                  <div className="p-3 bg-white/20 rounded-full">
                    <Plus size={24} />
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-semibold">Faire un dépôt</span>
                    <p className="text-sm opacity-90">Ajouter de l'argent à votre épargne</p>
                  </div>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => setShowWithdrawModal(true)}
                  className="w-full p-6 h-auto flex-col space-y-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
                >
                  <div className="p-3 bg-white/20 rounded-full">
                    <Minus size={24} />
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-semibold">Faire un retrait</span>
                    <p className="text-sm opacity-90">Retirer de l'argent de votre épargne</p>
                  </div>
                </Button>
              </motion.div>
            </motion.div>

            {/* Statistiques */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
            >
              <Card className="bg-white">
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Target size={24} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Objectif mensuel</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(savingsData.monthlyGoal)}
                  </p>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(savingsData.monthlySaved / savingsData.monthlyGoal) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {Math.round((savingsData.monthlySaved / savingsData.monthlyGoal) * 100)}% atteint
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-white">
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <TrendingUp size={24} className="text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Épargné ce mois</h3>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(savingsData.monthlySaved)}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Sur {formatCurrency(savingsData.monthlyGoal)}
                  </p>
                </div>
              </Card>

              <Card className="bg-white">
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <DollarSign size={24} className="text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Taux d'intérêt</h3>
                  <p className="text-2xl font-bold text-teal-600">
                    {savingsData.interestRate}%
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Intérêts annuels
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Historique des transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-white">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Historique des transactions</h3>
                  
                  <div className="space-y-4">
                    {savingsData.transactions.slice(0, 5).map((transaction) => (
                      <motion.div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-full ${
                            transaction.type === 'deposit' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.type === 'deposit' ? (
                              <ArrowUpRight size={20} />
                            ) : (
                              <ArrowDownRight size={20} />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                          </div>
                        </div>
                        <div className={`font-bold ${
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de dépôt */}
      {showDepositModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                <Plus size={24} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Faire un dépôt</h3>
              <p className="text-gray-600 mt-2">Entrez le montant à déposer</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (XAF)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isProcessing}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowDepositModal(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleDeposit}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!depositAmount || isProcessing}
                >
                  {isProcessing ? 'Traitement...' : 'Déposer'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal de retrait */}
      {showWithdrawModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <Minus size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Faire un retrait</h3>
              <p className="text-gray-600 mt-2">Entrez le montant à retirer</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (XAF)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isProcessing}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowWithdrawModal(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleWithdraw}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!withdrawAmount || isProcessing}
                >
                  {isProcessing ? 'Traitement...' : 'Retirer'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Notification de succès */}
      {transactionSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-xl shadow-lg z-50"
        >
          <div className="flex items-center space-x-3">
            <CheckCircle size={20} />
            <span>Transaction effectuée avec succès !</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ABEpargne; 