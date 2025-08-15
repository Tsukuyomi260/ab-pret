import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { 
  getSavingsAccount, 
  getSavingsTransactions, 
  createSavingsTransaction, 
  updateSavingsAccount 
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
  Info
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
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);

