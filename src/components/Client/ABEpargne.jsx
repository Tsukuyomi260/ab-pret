import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import FedaPayButton from '../UI/FedaPayButton';
import { 
  getSavingsAccount, 
  getSavingsTransactions, 
  createSavingsTransaction, 
  updateSavingsAccount,
  getSavingsPlanStatus,
  createSavingsPlan,
  getActiveSavingsPlan
} from '../../utils/supabaseAPI';
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
  AlertCircle,
  Clock,
  Calculator,
  Info,
  BarChart3,
  FileText,
  Smartphone,
  ArrowRight,
  Bell,
  Trophy,
  Settings,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

const ABEpargne = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [showBalance, setShowBalance] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showPlanConfigModal, setShowPlanConfigModal] = useState(false);
  const [showAccountCreationModal, setShowAccountCreationModal] = useState(false);
  const [showFeesPaymentModal, setShowFeesPaymentModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  
  // États pour le système de dépôts - ÉTAPE 4
  const [depositData, setDepositData] = useState({
    amount: '',
    paymentMethod: '',
    minimumAmount: 300,
    validationErrors: []
  });
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  // États pour le système de rappels automatiques - ÉTAPE 5
  const [reminders, setReminders] = useState([]);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [nextReminder, setNextReminder] = useState(null);
  const [reminderProcessing, setReminderProcessing] = useState(false);
  
  // États pour le calcul automatique des intérêts - ÉTAPE 6
  const [interestData, setInterestData] = useState({
    lastInterestCalculation: null,
    nextInterestDate: null,
    monthlyInterestRate: 0.05, // 5% par mois
    totalInterestEarned: 0,
    interestHistory: []
  });
  const [interestCalculationProcessing, setInterestCalculationProcessing] = useState(false);
  
  // États pour le système de retraits - ÉTAPE 7
  const [withdrawData, setWithdrawData] = useState({
    amount: '',
    withdrawalMethod: '',
    minimumWithdrawal: 1000,
    maximumWithdrawal: 0,
    validationErrors: []
  });
  const [showWithdrawalMethods, setShowWithdrawalMethods] = useState(false);
  const [withdrawalProcessing, setWithdrawalProcessing] = useState(false);
  
  // États pour la gestion de fin de période - ÉTAPE 8
  const [planEndData, setPlanEndData] = useState({
    isPlanCompleted: false,
    completionDate: null,
    finalBalance: 0,
    finalInterest: 0,
    totalEarned: 0
  });
  const [showPlanCompletionModal, setShowPlanCompletionModal] = useState(false);
  const [showPlanOptionsModal, setShowPlanOptionsModal] = useState(false);
  
  // États pour les règles de sécurité et restrictions - ÉTAPE 9
  const [securityRules, setSecurityRules] = useState({
    earlyWithdrawalPenalty: 0.10, // 10% de pénalité
    minimumWithdrawalPeriod: 0, // Période minimale en jours
    forceMajeureContact: 'abpret51@gmail.com',
    whatsappContact: '+225 0700000000', // Numéro WhatsApp standard de l'app
    showPenaltyWarning: false,
    penaltyAmount: 0,
    netWithdrawalAmount: 0
  });
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [showForceMajeureModal, setShowForceMajeureModal] = useState(false);
  
  // États pour la section informative - ÉTAPE 10
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeFAQCategory, setActiveFAQCategory] = useState('general');
  const [expandedFAQItems, setExpandedFAQItems] = useState(new Set());
  
  // État pour le popup des détails du plan en mobile
  const [showPlanDetailsModal, setShowPlanDetailsModal] = useState(false);

  // États de progression du compte épargne
  const [accountStatus, setAccountStatus] = useState({
    hasAccount: false,        // A-t-il déjà un compte AB Epargne ?
    hasConfiguredPlan: false, // A-t-il configuré un plan d'épargne ?
    isFirstVisit: true        // Première visite sur AB Epargne ?
  });

  // Plan d'épargne actif (une fois configuré)
  const [activePlan, setActivePlan] = useState(null);

  // Configuration du plan d'épargne - ÉTAPE 1
  const [planConfig, setPlanConfig] = useState({
    fixedAmount: '',
    frequency: '5', // 5 ou 10 jours
    duration: '1', // 1, 2, 3 mois ou plus
    totalDeposits: 0,
    totalAmount: 0,
    estimatedBenefits: 0,
    creationFees: 1000,
    totalWithFees: 0
  });

  // Données du compte épargne
  const [savingsData, setSavingsData] = useState({
    balance: 0,
    monthlyGoal: 50000, // Sera remplacé par l'objectif du plan
    monthlySaved: 0,
    interestRate: 5.0, // 5% par mois
    totalInterest: 0,
    transactions: [],
    // Données du plan
    planName: 'Plan Campus Finance',
    fixedAmount: 100,
    frequencyDays: 10,
    durationMonths: 3,
    totalDepositsRequired: 9,
    completedDeposits: 0,
    completionPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  
  // États pour le tableau de bord principal - ÉTAPE 3
  const [dashboardData, setDashboardData] = useState({
    currentBalance: 0,
    accumulatedInterest: 0,
    planProgress: {
      depositsMade: 0,
      depositsRemaining: 0,
      percentage: 0
    },
    nextDepositDate: null,
    estimatedTotalAtEnd: 0
  });

  const loadSavingsData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Vérifier le statut du plan d'épargne
        const planStatusResult = await getSavingsPlanStatus(user.id);
        
        if (planStatusResult.success) {
          const planStatus = planStatusResult.data;
          
          // Mettre à jour le statut du compte
          setAccountStatus({
            hasAccount: planStatus.hasAccount,
            hasConfiguredPlan: planStatus.hasConfiguredPlan,
            isFirstVisit: planStatus.isFirstVisit
          });

          // Si c'est la première visite sur AB Épargne, afficher le modal de configuration
          if (planStatus.isFirstVisit) {
            setShowPlanConfigModal(true);
          }

          // Récupérer le plan actif s'il existe
          if (planStatus.hasConfiguredPlan) {
            const activePlanResult = await getActiveSavingsPlan(user.id);
            if (activePlanResult.success && activePlanResult.data) {
              setActivePlan(activePlanResult.data);
            }
          }
        }
        
        // Récupérer le compte épargne et les transactions
        const [accountResult, transactionsResult] = await Promise.all([
          getSavingsAccount(user.id),
          getSavingsTransactions(user.id)
        ]);

        if (accountResult.success && transactionsResult.success) {
          const account = accountResult.data;
          console.log('[ABEPARGNE] Données chargées:', { account, transactions: transactionsResult.data });
          const transactions = transactionsResult.data || [];

          // Formater les transactions pour l'affichage
          const formattedTransactions = transactions.map(transaction => ({
            id: transaction.id,
            type: transaction.type,
            amount: transaction.amount,
            date: transaction.created_at,
            description: transaction.description || 'Transaction'
          }));

          // Gérer le cas où le compte n'existe pas encore
          if (account) {
            // Utiliser les données du plan actif si disponible, sinon les données du compte
            const planData = activePlan || {};
            setSavingsData({
              balance: account.balance || 0,
              monthlyGoal: planData.total_amount_target || account.monthly_goal || 50000, // Objectif du plan
              monthlySaved: 0, // Calculé dynamiquement
              interestRate: account.interest_rate || 5.0, // 5% par mois
              totalInterest: account.total_interest || 0,
              transactions: formattedTransactions,
              // Ajouter les données du plan
              planName: planData.plan_name || 'Plan Campus Finance',
              fixedAmount: planData.fixed_amount || 100,
              frequencyDays: planData.frequency_days || 10,
              durationMonths: planData.duration_months || 3,
              totalDepositsRequired: planData.total_deposits_required || 9,
              completedDeposits: planData.completed_deposits || 0,
              completionPercentage: planData.completion_percentage || 0
            });
          } else {
            // Compte n'existe pas encore, initialiser avec des valeurs par défaut
            setSavingsData({
              balance: 0,
              monthlyGoal: 50000,
              monthlySaved: 0,
              interestRate: 5.0, // 5% par mois
              totalInterest: 0,
              transactions: []
            });
          }
        } else {
          console.error('[ABEPARGNE] Erreur lors du chargement des données:', {
            account: accountResult.error,
            transactions: transactionsResult.error
          });
          showError('Erreur lors du chargement des données');
        }
      } catch (error) {
        console.error('[ABEPARGNE] Erreur lors du chargement:', error.message);
        showError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadSavingsData();
  }, [user?.id, showError]);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      showError('Veuillez entrer un montant valide');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const amount = parseFloat(depositAmount);
      
      // Créer la transaction
      const transactionData = {
        user_id: user.id,
        type: 'deposit',
        amount: amount,
        description: 'Dépôt effectué'
      };

      const transactionResult = await createSavingsTransaction(transactionData);
      
      if (transactionResult.success) {
        // Mettre à jour le compte épargne
        const newBalance = savingsData.balance + amount;
        
        const updateResult = await updateSavingsAccount(user.id, {
          balance: newBalance
        });

        if (updateResult.success) {
          // Mettre à jour l'état local
          setSavingsData(prev => ({
            ...prev,
            balance: newBalance,
            transactions: [
              {
                id: transactionResult.data.id,
                type: 'deposit',
                amount: amount,
                date: transactionResult.data.created_at,
                description: 'Dépôt effectué'
              },
              ...prev.transactions
            ]
          }));
          
          setDepositAmount('');
          setShowDepositModal(false);
          setTransactionSuccess(true);
          showSuccess('Dépôt effectué avec succès');
          
          setTimeout(() => setTransactionSuccess(false), 3000);
        } else {
          showError('Erreur lors de la mise à jour du compte');
        }
      } else {
        showError('Erreur lors de la création de la transaction');
      }
    } catch (error) {
      console.error('[ABEPARGNE] Erreur lors du dépôt:', error.message);
      showError('Erreur lors du dépôt');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      showError('Veuillez entrer un montant valide');
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    if (amount > savingsData.balance) {
      showError('Montant insuffisant sur votre compte épargne');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Créer la transaction de retrait
      const transactionData = {
        user_id: user.id,
        type: 'withdrawal',
        amount: amount,
        description: 'Retrait effectué'
      };

      const transactionResult = await createSavingsTransaction(transactionData);
      
      if (transactionResult.success) {
        // Mettre à jour le compte épargne
        const newBalance = savingsData.balance - amount;
        
        const updateResult = await updateSavingsAccount(user.id, {
          balance: newBalance
        });

        if (updateResult.success) {
          // Mettre à jour l'état local
          setSavingsData(prev => ({
            ...prev,
            balance: newBalance,
            transactions: [
              {
                id: transactionResult.data.id,
                type: 'withdrawal',
                amount: amount,
                date: transactionResult.data.created_at,
                description: 'Retrait effectué'
              },
              ...prev.transactions
            ]
          }));
          
          setWithdrawAmount('');
          setShowWithdrawModal(false);
          setTransactionSuccess(true);
          showSuccess('Retrait effectué avec succès');
          
          setTimeout(() => setTransactionSuccess(false), 3000);
        } else {
          showError('Erreur lors de la mise à jour du compte');
        }
      } else {
        showError('Erreur lors de la création de la transaction');
      }
    } catch (error) {
      console.error('[ABEPARGNE] Erreur lors du retrait:', error.message);
      showError('Erreur lors du retrait');
    } finally {
      setIsProcessing(false);
    }
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

  // Fonctions de calcul du plan d'épargne - ÉTAPE 1
  const calculatePlanDetails = () => {
    const amount = parseFloat(planConfig.fixedAmount) || 0;
    const frequency = parseInt(planConfig.frequency);
    const duration = parseInt(planConfig.duration);
    
    if (amount < 300) {
      setPlanConfig(prev => ({
        ...prev,
        totalDeposits: 0,
        totalAmount: 0,
        estimatedBenefits: 0,
        totalWithFees: prev.creationFees
      }));
      return;
    }

    // Calculer le nombre de dépôts sur la période
    const daysInPeriod = duration * 30;
    const totalDeposits = Math.floor(daysInPeriod / frequency);
    
    // Calculer le montant total
    const totalAmount = totalDeposits * amount;
    
    // Calculer les bénéfices estimés (5% par mois)
    const estimatedBenefits = (totalAmount * 0.05 * duration);
    
    // Calculer le total avec frais
    const totalWithFees = totalAmount + planConfig.creationFees;

    setPlanConfig(prev => ({
      ...prev,
      totalDeposits,
      totalAmount,
      estimatedBenefits,
      totalWithFees
    }));
  };

  const handlePlanConfigChange = (field, value) => {
    setPlanConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonction pour créer le plan d'épargne
  const handleCreatePlan = async () => {
    console.log('[ABEPARGNE] handleCreatePlan appelé');
    console.log('[ABEPARGNE] planConfig:', planConfig);
    console.log('[ABEPARGNE] user:', user);
    
    // Vérification du montant minimum
    if (planConfig.fixedAmount < 300) {
      showError('Le montant minimum est de 300 FCFA');
      return;
    }

    // Afficher le modal de paiement des frais
    setShowFeesPaymentModal(true);
  };

  // Fonction pour créer le plan d'épargne après paiement réussi
  const createSavingsPlanAfterPayment = async (paymentResponse) => {
    console.log('[ABEPARGNE] ===== DÉBUT CRÉATION PLAN =====');
    console.log('[ABEPARGNE] Création du plan après paiement:', paymentResponse);
    console.log('[ABEPARGNE] User ID:', user?.id);
    console.log('[ABEPARGNE] Plan config:', planConfig);
    
    // Vérifier que nous avons les données nécessaires
    if (!user?.id) {
      console.error('[ABEPARGNE] User ID manquant');
      showError('Erreur: Utilisateur non identifié');
      return;
    }
    
    if (!planConfig || !planConfig.fixedAmount) {
      console.error('[ABEPARGNE] Configuration du plan manquante');
      showError('Erreur: Configuration du plan manquante');
      return;
    }
    
    try {
      console.log('[ABEPARGNE] Appel de createSavingsPlan...');
      // Créer le plan d'épargne
      const planResult = await createSavingsPlan(user.id, planConfig);
      console.log('[ABEPARGNE] Résultat createSavingsPlan:', planResult);
      
      if (planResult.success) {
        console.log('[ABEPARGNE] Plan créé avec succès, données:', planResult.data);
        
        // Mettre à jour l'état local
        setActivePlan(planResult.data);
        setAccountStatus(prev => ({
          ...prev,
          hasConfiguredPlan: true,
          isFirstVisit: false
        }));
        
        // Fermer tous les modals
        console.log('[ABEPARGNE] Fermeture des modals...');
        setShowPlanConfigModal(false);
        setShowFeesPaymentModal(false);
        
        showSuccess('Plan d\'épargne créé avec succès ! Vous pouvez maintenant commencer votre épargne.');
        
        // Recharger les données pour afficher le plan configuré
        setTimeout(() => {
          console.log('[ABEPARGNE] Rechargement des données après création du plan...');
          loadSavingsData();
        }, 1500);
      } else {
        console.error('[ABEPARGNE] Échec de création du plan:', planResult.error);
        showError('Erreur lors de la création du plan d\'épargne: ' + (planResult.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('[ABEPARGNE] Erreur lors de la création du plan après paiement:', error);
      showError('Erreur lors de la création du plan: ' + error.message);
    }
    
    console.log('[ABEPARGNE] ===== FIN CRÉATION PLAN =====');
  };

  // Fonction pour calculer les données du tableau de bord - ÉTAPE 3
  const calculateDashboardData = useCallback(() => {
    if (!activePlan) return;

    const now = new Date();
    const planStartDate = new Date(activePlan.createdAt);
    const frequency = parseInt(activePlan.frequency);
    const fixedAmount = parseFloat(activePlan.fixedAmount);
    const duration = parseInt(activePlan.duration);

    // Calculer les dépôts effectués et restants
    const daysSinceStart = Math.floor((now - planStartDate) / (1000 * 60 * 60 * 24));
    const depositsPerMonth = frequency === 5 ? 6 : 3;
    const totalDeposits = depositsPerMonth * duration;
    const depositsMade = Math.min(Math.floor(daysSinceStart / frequency), totalDeposits);
    const depositsRemaining = Math.max(0, totalDeposits - depositsMade);
    const percentage = Math.round((depositsMade / totalDeposits) * 100);

    // Calculer la date du prochain dépôt
    const lastDepositDate = new Date(planStartDate);
    lastDepositDate.setDate(lastDepositDate.getDate() + (depositsMade * frequency));
    const nextDepositDate = new Date(lastDepositDate);
    nextDepositDate.setDate(nextDepositDate.getDate() + frequency);

    // Calculer le montant total estimé à la fin
    const totalAmount = fixedAmount * totalDeposits;
    const monthlyInterest = 0.05;
    const estimatedBenefits = totalAmount * monthlyInterest * duration;
    const estimatedTotalAtEnd = totalAmount + estimatedBenefits;

    // Calculer les intérêts accumulés (basé sur le temps écoulé)
    const monthsElapsed = Math.min(daysSinceStart / 30, duration);
    const accumulatedInterest = (savingsData.balance * monthlyInterest * monthsElapsed);

    setDashboardData({
      currentBalance: savingsData.balance,
      accumulatedInterest: accumulatedInterest,
      planProgress: {
        depositsMade,
        depositsRemaining,
        percentage
      },
      nextDepositDate: nextDepositDate > now ? nextDepositDate : null,
      estimatedTotalAtEnd
    });
  }, [activePlan, savingsData.balance]);

  // Fonctions pour le système de dépôts - ÉTAPE 4
  const validateDepositAmount = useCallback((amount) => {
    const errors = [];
    const numAmount = parseFloat(amount);
    
    if (!amount || amount.trim() === '') {
      errors.push('Le montant est requis');
    } else if (isNaN(numAmount) || numAmount <= 0) {
      errors.push('Le montant doit être un nombre positif');
    } else if (numAmount < depositData.minimumAmount) {
      errors.push(`Le montant minimum est de ${formatCurrency(depositData.minimumAmount)}`);
    } else if (activePlan && numAmount !== parseFloat(activePlan.fixedAmount)) {
      errors.push(`Le montant doit être de ${formatCurrency(parseFloat(activePlan.fixedAmount))} selon votre plan`);
    }
    
    return errors;
  }, [depositData.minimumAmount, activePlan]);

  const handleDepositAmountChange = useCallback((value) => {
    setDepositData(prev => ({
      ...prev,
      amount: value,
      validationErrors: validateDepositAmount(value)
    }));
  }, [validateDepositAmount]);

  const handlePaymentMethodSelect = useCallback((method) => {
    setDepositData(prev => ({
      ...prev,
      paymentMethod: method
    }));
    setShowPaymentMethods(false);
  }, []);

  const processDepositPayment = useCallback(async () => {
    const errors = validateDepositAmount(depositData.amount);
    if (errors.length > 0) {
      setDepositData(prev => ({ ...prev, validationErrors: errors }));
      return;
    }

    if (!depositData.paymentMethod) {
      showError('Veuillez sélectionner un moyen de paiement');
      return;
    }

    setPaymentProcessing(true);
    
    try {
      // Simulation du processus de paiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Créer la transaction
      const transactionData = {
        user_id: user.id,
        type: 'deposit',
        amount: parseFloat(depositData.amount),
        description: `Dépôt via ${depositData.paymentMethod}`,
        payment_method: depositData.paymentMethod
      };

      const result = await createSavingsTransaction(transactionData);
      
      if (result.success) {
        // Mettre à jour le solde
        const newBalance = savingsData.balance + parseFloat(depositData.amount);
        await updateSavingsAccount(user.id, { balance: newBalance });
        
        // Mettre à jour les données locales
        setSavingsData(prev => ({
          ...prev,
          balance: newBalance,
          transactions: [result.data, ...prev.transactions]
        }));
        
        // Réinitialiser le formulaire
        setDepositData({
          amount: '',
          paymentMethod: '',
          minimumAmount: 300,
          validationErrors: []
        });
        setShowDepositModal(false);
        setShowPaymentMethods(false);
        
        showSuccess(`Dépôt de ${formatCurrency(parseFloat(depositData.amount))} effectué avec succès !`);
      } else {
        showError('Erreur lors du traitement du dépôt');
      }
    } catch (error) {
      console.error('[ABEPARGNE] Erreur lors du dépôt:', error);
      showError('Erreur lors du traitement du paiement');
    } finally {
      setPaymentProcessing(false);
    }
  }, [depositData, validateDepositAmount, user?.id, savingsData.balance, showSuccess, showError]);

  // Fonctions pour le système de rappels automatiques - ÉTAPE 5
  const generateReminders = useCallback(() => {
    if (!activePlan) return [];

    const reminders = [];
    const now = new Date();
    const planStartDate = new Date(activePlan.createdAt);
    const frequency = parseInt(activePlan.frequency);
    const fixedAmount = parseFloat(activePlan.fixedAmount);
    const duration = parseInt(activePlan.duration);

    // Calculer tous les dépôts prévus
    const totalDeposits = Math.floor((duration * 30) / frequency);
    
    for (let i = 0; i < totalDeposits; i++) {
      const depositDate = new Date(planStartDate);
      depositDate.setDate(depositDate.getDate() + (i * frequency));
      
      // Créer le rappel pour la veille
      const reminderDate = new Date(depositDate);
      reminderDate.setDate(reminderDate.getDate() - 1);
      
      // Ne créer que les rappels futurs
      if (reminderDate > now) {
        reminders.push({
          id: `reminder_${i}`,
          depositDate: depositDate,
          reminderDate: reminderDate,
          amount: fixedAmount,
          depositNumber: i + 1,
          totalDeposits: totalDeposits,
          isCompleted: false,
          isMarkedAsDeposited: false
        });
      }
    }

    return reminders;
  }, [activePlan]);

  const checkNextReminder = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextReminder = reminders.find(reminder => {
      const reminderDate = new Date(reminder.reminderDate);
      return reminderDate.toDateString() === tomorrow.toDateString() && !reminder.isCompleted;
    });

    setNextReminder(nextReminder);
  }, [reminders]);

  const markAsDeposited = useCallback(async (reminderId) => {
    setReminderProcessing(true);
    
    try {
      // Simuler le traitement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour le statut du rappel
      setReminders(prev => prev.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, isMarkedAsDeposited: true, isCompleted: true }
          : reminder
      ));
      
      // Mettre à jour la progression du plan
      const updatedReminders = reminders.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, isMarkedAsDeposited: true, isCompleted: true }
          : reminder
      );
      
      const completedDeposits = updatedReminders.filter(r => r.isCompleted).length;
      const totalDeposits = updatedReminders.length;
      const percentage = Math.round((completedDeposits / totalDeposits) * 100);
      
      setDashboardData(prev => ({
        ...prev,
        planProgress: {
          depositsMade: completedDeposits,
          depositsRemaining: totalDeposits - completedDeposits,
          percentage: percentage
        }
      }));
      
      showSuccess('Dépôt marqué comme effectué avec succès !');
    } catch (error) {
      console.error('[ABEPARGNE] Erreur lors du marquage:', error);
      showError('Erreur lors du marquage du dépôt');
    } finally {
      setReminderProcessing(false);
    }
  }, [reminders, showSuccess, showError]);

  const sendReminderNotification = useCallback((reminder) => {
    const message = `Rappel : votre prochain dépôt de ${formatCurrency(reminder.amount)} FCFA est prévu demain (${reminder.depositDate.toLocaleDateString('fr-FR')})`;
    
    // Utiliser le système de notifications existant
    showSuccess(message, 5000); // Notification plus longue pour les rappels
    
    // Ici on pourrait aussi envoyer une notification push ou SMS
    console.log('[ABEPARGNE] Rappel envoyé:', message);
  }, [showSuccess]);

  // Fonctions pour le calcul automatique des intérêts - ÉTAPE 6
  const calculateMonthlyInterest = useCallback(async () => {
    if (!activePlan || !savingsData.balance || savingsData.balance <= 0) {
      return;
    }

    setInterestCalculationProcessing(true);
    
    try {
      const now = new Date();
      const planStartDate = new Date(activePlan.createdAt);
      const monthsSinceStart = Math.floor((now - planStartDate) / (1000 * 60 * 60 * 24 * 30));
      
      // Calculer les intérêts pour le mois en cours
      const monthlyInterest = savingsData.balance * interestData.monthlyInterestRate;
      const totalInterestEarned = monthlyInterest + interestData.totalInterestEarned;
      
      // Créer l'entrée d'historique des intérêts
      const interestEntry = {
        id: `interest_${Date.now()}`,
        date: now,
        amount: monthlyInterest,
        balance: savingsData.balance,
        month: monthsSinceStart + 1,
        description: `Intérêts mensuels - ${now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
      };
      
      // Mettre à jour les données d'intérêts
      setInterestData(prev => ({
        ...prev,
        lastInterestCalculation: now,
        nextInterestDate: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()),
        totalInterestEarned: totalInterestEarned,
        interestHistory: [...prev.interestHistory, interestEntry]
      }));
      
      // Mettre à jour le solde total (épargne + intérêts)
      const newTotalBalance = savingsData.balance + monthlyInterest;
      
      // Mettre à jour les données d'épargne
      setSavingsData(prev => ({
        ...prev,
        balance: newTotalBalance,
        totalInterest: totalInterestEarned,
        transactions: [{
          id: `transaction_${Date.now()}`,
          type: 'interest',
          amount: monthlyInterest,
          date: now,
          description: `Intérêts mensuels - ${now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
        }, ...prev.transactions]
      }));
      
      // Envoyer la notification de bénéfice
      const notificationMessage = `🎉 Intérêts générés ! Vous avez gagné ${formatCurrency(monthlyInterest)} d'intérêts ce mois-ci. Votre solde total est maintenant de ${formatCurrency(newTotalBalance)}.`;
      showSuccess(notificationMessage, 8000);
      
      // Ici on pourrait aussi sauvegarder en base de données
      console.log('[ABEPARGNE] Intérêts calculés:', {
        monthlyInterest,
        totalInterestEarned,
        newBalance: newTotalBalance
      });
      
    } catch (error) {
      console.error('[ABEPARGNE] Erreur lors du calcul des intérêts:', error);
      showError('Erreur lors du calcul des intérêts');
    } finally {
      setInterestCalculationProcessing(false);
    }
  }, [activePlan, savingsData.balance, interestData.monthlyInterestRate, interestData.totalInterestEarned, showSuccess, showError]);

  const checkInterestCalculation = useCallback(() => {
    if (!activePlan || !interestData.nextInterestDate) return;
    
    const now = new Date();
    const nextInterestDate = new Date(interestData.nextInterestDate);
    
    // Vérifier si c'est le moment de calculer les intérêts (1er du mois)
    if (now.getDate() === 1 && 
        now.getMonth() === nextInterestDate.getMonth() && 
        now.getFullYear() === nextInterestDate.getFullYear()) {
      calculateMonthlyInterest();
    }
  }, [activePlan, interestData.nextInterestDate, calculateMonthlyInterest]);

  const initializeInterestData = useCallback(() => {
    if (!activePlan) return;
    
    const now = new Date();
    const planStartDate = new Date(activePlan.createdAt);
    
    // Calculer la date du prochain calcul d'intérêts (1er du mois prochain)
    const nextInterestDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    setInterestData(prev => ({
      ...prev,
      lastInterestCalculation: null,
      nextInterestDate: nextInterestDate
    }));
  }, [activePlan]);

  // Fonctions pour le système de retraits - ÉTAPE 7
  const validateWithdrawalAmount = useCallback((amount) => {
    const errors = [];
    const numAmount = parseFloat(amount);
    const currentBalance = savingsData.balance;
    
    if (!amount || amount.trim() === '') {
      errors.push('Le montant est requis');
    } else if (isNaN(numAmount) || numAmount <= 0) {
      errors.push('Le montant doit être un nombre positif');
    } else if (numAmount < withdrawData.minimumWithdrawal) {
      errors.push(`Le montant minimum de retrait est de ${formatCurrency(withdrawData.minimumWithdrawal)}`);
    } else if (numAmount > currentBalance) {
      errors.push(`Le montant ne peut pas dépasser votre solde disponible (${formatCurrency(currentBalance)})`);
    }
    
    return errors;
  }, [withdrawData.minimumWithdrawal, savingsData.balance]);

  const handleWithdrawalAmountChange = useCallback((value) => {
    setWithdrawData(prev => ({
      ...prev,
      amount: value,
      validationErrors: validateWithdrawalAmount(value)
    }));
  }, [validateWithdrawalAmount]);

  const handleWithdrawalMethodSelect = useCallback((method) => {
    setWithdrawData(prev => ({
      ...prev,
      withdrawalMethod: method
    }));
    setShowWithdrawalMethods(false);
  }, []);



  // Fonctions pour la gestion de fin de période - ÉTAPE 8
  const checkPlanCompletion = useCallback(() => {
    if (!activePlan) return;
    
    const now = new Date();
    const planStartDate = new Date(activePlan.createdAt);
    const duration = parseInt(activePlan.duration);
    const frequency = parseInt(activePlan.frequency);
    
    // Calculer la date de fin théorique du plan
    const daysInPlan = duration * 30;
    const planEndDate = new Date(planStartDate);
    planEndDate.setDate(planEndDate.getDate() + daysInPlan);
    
    // Vérifier si le plan est terminé
    if (now >= planEndDate && !planEndData.isPlanCompleted) {
      // Calculer les intérêts finaux
      const finalInterest = savingsData.balance * 0.05 * duration; // 5% par mois
      const finalBalance = savingsData.balance + finalInterest;
      const totalEarned = finalBalance - (parseFloat(activePlan.fixedAmount) * (daysInPlan / frequency));
      
      setPlanEndData({
        isPlanCompleted: true,
        completionDate: now,
        finalBalance: finalBalance,
        finalInterest: finalInterest,
        totalEarned: totalEarned
      });
      
      // Mettre à jour le solde avec les intérêts finaux
      setSavingsData(prev => ({
        ...prev,
        balance: finalBalance,
        totalInterest: prev.totalInterest + finalInterest,
        transactions: [{
          id: `transaction_${Date.now()}`,
          type: 'interest',
          amount: finalInterest,
          date: now,
          description: `Intérêts finaux - Fin du plan d'épargne`
        }, ...prev.transactions]
      }));
      
      // Afficher le modal de fin de plan
      setShowPlanCompletionModal(true);
      
      // Notification de fin de plan
      const notificationMessage = `🎉 Félicitations ! Votre plan d'épargne est terminé. Vous avez gagné ${formatCurrency(finalInterest)} d'intérêts finaux. Votre solde total est maintenant de ${formatCurrency(finalBalance)}.`;
      showSuccess(notificationMessage, 10000);
    }
  }, [activePlan, planEndData.isPlanCompleted, savingsData.balance, showSuccess]);

  const handlePlanOption = useCallback((option) => {
    setShowPlanOptionsModal(false);
    
    switch (option) {
      case 'restart':
        // Réinitialiser pour un nouveau plan
        setActivePlan(null);
        setPlanEndData({
          isPlanCompleted: false,
          completionDate: null,
          finalBalance: 0,
          finalInterest: 0,
          totalEarned: 0
        });
        setShowPlanConfigModal(true);
        showSuccess('Configuration d\'un nouveau plan d\'épargne');
        break;
        
      case 'withdraw':
        // Ouvrir le modal de retrait avec le montant total
        setWithdrawData(prev => ({
          ...prev,
          amount: planEndData.finalBalance.toString(),
          maximumWithdrawal: planEndData.finalBalance
        }));
        setShowWithdrawModal(true);
        break;
        
      case 'keep':
        // Garder l'argent sur le compte
        showSuccess('Votre argent reste disponible sur votre compte AB Épargne');
        break;
        
      default:
        break;
    }
  }, [planEndData.finalBalance, showSuccess]);

  // Fonctions pour les règles de sécurité et restrictions - ÉTAPE 9
  const checkWithdrawalEligibility = useCallback((withdrawalAmount) => {
    if (!activePlan) return { eligible: true, penalty: 0, netAmount: withdrawalAmount };
    
    const now = new Date();
    const planStartDate = new Date(activePlan.createdAt);
    const duration = parseInt(activePlan.duration);
    const minimumDays = duration * 30; // Période minimale = durée du plan
    
    const daysSinceStart = Math.floor((now - planStartDate) / (1000 * 60 * 60 * 24));
    const isEarlyWithdrawal = daysSinceStart < minimumDays;
    
    // Si le plan est terminé, pas de pénalité
    if (planEndData.isPlanCompleted) {
      return { eligible: true, penalty: 0, netAmount: withdrawalAmount };
    }
    
    // Si c'est un retrait anticipé, appliquer la pénalité
    if (isEarlyWithdrawal) {
      const penaltyAmount = withdrawalAmount * securityRules.earlyWithdrawalPenalty;
      const netAmount = withdrawalAmount - penaltyAmount;
      
      return {
        eligible: false,
        penalty: penaltyAmount,
        netAmount: netAmount,
        remainingDays: minimumDays - daysSinceStart,
        reason: 'Retrait anticipé'
      };
    }
    
    return { eligible: true, penalty: 0, netAmount: withdrawalAmount };
  }, [activePlan, securityRules.earlyWithdrawalPenalty, planEndData.isPlanCompleted]);

  const handleEarlyWithdrawalWarning = useCallback((withdrawalAmount) => {
    const eligibility = checkWithdrawalEligibility(withdrawalAmount);
    
    if (!eligibility.eligible) {
      setSecurityRules(prev => ({
        ...prev,
        penaltyAmount: eligibility.penalty,
        netWithdrawalAmount: eligibility.netAmount
      }));
      setShowPenaltyModal(true);
      return false; // Empêcher le retrait immédiat
    }
    
    return true; // Autoriser le retrait
  }, [checkWithdrawalEligibility]);

  const confirmEarlyWithdrawal = useCallback(() => {
    setShowPenaltyModal(false);
    // Continuer avec le retrait avec pénalité
    const netAmount = securityRules.netWithdrawalAmount;
    setWithdrawData(prev => ({
      ...prev,
      amount: netAmount.toString()
    }));
    // Le retrait se poursuit normalement avec le montant net
  }, [securityRules.netWithdrawalAmount]);

  const handleForceMajeureRequest = useCallback(() => {
    setShowForceMajeureModal(true);
  }, []);

  // Fonction de traitement des retraits (déplacée après handleEarlyWithdrawalWarning)
  const processWithdrawal = useCallback(async () => {
    const errors = validateWithdrawalAmount(withdrawData.amount);
    if (errors.length > 0) {
      setWithdrawData(prev => ({ ...prev, validationErrors: errors }));
      return;
    }

    if (!withdrawData.withdrawalMethod) {
      showError('Veuillez sélectionner un moyen de retrait');
      return;
    }

    const withdrawalAmount = parseFloat(withdrawData.amount);
    
    // Vérifier les règles de sécurité avant le retrait
    const canProceed = handleEarlyWithdrawalWarning(withdrawalAmount);
    if (!canProceed) {
      return; // Le modal de pénalité s'affiche automatiquement
    }

    setWithdrawalProcessing(true);
    
    try {
      // Simulation du processus de retrait
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Créer la transaction
      const transactionData = {
        user_id: user.id,
        type: 'withdrawal',
        amount: withdrawalAmount,
        description: `Retrait via ${withdrawData.withdrawalMethod}`,
        withdrawal_method: withdrawData.withdrawalMethod
      };

      const result = await createSavingsTransaction(transactionData);
      
      if (result.success) {
        // Mettre à jour le solde
        const newBalance = savingsData.balance - withdrawalAmount;
        await updateSavingsAccount(user.id, { balance: newBalance });
        
        // Mettre à jour les données locales
        setSavingsData(prev => ({
          ...prev,
          balance: newBalance,
          transactions: [result.data, ...prev.transactions]
        }));
        
        // Réinitialiser le formulaire
        setWithdrawData({
          amount: '',
          withdrawalMethod: '',
          minimumWithdrawal: 1000,
          maximumWithdrawal: 0,
          validationErrors: []
        });
        setShowWithdrawModal(false);
        setShowWithdrawalMethods(false);
        
        showSuccess(`Retrait de ${formatCurrency(withdrawalAmount)} effectué avec succès !`);
      } else {
        showError('Erreur lors du traitement du retrait');
      }
    } catch (error) {
      console.error('[ABEPARGNE] Erreur lors du retrait:', error);
      showError('Erreur lors du traitement du retrait');
    } finally {
      setWithdrawalProcessing(false);
    }
  }, [withdrawData, validateWithdrawalAmount, handleEarlyWithdrawalWarning, user?.id, savingsData.balance, showSuccess, showError]);

  // Fonctions pour la section informative - ÉTAPE 10
  const toggleFAQItem = useCallback((itemId) => {
    setExpandedFAQItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const handleInfoCategoryChange = useCallback((category) => {
    setActiveFAQCategory(category);
  }, []);

  useEffect(() => {
    calculatePlanDetails();
  }, [planConfig.fixedAmount, planConfig.frequency, planConfig.duration]);

  // Calculer les données du tableau de bord quand les données changent
  useEffect(() => {
    calculateDashboardData();
  }, [calculateDashboardData]);

  // Gérer les rappels automatiques - ÉTAPE 5
  useEffect(() => {
    if (activePlan) {
      const newReminders = generateReminders();
      setReminders(newReminders);
    }
  }, [activePlan, generateReminders]);

  useEffect(() => {
    checkNextReminder();
  }, [checkNextReminder]);

  // Vérifier les rappels toutes les heures
  useEffect(() => {
    const interval = setInterval(() => {
      if (nextReminder) {
        const now = new Date();
        const reminderDate = new Date(nextReminder.reminderDate);
        
        // Si c'est le moment d'envoyer le rappel (entre 9h et 18h)
        if (now.getHours() >= 9 && now.getHours() < 18 && 
            reminderDate.toDateString() === now.toDateString()) {
          sendReminderNotification(nextReminder);
        }
      }
    }, 1000 * 60 * 60); // Vérifier toutes les heures

    return () => clearInterval(interval);
  }, [nextReminder, sendReminderNotification]);

  // Gérer les intérêts automatiques - ÉTAPE 6
  useEffect(() => {
    if (activePlan) {
      initializeInterestData();
    }
  }, [activePlan, initializeInterestData]);

  useEffect(() => {
    checkInterestCalculation();
  }, [checkInterestCalculation]);

  // Vérifier les intérêts quotidiennement
  useEffect(() => {
    const interval = setInterval(() => {
      checkInterestCalculation();
    }, 1000 * 60 * 60 * 24); // Vérifier quotidiennement

    return () => clearInterval(interval);
  }, [checkInterestCalculation]);

  // Vérifier la fin de plan quotidiennement - ÉTAPE 8
  useEffect(() => {
    checkPlanCompletion();
  }, [checkPlanCompletion]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkPlanCompletion();
    }, 1000 * 60 * 60 * 24); // Vérifier quotidiennement

    return () => clearInterval(interval);
  }, [checkPlanCompletion]);

  // Fonctions de calcul du plan d'épargne - ÉTAPE 1

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <motion.div 
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-0">
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
                {accountStatus.isFirstVisit ? (
                  <>
                    Bienvenue sur{' '}
                    <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      AB Épargne
                    </span>
                  </>
                ) : (
                  <>
                Mon{' '}
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Compte Épargne
                </span>
                  </>
                )}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-gray-600 font-montserrat"
              >
                {accountStatus.isFirstVisit 
                  ? 'Commencez votre voyage vers l\'indépendance financière'
                  : 'Gérez vos économies et suivez vos objectifs financiers'
                }
              </motion.p>

              {/* Message spécial pour les nouveaux utilisateurs */}
              {accountStatus.isFirstVisit && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 max-w-2xl mx-auto"
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Trophy size={24} className="text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    🎉 Prêt à commencer votre épargne ?
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Configurez votre premier plan d'épargne personnalisé et commencez à construire votre avenir financier dès aujourd'hui !
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">5%</div>
                      <div className="text-gray-600">Intérêts mensuels</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">300 FCFA</div>
                      <div className="text-gray-600">Montant minimum</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">24/7</div>
                      <div className="text-gray-600">Suivi en temps réel</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Actions principales - ÉTAPE 7 (Boutons pleine largeur) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="grid grid-cols-3 gap-3 mb-6"
            >
              {/* Dépôt */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => setShowDepositModal(true)}
                  className="w-full h-20 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg rounded-xl flex flex-col items-center justify-center space-y-1"
                >
                  <Plus size={24} />
                  <span className="text-sm font-medium">Déposer</span>
                </Button>
              </motion.div>

              {/* Retrait */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => setShowWithdrawModal(true)}
                  className="w-full h-20 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg rounded-xl flex flex-col items-center justify-center space-y-1"
                >
                  <Minus size={24} />
                  <span className="text-sm font-medium">Retirer</span>
                </Button>
              </motion.div>

              {/* Configuration du plan */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => setShowPlanConfigModal(true)}
                  className="w-full h-20 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-md hover:shadow-lg rounded-xl flex flex-col items-center justify-center space-y-1"
                >
                  {accountStatus.isFirstVisit ? (
                    <>
                      <Trophy size={24} />
                      <span className="text-sm font-medium">Commencer</span>
                    </>
                  ) : (
                    <>
                  <Calculator size={24} />
                  <span className="text-sm font-medium">Plan</span>
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>

            {/* Calcul des intérêts (ligne séparée si nécessaire) */}
            {activePlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center mb-6"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={calculateMonthlyInterest}
                    disabled={interestCalculationProcessing || !savingsData.balance || savingsData.balance <= 0}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg rounded-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {interestCalculationProcessing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <TrendingUp size={20} />
                    )}
                    <span className="font-medium">{interestCalculationProcessing ? 'Calcul en cours...' : 'Calculer les intérêts'}</span>
                  </Button>
                </motion.div>
              </motion.div>
            )}


            {/* Tableau de bord principal - ÉTAPE 3 */}
            {!accountStatus.isFirstVisit && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8 space-y-6"
            >
              {/* Solde principal */}
              <div className="grid grid-cols-1 gap-6">
                {/* Solde actuel */}
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                  <div className="p-6 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <PiggyBank size={28} className="mr-3" />
                      <h2 className="text-xl font-bold">Solde actuel</h2>
                    </div>
                    
                    <div className="text-4xl lg:text-5xl font-bold mb-3">
                      {showBalance ? formatCurrency(dashboardData.currentBalance) : '••••••'}
                    </div>
                    
                    <div className="text-green-100 text-sm">
                      Capital disponible pour retrait
                    </div>
                  </div>
                </Card>
              </div>

              {/* Détails du plan d'épargne */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-blue-800 flex items-center">
                      <Target className="mr-2" size={24} />
                      Détails de votre plan d'épargne
                    </h3>
                    {/* Bouton pour mobile */}
                    <Button
                      onClick={() => setShowPlanDetailsModal(true)}
                      className="md:hidden bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Voir détails
                    </Button>
                  </div>
                  
                  {/* Détails visibles sur desktop et tablette */}
                  <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <p className="text-sm text-gray-600 mb-1">Nom du plan</p>
                      <p className="font-semibold text-blue-800">{savingsData.planName}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <p className="text-sm text-gray-600 mb-1">Montant fixe</p>
                      <p className="font-semibold text-blue-800">{formatCurrency(savingsData.fixedAmount)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <p className="text-sm text-gray-600 mb-1">Fréquence</p>
                      <p className="font-semibold text-blue-800">Tous les {savingsData.frequencyDays} jours</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <p className="text-sm text-gray-600 mb-1">Durée</p>
                      <p className="font-semibold text-blue-800">{savingsData.durationMonths} mois</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <p className="text-sm text-gray-600 mb-1">Dépôts effectués</p>
                      <p className="font-semibold text-green-600">{savingsData.completedDeposits} / {savingsData.totalDepositsRequired}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <p className="text-sm text-gray-600 mb-1">Progression</p>
                      <p className="font-semibold text-purple-600">{savingsData.completionPercentage}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <p className="text-sm text-gray-600 mb-1">Taux d'intérêt</p>
                      <p className="font-semibold text-teal-600">{savingsData.interestRate}% par mois</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <p className="text-sm text-gray-600 mb-1">Objectif total</p>
                      <p className="font-semibold text-green-600">{formatCurrency(savingsData.monthlyGoal)}</p>
                    </div>
                  </div>
                  
                  {/* Résumé pour mobile */}
                  <div className="md:hidden space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Progression</span>
                        <span className="font-semibold text-purple-600">{savingsData.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${savingsData.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Dépôts effectués</span>
                        <span className="font-semibold text-green-600">{savingsData.completedDeposits} / {savingsData.totalDepositsRequired}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>




            </motion.div>
            )}



            {/* Section des rappels automatiques - ÉTAPE 5 */}
            {activePlan && reminders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mb-8"
              >
                <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Bell size={28} />
                        <div>
                          <h2 className="text-xl font-bold">Rappels automatiques</h2>
                          <p className="text-yellow-100 text-sm">Suivez vos dépôts prévus</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowRemindersModal(true)}
                        variant="outline"
                        className="text-yellow-600 bg-white hover:bg-yellow-50"
                      >
                        Voir tous les rappels
                      </Button>
                    </div>

                    {/* Prochain rappel */}
                    {nextReminder && (
                      <div className="bg-white/20 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">Prochain rappel</h3>
                            <p className="text-yellow-100">
                              Dépôt #{nextReminder.depositNumber} - {formatCurrency(nextReminder.amount)}
                            </p>
                            <p className="text-yellow-100 text-sm">
                              Prévu le {nextReminder.depositDate.toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold mb-1">
                              {Math.ceil((nextReminder.reminderDate - new Date()) / (1000 * 60 * 60 * 24))}j
                            </div>
                            <p className="text-yellow-100 text-sm">avant le rappel</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dépôts récents */}
                    <div className="space-y-2">
                      {reminders.slice(0, 3).map((reminder) => (
                        <div
                          key={reminder.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            reminder.isCompleted 
                              ? 'bg-green-500/20 border border-green-300/30' 
                              : 'bg-white/10'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${
                              reminder.isCompleted 
                                ? 'bg-green-500 text-white' 
                                : 'bg-white/20'
                            }`}>
                              {reminder.isCompleted ? (
                                <CheckCircle size={16} />
                              ) : (
                                <Clock size={16} />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                Dépôt #{reminder.depositNumber} - {formatCurrency(reminder.amount)}
                              </p>
                              <p className="text-yellow-100 text-sm">
                                {reminder.depositDate.toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          {!reminder.isCompleted && (
                            <Button
                              onClick={() => markAsDeposited(reminder.id)}
                              size="sm"
                              className="bg-white text-yellow-600 hover:bg-yellow-50"
                              disabled={reminderProcessing}
                            >
                              {reminderProcessing ? '...' : 'Marquer comme déposé'}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Statistiques */}
            {!accountStatus.isFirstVisit && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
            >


            </motion.div>
            )}

            {/* Historique des transactions - ÉTAPE 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-white">
                <div className="p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-3 lg:space-y-0">
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Historique des transactions</h3>
                    <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-xs lg:text-sm text-gray-600">
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full"></div>
                        <span>Dépôts</span>
                      </div>
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <div className="w-2 h-2 lg:w-3 lg:h-3 bg-red-500 rounded-full"></div>
                        <span>Retraits</span>
                      </div>
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <div className="w-2 h-2 lg:w-3 lg:h-3 bg-blue-500 rounded-full"></div>
                        <span>Intérêts</span>
                      </div>
                    </div>
                  </div>
                  
                  {savingsData.transactions.length > 0 ? (
                    <div className="space-y-3 lg:space-y-4">
                      {savingsData.transactions.slice(0, 10).map((transaction) => (
                        <motion.div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex items-center space-x-2 lg:space-x-4 min-w-0 flex-1">
                            <div className={`p-2 lg:p-3 rounded-full flex-shrink-0 ${
                              transaction.type === 'deposit' 
                                ? 'bg-green-100 text-green-600' 
                                : transaction.type === 'withdrawal'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {transaction.type === 'deposit' ? (
                                <ArrowUpRight size={16} className="lg:w-5 lg:h-5" />
                              ) : transaction.type === 'withdrawal' ? (
                                <ArrowDownRight size={16} className="lg:w-5 lg:h-5" />
                              ) : (
                                <TrendingUp size={16} className="lg:w-5 lg:h-5" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 text-sm lg:text-base truncate">
                                {transaction.type === 'deposit' ? 'Dépôt' : 
                                 transaction.type === 'withdrawal' ? 'Retrait' : 
                                 'Intérêts mensuels'}
                              </p>
                              <p className="text-xs lg:text-sm text-gray-500">{formatDate(transaction.date)}</p>
                              {transaction.description && transaction.description !== 'Transaction' && (
                                <p className="text-xs text-gray-400 truncate">{transaction.description}</p>
                              )}
                            </div>
                          </div>
                          <div className={`font-bold text-sm lg:text-base flex-shrink-0 ml-2 ${
                            transaction.type === 'deposit' ? 'text-green-600' : 
                            transaction.type === 'withdrawal' ? 'text-red-600' : 
                            'text-blue-600'
                          }`}>
                            {transaction.type === 'deposit' ? '+' : 
                             transaction.type === 'withdrawal' ? '-' : 
                             '+'}{formatCurrency(transaction.amount)}
                          </div>
                        </motion.div>
                      ))}
                      
                      {savingsData.transactions.length > 10 && (
                        <div className="text-center pt-4">
                          <Button
                            variant="outline"
                            className="text-gray-600 hover:text-gray-800"
                          >
                            Voir toutes les transactions ({savingsData.transactions.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                        <FileText size={32} className="text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {accountStatus.isFirstVisit ? 'Bienvenue sur AB Épargne !' : 'Aucune transaction'}
                      </h4>
                      <p className="text-gray-600">
                        {accountStatus.isFirstVisit 
                          ? 'Configurez votre premier plan d\'épargne pour commencer votre voyage financier'
                          : 'Commencez par faire votre premier dépôt pour voir l\'historique ici'
                        }
                      </p>
                      {accountStatus.isFirstVisit && (
                        <div className="mt-4">
                          <Button
                            onClick={() => setShowPlanConfigModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Trophy size={20} className="mr-2" />
                            Commencer mon épargne
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de dépôt - ÉTAPE 4 */}
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
            className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center mb-6">
              <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                <Plus size={24} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Faire un dépôt</h3>
              <p className="text-gray-600 mt-2">
                {activePlan 
                  ? `Montant fixe selon votre plan : ${formatCurrency(parseFloat(activePlan.fixedAmount))}`
                  : 'Entrez le montant à déposer (minimum 300 FCFA)'
                }
              </p>
            </div>

            <div className="space-y-6">
              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (FCFA)
                </label>
                <input
                  type="number"
                  value={depositData.amount}
                  onChange={(e) => handleDepositAmountChange(e.target.value)}
                  placeholder={activePlan ? activePlan.fixedAmount : "300"}
                  className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    depositData.validationErrors.length > 0 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={paymentProcessing || (activePlan !== null)}
                />
                
                {/* Messages d'erreur */}
                {depositData.validationErrors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {depositData.validationErrors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {error}
                      </p>
                    ))}
                  </div>
                )}
                
                {/* Informations sur le plan */}
                {activePlan && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <Info size={14} className="inline mr-1" />
                      Montant fixe selon votre plan d'épargne : {formatCurrency(parseFloat(activePlan.fixedAmount))}
                    </p>
                  </div>
                )}
              </div>

              {/* Moyen de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moyen de paiement
                </label>
                
                {!depositData.paymentMethod ? (
                  <Button
                    onClick={() => setShowPaymentMethods(true)}
                    variant="outline"
                    className="w-full p-4 border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <CreditCard size={20} className="text-gray-400" />
                      <span className="text-gray-600">Sélectionner un moyen de paiement</span>
                    </div>
                  </Button>
                ) : (
                  <div className="p-4 border border-green-200 bg-green-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          {depositData.paymentMethod === 'MoMo' && <Smartphone size={20} className="text-green-600" />}
                          {depositData.paymentMethod === 'Carte bancaire' && <CreditCard size={20} className="text-green-600" />}
                          {depositData.paymentMethod === 'Virement bancaire' && <Banknote size={20} className="text-green-600" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{depositData.paymentMethod}</p>
                          <p className="text-sm text-gray-600">Moyen de paiement sélectionné</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowPaymentMethods(true)}
                        variant="outline"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Changer
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Récapitulatif */}
              {depositData.amount && !depositData.validationErrors.length && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3">Récapitulatif du dépôt</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant à déposer :</span>
                      <span className="font-semibold">{formatCurrency(parseFloat(depositData.amount))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Moyen de paiement :</span>
                      <span className="font-semibold">{depositData.paymentMethod || 'Non sélectionné'}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-900 font-semibold">Total :</span>
                        <span className="text-green-600 font-bold text-lg">{formatCurrency(parseFloat(depositData.amount))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositData({
                      amount: '',
                      paymentMethod: '',
                      minimumAmount: 300,
                      validationErrors: []
                    });
                    setShowPaymentMethods(false);
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={paymentProcessing}
                >
                  Annuler
                </Button>
                <Button
                  onClick={processDepositPayment}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={
                    !depositData.amount || 
                    depositData.validationErrors.length > 0 || 
                    !depositData.paymentMethod || 
                    paymentProcessing
                  }
                >
                  {paymentProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Traitement...</span>
                    </div>
                  ) : (
                    `Payer ${depositData.amount ? formatCurrency(parseFloat(depositData.amount)) : '0 FCFA'}`
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal de sélection des moyens de paiement */}
      {showPaymentMethods && (
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
            className="bg-white rounded-3xl p-6 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Choisir un moyen de paiement</h3>
              <p className="text-gray-600 mt-2">Sélectionnez votre méthode de paiement préférée</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => handlePaymentMethodSelect('MoMo')}
                className="w-full p-4 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone size={24} />
                    <div className="text-left">
                      <p className="font-semibold">Mobile Money (MoMo)</p>
                      <p className="text-sm opacity-90">Paiement via téléphone mobile</p>
                    </div>
                  </div>
                  <ArrowRight size={20} />
                </div>
              </Button>
            </div>

            <div className="mt-6">
              <Button
                onClick={() => setShowPaymentMethods(false)}
                variant="outline"
                className="w-full"
              >
                Annuler
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal de retrait - ÉTAPE 7 */}
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
            className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center mb-6">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <Minus size={24} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Faire un retrait</h3>
              <p className="text-gray-600 mt-2">
                Retirez de l'argent de votre épargne (minimum {formatCurrency(withdrawData.minimumWithdrawal)})
              </p>
            </div>

            <div className="space-y-6">
              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant à retirer (FCFA)
                </label>
                <input
                  type="number"
                  value={withdrawData.amount}
                  onChange={(e) => handleWithdrawalAmountChange(e.target.value)}
                  placeholder="1000"
                  className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    withdrawData.validationErrors.length > 0 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={withdrawalProcessing}
                />
                
                {/* Messages d'erreur */}
                {withdrawData.validationErrors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {withdrawData.validationErrors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {error}
                      </p>
                    ))}
                  </div>
                )}
                
                {/* Informations sur le solde */}
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <Info size={14} className="inline mr-1" />
                    Solde disponible : {formatCurrency(savingsData.balance)}
                  </p>
                </div>
              </div>

              {/* Moyen de retrait */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moyen de retrait
                </label>
                
                {!withdrawData.withdrawalMethod ? (
                  <Button
                    onClick={() => setShowWithdrawalMethods(true)}
                    variant="outline"
                    className="w-full p-4 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Smartphone size={20} className="text-gray-400" />
                      <span className="text-gray-600">Sélectionner un moyen de retrait</span>
                    </div>
                  </Button>
                ) : (
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {withdrawData.withdrawalMethod === 'MoMo' && <Smartphone size={20} className="text-blue-600" />}
                          {withdrawData.withdrawalMethod === 'Retrait physique' && <Banknote size={20} className="text-blue-600" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{withdrawData.withdrawalMethod}</p>
                          <p className="text-sm text-gray-600">Moyen de retrait sélectionné</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowWithdrawalMethods(true)}
                        variant="outline"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Changer
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Récapitulatif */}
              {withdrawData.amount && !withdrawData.validationErrors.length && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3">Récapitulatif du retrait</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant à retirer :</span>
                      <span className="font-semibold">{formatCurrency(parseFloat(withdrawData.amount))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Moyen de retrait :</span>
                      <span className="font-semibold">{withdrawData.withdrawalMethod || 'Non sélectionné'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Solde après retrait :</span>
                      <span className="font-semibold">{formatCurrency(savingsData.balance - parseFloat(withdrawData.amount))}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-900 font-semibold">Total :</span>
                        <span className="text-blue-600 font-bold text-lg">{formatCurrency(parseFloat(withdrawData.amount))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawData({
                      amount: '',
                      withdrawalMethod: '',
                      minimumWithdrawal: 1000,
                      maximumWithdrawal: 0,
                      validationErrors: []
                    });
                    setShowWithdrawalMethods(false);
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={withdrawalProcessing}
                >
                  Annuler
                </Button>
                <Button
                  onClick={processWithdrawal}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={
                    !withdrawData.amount || 
                    withdrawData.validationErrors.length > 0 || 
                    !withdrawData.withdrawalMethod || 
                    withdrawalProcessing
                  }
                >
                  {withdrawalProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Traitement...</span>
                    </div>
                  ) : (
                    `Retirer ${withdrawData.amount ? formatCurrency(parseFloat(withdrawData.amount)) : '0 FCFA'}`
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal de sélection des moyens de retrait */}
      {showWithdrawalMethods && (
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
            className="bg-white rounded-3xl p-6 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Choisir un moyen de retrait</h3>
              <p className="text-gray-600 mt-2">Sélectionnez votre méthode de retrait préférée</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => handleWithdrawalMethodSelect('MoMo')}
                className="w-full p-4 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone size={24} />
                    <div className="text-left">
                      <p className="font-semibold">Mobile Money (MoMo)</p>
                      <p className="text-sm opacity-90">Retrait vers votre téléphone mobile</p>
                    </div>
                  </div>
                  <ArrowRight size={20} />
                </div>
              </Button>
            </div>

            <div className="mt-6">
              <Button
                onClick={() => setShowWithdrawalMethods(false)}
                variant="outline"
                className="w-full"
              >
                Annuler
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal de configuration du plan d'épargne - ÉTAPE 1 */}
      {showPlanConfigModal && (
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
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center mb-6">
              <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                <Calculator size={24} className="text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {accountStatus.isFirstVisit ? 'Bienvenue sur AB Épargne !' : 'Configuration du plan d\'épargne'}
              </h3>
              <p className="text-gray-600 mt-2">
                {accountStatus.isFirstVisit 
                  ? 'Configurez votre premier plan d\'épargne pour commencer à économiser'
                  : 'Personnalisez votre plan d\'épargne'
                }
              </p>
              {accountStatus.isFirstVisit && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-sm text-green-700">
                    🎉 Félicitations ! Vous êtes sur le point de créer votre premier plan d'épargne. 
                    Choisissez vos paramètres et commencez votre voyage vers l'indépendance financière.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Montant fixe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant fixe à déposer (FCFA)
                </label>
                <input
                  type="number"
                  value={planConfig.fixedAmount}
                  onChange={(e) => handlePlanConfigChange('fixedAmount', e.target.value)}
                  placeholder="300"
                  min="300"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">Minimum : 300 FCFA</p>
              </div>

              {/* Fréquence de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence de paiement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handlePlanConfigChange('frequency', '5')}
                    className={`p-4 border rounded-xl transition-all ${
                      planConfig.frequency === '5'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold">Tous les 5 jours</div>
                      <div className="text-sm text-gray-600">6 dépôts par mois</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handlePlanConfigChange('frequency', '10')}
                    className={`p-4 border rounded-xl transition-all ${
                      planConfig.frequency === '10'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold">Tous les 10 jours</div>
                      <div className="text-sm text-gray-600">3 dépôts par mois</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Durée du plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée du plan
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {['1', '2', '3', '6'].map((months) => (
                    <button
                      key={months}
                      onClick={() => handlePlanConfigChange('duration', months)}
                      className={`p-3 border rounded-xl transition-all ${
                        planConfig.duration === months
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold">{months}</div>
                        <div className="text-sm text-gray-600">mois{months !== '1' ? 's' : ''}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Récapitulatif du plan */}
              {planConfig.fixedAmount >= 300 && (
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 text-center">Récapitulatif de votre plan</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{planConfig.totalDeposits}</div>
                      <div className="text-sm text-gray-600">Dépôts au total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(planConfig.totalAmount)}</div>
                      <div className="text-sm text-gray-600">Montant total</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{formatCurrency(planConfig.estimatedBenefits)}</div>
                    <div className="text-sm text-gray-600">Bénéfices estimés (5% par mois)</div>
                  </div>

                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() => {
                    setShowPlanConfigModal(false);
                    setShowFeesPaymentModal(true);
                  }}
                  className="w-full p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200"
                >
                  💳 Payer 1000 FCFA - Frais de création
                </Button>
                <Button
                  onClick={() => setShowPlanConfigModal(false)}
                  variant="outline"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal de paiement des frais de création - ÉTAPE 2 */}
      {showFeesPaymentModal && (
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
            className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center mb-8">
              <div className="p-4 bg-orange-100 rounded-full w-fit mx-auto mb-6">
                <PiggyBank size={32} className="text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Confirmation de votre plan d'épargne</h3>
              <p className="text-lg text-gray-600">
                Vérifiez les détails de votre plan et procédez à la création
              </p>
            </div>

            <div className="space-y-8">
              {/* Récapitulatif complet du plan */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
                <h4 className="text-xl font-semibold text-purple-800 mb-4 text-center">📋 Récapitulatif de votre plan d'épargne</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{planConfig.fixedAmount} FCFA</div>
                    <div className="text-purple-700 font-medium">Montant par dépôt</div>
                    <div className="text-sm text-purple-600">Déposé tous les {planConfig.frequency} jours</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{planConfig.duration} mois</div>
                    <div className="text-green-700 font-medium">Durée du plan</div>
                    <div className="text-sm text-green-600">{planConfig.totalDeposits} dépôts au total</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">{formatCurrency(planConfig.totalAmount)}</div>
                    <div className="text-emerald-700 font-medium">Montant total épargné</div>
                    <div className="text-sm text-emerald-600">+ {formatCurrency(planConfig.estimatedBenefits)} de bénéfices</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-purple-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Capital épargné :</span>
                      <span className="text-lg font-semibold text-purple-800">{formatCurrency(planConfig.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Bénéfices estimés (5% par mois) :</span>
                      <span className="text-lg font-semibold text-emerald-800">{formatCurrency(planConfig.estimatedBenefits)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total final estimé :</span>
                        <span className="text-2xl text-orange-600">{formatCurrency(planConfig.totalAmount + planConfig.estimatedBenefits)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* Actions */}
              <div className="flex space-x-4">
                <Button
                  onClick={() => {
                    setShowFeesPaymentModal(false);
                    setShowPlanConfigModal(true);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  ← Retour à la configuration
                </Button>
                <FedaPayButton
                  amount={1000}
                  email={user?.email || 'client@campusfinance.com'}
                  firstname={user?.first_name || user?.fullName?.split(' ')[0] || 'Client'}
                  lastname={user?.last_name || user?.fullName?.split(' ').slice(1).join(' ') || 'Campus'}
                  phone={user?.phone_number || user?.phone || '97000000'}
                  onSuccess={(response) => {
                    console.log('[ABEPARGNE] ===== CALLBACK SUCCESS REÇU =====');
                    console.log('[ABEPARGNE] Paiement FedaPay réussi:', response);
                    
                    // Fermer le modal de paiement
                    setShowFeesPaymentModal(false);
                    
                    // Afficher un message de succès
                    showSuccess('Paiement effectué ! Votre plan d\'épargne est en cours de création...');
                    
                    // Recharger les données après un délai pour laisser le webhook traiter
                    setTimeout(() => {
                      console.log('[ABEPARGNE] Rechargement des données après paiement...');
                      loadSavingsData();
                    }, 3000);
                  }}
                  onError={(error) => {
                    console.error('[ABEPARGNE] Erreur paiement FedaPay:', error);
                    showError('Erreur lors du paiement. Veuillez réessayer.');
                  }}
                />
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
          <div className="flex items-center space-x-2">
            <CheckCircle size={20} />
            <span>Transaction effectuée avec succès !</span>
          </div>
        </motion.div>
      )}

      {/* Modal des rappels automatiques - ÉTAPE 5 */}
      {showRemindersModal && (
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
            className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center mb-6">
              <div className="p-3 bg-yellow-100 rounded-full w-fit mx-auto mb-4">
                <Bell size={24} className="text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Rappels automatiques</h3>
              <p className="text-gray-600 mt-2">
                Suivez tous vos dépôts prévus et marquez-les comme effectués
              </p>
            </div>

            <div className="space-y-4">
              {reminders.map((reminder) => (
                <motion.div
                  key={reminder.id}
                  className={`p-6 rounded-xl border-2 ${
                    reminder.isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${
                        reminder.isCompleted 
                          ? 'bg-green-500 text-white' 
                          : 'bg-yellow-500 text-white'
                      }`}>
                        {reminder.isCompleted ? (
                          <CheckCircle size={24} />
                        ) : (
                          <Clock size={24} />
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Dépôt #{reminder.depositNumber} - {formatCurrency(reminder.amount)}
                        </h4>
                        <p className="text-gray-600">
                          Prévu le {reminder.depositDate.toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        {!reminder.isCompleted && (
                          <p className="text-yellow-600 text-sm font-medium">
                            Rappel envoyé le {reminder.reminderDate.toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {reminder.isCompleted ? (
                        <div className="text-green-600 font-semibold">
                          ✅ Effectué
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-500">
                            {Math.ceil((reminder.depositDate - new Date()) / (1000 * 60 * 60 * 24))} jours restants
                          </div>
                          <Button
                            onClick={() => markAsDeposited(reminder.id)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white"
                            disabled={reminderProcessing}
                          >
                            {reminderProcessing ? 'Traitement...' : 'Marquer comme déposé'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {reminders.filter(r => r.isCompleted).length} / {reminders.length} dépôts effectués
                </div>
                <Button
                  onClick={() => setShowRemindersModal(false)}
                  variant="outline"
                  className="px-6"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal de fin de plan d'épargne - ÉTAPE 8 */}
      {showPlanCompletionModal && (
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
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center mb-8">
              <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-6">
                <Trophy size={32} className="text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">🎉 Félicitations !</h3>
              <p className="text-xl text-gray-600">
                Votre plan d'épargne est terminé avec succès !
              </p>
            </div>

            <div className="space-y-6">
              {/* Récapitulatif final */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                <h4 className="text-xl font-semibold text-green-800 mb-4 text-center">📊 Récapitulatif de votre épargne</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {formatCurrency(planEndData.finalBalance)}
                    </div>
                    <div className="text-green-700 font-medium">Solde final total</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">
                      {formatCurrency(planEndData.finalInterest)}
                    </div>
                    <div className="text-emerald-700 font-medium">Intérêts finaux gagnés</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-xl border border-green-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Capital épargné :</span>
                      <span className="text-lg font-semibold text-green-800">
                        {formatCurrency(planEndData.finalBalance - planEndData.finalInterest)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Intérêts totaux gagnés :</span>
                      <span className="text-lg font-semibold text-emerald-800">
                        {formatCurrency(planEndData.finalInterest)}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Solde final :</span>
                        <span className="text-2xl text-green-600">
                          {formatCurrency(planEndData.finalBalance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message de félicitations */}
              <div className="text-center p-6 bg-yellow-50 rounded-2xl border border-yellow-200">
                <div className="text-4xl mb-4">🏆</div>
                <h4 className="text-lg font-semibold text-yellow-800 mb-2">
                  Objectif atteint !
                </h4>
                <p className="text-yellow-700">
                  Vous avez réussi à épargner pendant {activePlan?.duration} mois et gagné {formatCurrency(planEndData.finalInterest)} d'intérêts !
                </p>
              </div>

              {/* Bouton pour continuer */}
              <div className="text-center">
                <Button
                  onClick={() => {
                    setShowPlanCompletionModal(false);
                    setShowPlanOptionsModal(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white text-lg py-4 px-8"
                >
                  Continuer →
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal des options après fin de plan - ÉTAPE 8 */}
      {showPlanOptionsModal && (
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
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center mb-8">
              <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-6">
                <Settings size={32} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Que souhaitez-vous faire ?</h3>
              <p className="text-gray-600">
                Choisissez l'option qui vous convient le mieux
              </p>
            </div>

            <div className="space-y-4">
              {/* Option 1: Recommencer un nouveau plan */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => handlePlanOption('restart')}
                  className="w-full p-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/20 rounded-full">
                        <RefreshCw size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">Recommencer un nouveau plan</p>
                        <p className="text-sm opacity-90">Créer un nouveau plan d'épargne personnalisé</p>
                      </div>
                    </div>
                    <ArrowRight size={20} />
                  </div>
                </Button>
              </motion.div>

              {/* Option 2: Retirer l'argent */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => handlePlanOption('withdraw')}
                  className="w-full p-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/20 rounded-full">
                        <Minus size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">Retirer l'argent</p>
                        <p className="text-sm opacity-90">Retirer {formatCurrency(planEndData.finalBalance)} vers votre MoMo</p>
                      </div>
                    </div>
                    <ArrowRight size={20} />
                  </div>
                </Button>
              </motion.div>

              {/* Option 3: Garder l'argent sur le compte */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => handlePlanOption('keep')}
                  className="w-full p-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/20 rounded-full">
                        <PiggyBank size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">Garder l'argent sur le compte</p>
                        <p className="text-sm opacity-90">Conserver {formatCurrency(planEndData.finalBalance)} sur votre compte</p>
                      </div>
                    </div>
                    <ArrowRight size={20} />
                  </div>
                </Button>
              </motion.div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Button
                onClick={() => setShowPlanOptionsModal(false)}
                variant="outline"
                className="w-full"
              >
                Décider plus tard
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal d'avertissement de pénalité - ÉTAPE 9 */}
      {showPenaltyModal && (
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
            className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center mb-6">
              <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-6">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">⚠️ Retrait anticipé détecté</h3>
              <p className="text-gray-600">
                Vous effectuez un retrait avant la fin de votre plan d'épargne
              </p>
            </div>

            <div className="space-y-6">
              {/* Avertissement de pénalité */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-red-800 mb-4 text-center">🚨 Pénalité de retrait anticipé</h4>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {formatCurrency(securityRules.penaltyAmount)}
                    </div>
                    <p className="text-red-700 font-medium">Pénalité de 10% appliquée</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-red-200">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Montant demandé :</span>
                        <span className="text-lg font-semibold text-gray-800">
                          {formatCurrency(parseFloat(withdrawData.amount))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Pénalité (10%) :</span>
                        <span className="text-lg font-semibold text-red-600">
                          - {formatCurrency(securityRules.penaltyAmount)}
                        </span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Montant net reçu :</span>
                          <span className="text-2xl text-green-600">
                            {formatCurrency(securityRules.netWithdrawalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations sur les règles */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h5 className="font-semibold text-blue-800 mb-2">📋 Règles de retrait anticipé :</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Pénalité de 10% uniquement sur les retraits anticipés</li>
                  <li>• Aucune pénalité si votre plan est terminé</li>
                  <li>• Période minimale = durée de votre plan</li>
                  <li>• Exception : cas de force majeure (contactez-nous)</li>
                </ul>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <Button
                  onClick={confirmEarlyWithdrawal}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                >
                  Confirmer le retrait avec pénalité
                </Button>
                
                <Button
                  onClick={handleForceMajeureRequest}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  Cas de force majeure - Contacter l'agence
                </Button>
                
                <Button
                  onClick={() => setShowPenaltyModal(false)}
                  variant="outline"
                  className="w-full"
                >
                  Annuler le retrait
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal de force majeure - ÉTAPE 9 */}
      {showForceMajeureModal && (
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
            className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center mb-6">
              <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-6">
                <Info size={32} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cas de force majeure</h3>
              <p className="text-gray-600">
                Contactez notre équipe pour un retrait exceptionnel
              </p>
            </div>

            <div className="space-y-6">
              {/* Informations sur la force majeure */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-blue-800 mb-4 text-center">📞 Contactez notre équipe</h4>
                
                <div className="space-y-4">
                  <div className="text-center space-y-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {securityRules.forceMajeureContact}
                      </div>
                      <p className="text-blue-700">Email de contact pour les cas exceptionnels</p>
                    </div>
                    
                    <div>
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {securityRules.whatsappContact}
                      </div>
                      <p className="text-green-700">WhatsApp pour assistance rapide</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-blue-200">
                    <h5 className="font-semibold text-blue-800 mb-3">Cas de force majeure acceptés :</h5>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li>• 🏥 Urgences médicales</li>
                      <li>• 🚨 Situations d'urgence familiale</li>
                      <li>• 💼 Perte d'emploi soudaine</li>
                      <li>• 🏠 Déménagement forcé</li>
                      <li>• ⚡ Autres situations exceptionnelles</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h5 className="font-semibold text-yellow-800 mb-2">📝 Instructions :</h5>
                <div className="space-y-4">
                  <div>
                    <h6 className="font-medium text-yellow-800 mb-2">📧 Par email :</h6>
                    <ol className="text-sm text-yellow-700 space-y-1">
                      <li>1. Envoyez un email à {securityRules.forceMajeureContact}</li>
                      <li>2. Décrivez votre situation en détail</li>
                      <li>3. Joignez les justificatifs nécessaires</li>
                      <li>4. Notre équipe vous répondra sous 24h</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h6 className="font-medium text-yellow-800 mb-2">💬 Par WhatsApp :</h6>
                    <ol className="text-sm text-yellow-700 space-y-1">
                      <li>1. Contactez-nous sur {securityRules.whatsappContact}</li>
                      <li>2. Expliquez brièvement votre situation</li>
                      <li>3. Envoyez les photos des justificatifs</li>
                      <li>4. Réponse rapide garantie</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Boutons */}
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowForceMajeureModal(false);
                    setShowPenaltyModal(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                >
                  Compris, je vais contacter l'équipe
                </Button>
                
                <Button
                  onClick={() => setShowForceMajeureModal(false)}
                  variant="outline"
                  className="w-full"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Info/FAQ - ÉTAPE 10 */}
      {showInfoModal && (
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
            className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center mb-8">
              <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-6">
                <Info size={32} className="text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">📚 Centre d'information AB Épargne</h3>
              <p className="text-gray-600 text-lg">
                Tout ce que vous devez savoir sur votre compte d'épargne
              </p>
            </div>

            {/* Navigation des catégories */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                { id: 'general', label: 'Général', icon: '🏦' },
                { id: 'fees', label: 'Frais', icon: '💰' },
                { id: 'benefits', label: 'Bénéfices', icon: '📈' },
                { id: 'withdrawals', label: 'Retraits', icon: '💳' },
                { id: 'faq', label: 'FAQ', icon: '❓' }
              ].map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleInfoCategoryChange(category.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    activeFAQCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                </motion.button>
              ))}
            </div>

            {/* Contenu par catégorie */}
            <div className="space-y-6">
              {/* Catégorie Général */}
              {activeFAQCategory === 'general' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                    <h4 className="text-xl font-bold text-blue-800 mb-4">🏦 Qu'est-ce qu'AB Épargne ?</h4>
                    <div className="space-y-4 text-blue-700">
                      <p>
                        <strong>AB Épargne</strong> est un service d'épargne intelligent qui vous aide à :
                      </p>
                      <ul className="space-y-2 ml-4">
                        <li>• Épargner régulièrement selon vos objectifs</li>
                        <li>• Bénéficier d'intérêts attractifs (5% par mois)</li>
                        <li>• Suivre vos progrès en temps réel</li>
                        <li>• Recevoir des rappels automatiques</li>
                        <li>• Retirer vos fonds quand vous le souhaitez</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                    <h4 className="text-xl font-bold text-green-800 mb-4">🎯 Comment ça fonctionne ?</h4>
                    <div className="space-y-4 text-green-700">
                      <ol className="space-y-3 ml-4">
                        <li><strong>1. Création du compte :</strong> Configurez votre plan d'épargne</li>
                        <li><strong>2. Configuration du plan :</strong> Définissez montant, fréquence et durée</li>
                        <li><strong>3. Dépôts réguliers :</strong> Effectuez vos dépôts selon votre plan</li>
                        <li><strong>4. Intérêts automatiques :</strong> Recevez 5% d'intérêts chaque mois</li>
                        <li><strong>5. Retraits :</strong> Retirez vos fonds selon les conditions</li>
                      </ol>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Catégorie Frais */}
              {activeFAQCategory === 'fees' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >

                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6">
                    <h4 className="text-xl font-bold text-red-800 mb-4">⚠️ Pénalités de retrait anticipé</h4>
                    <div className="space-y-4 text-red-700">
                      <div className="bg-white rounded-xl p-4 border border-red-200">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600 mb-2">10%</div>
                          <p className="font-medium">Pénalité sur le montant retiré</p>
                        </div>
                      </div>
                      <ul className="space-y-2 ml-4">
                        <li>• <strong>Application :</strong> Uniquement sur les retraits anticipés</li>
                        <li>• <strong>Condition :</strong> Retrait avant la fin du plan d'épargne</li>
                        <li>• <strong>Calcul :</strong> 10% du montant demandé</li>
                        <li>• <strong>Exception :</strong> Aucune pénalité si plan terminé</li>
                        <li>• <strong>Force majeure :</strong> Contactez-nous pour exception</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Catégorie Bénéfices */}
              {activeFAQCategory === 'benefits' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >

                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6">
                    <h4 className="text-xl font-bold text-purple-800 mb-4">🎁 Avantages supplémentaires</h4>
                    <div className="space-y-4 text-purple-700">
                      <ul className="space-y-3 ml-4">
                        <li>• <strong>Rappels automatiques :</strong> Notifications avant chaque dépôt</li>
                        <li>• <strong>Suivi en temps réel :</strong> Progression visible 24h/24</li>
                        <li>• <strong>Flexibilité :</strong> Modifiez votre plan à tout moment</li>
                        <li>• <strong>Sécurité :</strong> Vos fonds sont protégés</li>
                        <li>• <strong>Support :</strong> Assistance disponible par email et WhatsApp</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Catégorie Retraits */}
              {activeFAQCategory === 'withdrawals' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                    <h4 className="text-xl font-bold text-blue-800 mb-4">💳 Conditions de retrait</h4>
                    <div className="space-y-4 text-blue-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-blue-200">
                          <h5 className="font-bold text-blue-800 mb-2">✅ Retraits normaux</h5>
                          <ul className="text-sm space-y-1">
                            <li>• Plan terminé</li>
                            <li>• Aucune pénalité</li>
                            <li>• Montant complet</li>
                            <li>• Traitement immédiat</li>
                          </ul>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-red-200">
                          <h5 className="font-bold text-red-800 mb-2">⚠️ Retraits anticipés</h5>
                          <ul className="text-sm space-y-1">
                            <li>• Plan en cours</li>
                            <li>• Pénalité 10%</li>
                            <li>• Montant réduit</li>
                            <li>• Avertissement obligatoire</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
                    <h4 className="text-xl font-bold text-orange-800 mb-4">🚨 Cas de force majeure</h4>
                    <div className="space-y-4 text-orange-700">
                      <p><strong>Exception aux règles de retrait :</strong></p>
                      <ul className="space-y-2 ml-4">
                        <li>• <strong>Urgences médicales</strong> - Justificatifs requis</li>
                        <li>• <strong>Situations familiales</strong> - Décès, naissance</li>
                        <li>• <strong>Perte d'emploi</strong> - Attestation de licenciement</li>
                        <li>• <strong>Déménagement forcé</strong> - Justificatifs de propriétaire</li>
                        <li>• <strong>Autres cas exceptionnels</strong> - Évaluation au cas par cas</li>
                      </ul>
                      <div className="bg-white rounded-xl p-4 border border-orange-200 mt-4">
                        <p className="text-center font-medium">
                          <strong>Contact :</strong> {securityRules.forceMajeureContact} ou {securityRules.whatsappContact}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Catégorie FAQ */}
              {activeFAQCategory === 'faq' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {[
                    {
                      id: 'faq1',
                      question: 'Puis-je modifier mon plan d\'épargne après l\'avoir créé ?',
                      answer: 'Oui, vous pouvez modifier votre plan à tout moment. Allez dans la section "Plan" et ajustez le montant, la fréquence ou la durée selon vos besoins.'
                    },
                    {
                      id: 'faq2',
                      question: 'Que se passe-t-il si je ne respecte pas mon plan de dépôts ?',
                      answer: 'Aucune pénalité n\'est appliquée si vous manquez un dépôt. Vous pouvez reprendre vos dépôts à tout moment. Les intérêts sont calculés sur le solde réel.'
                    },
                    {
                      id: 'faq3',
                      question: 'Comment sont calculés les intérêts ?',
                      answer: 'Les intérêts sont calculés mensuellement à 5% sur votre solde total. Ils sont automatiquement ajoutés à votre compte et capitalisés.'
                    },
                    {
                      id: 'faq4',
                      question: 'Puis-je retirer une partie de mes fonds ?',
                      answer: 'Oui, vous pouvez retirer une partie de vos fonds. Si c\'est un retrait anticipé, une pénalité de 10% s\'applique. Si votre plan est terminé, aucun frais.'
                    },
                    {
                      id: 'faq5',
                      question: 'Combien de temps faut-il pour recevoir mon retrait ?',
                      answer: 'Les retraits via Mobile Money sont traités immédiatement. Vous recevez votre argent dans les minutes qui suivent la confirmation.'
                    },
                    {
                      id: 'faq6',
                      question: 'Que faire en cas de problème technique ?',
                      answer: 'Contactez-nous par email à abpret51@gmail.com ou par WhatsApp au +225 0700000000. Notre équipe vous répondra rapidement.'
                    }
                  ].map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQItem(item.id)}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-900">{item.question}</span>
                        <ChevronDown
                          size={20}
                          className={`text-gray-500 transition-transform ${
                            expandedFAQItems.has(item.id) ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedFAQItems.has(item.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 text-gray-600"
                        >
                          {item.answer}
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Bouton de fermeture */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Button
                onClick={() => setShowInfoModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                Fermer
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Bouton Info/FAQ en bas de page */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex justify-center">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => setShowInfoModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-md hover:shadow-lg rounded-xl flex items-center space-x-2"
            >
              <Info size={20} />
              <span className="font-medium">Info/FAQ</span>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Popup des détails du plan d'épargne - Style Apple */}
      {showPlanDetailsModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 md:items-center"
          onClick={() => setShowPlanDetailsModal(false)}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-md md:max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header avec bouton fermer */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Détails du plan</h2>
                  <p className="text-sm text-gray-500">{savingsData.planName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPlanDetailsModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenu du popup */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                {/* Informations principales */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Montant fixe</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(savingsData.fixedAmount)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Fréquence</p>
                    <p className="text-lg font-semibold text-gray-900">Tous les {savingsData.frequencyDays} jours</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Durée</p>
                    <p className="text-lg font-semibold text-gray-900">{savingsData.durationMonths} mois</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Taux d'intérêt</p>
                    <p className="text-lg font-semibold text-gray-900">{savingsData.interestRate}% par mois</p>
                  </div>
                </div>

                {/* Progression */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Progression</h3>
                    <span className="text-2xl font-bold text-blue-600">{savingsData.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${savingsData.completionPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{savingsData.completedDeposits} dépôts effectués</span>
                    <span>{savingsData.totalDepositsRequired - savingsData.completedDeposits} restants</span>
                  </div>
                </div>

                {/* Objectif total */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">Objectif total</p>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(savingsData.monthlyGoal)}</p>
                    <p className="text-sm text-gray-500 mt-1">Montant à atteindre</p>
                  </div>
                </div>

                {/* Informations supplémentaires */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Dépôts effectués</span>
                    <span className="text-sm font-semibold text-gray-900">{savingsData.completedDeposits} / {savingsData.totalDepositsRequired}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Prochaine échéance</span>
                    <span className="text-sm font-semibold text-gray-900">Dans {savingsData.frequencyDays} jours</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium text-gray-600">Statut du plan</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Actif
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer avec bouton fermer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <Button
                onClick={() => setShowPlanDetailsModal(false)}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-medium transition-colors duration-200"
              >
                Fermer
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ABEpargne; 