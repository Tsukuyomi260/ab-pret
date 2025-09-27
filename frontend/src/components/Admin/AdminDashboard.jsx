import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { getAllUsers, getLoans, getAnalyticsData, updateUserStatus, updateLoanStatus } from '../../utils/supabaseAPI';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Logo from '../UI/Logo';
import AdminNotifications from './AdminNotifications';
import { useRealtimeNotifications } from '../../hooks/useRealtimeNotifications';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  UserCheck,
  Bell,
  UserX,
  Home,
  Settings,
  BarChart3,
  LogOut,
  Store,
  Plus,
  MessageCircle,
  Info,
  ArrowRight,
  Menu,
  PiggyBank,
  ChevronDown
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Activer les notifications en temps réel
  const { isConnected } = useRealtimeNotifications();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLoans: 0,
    totalAmount: 0,
    pendingRequests: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger les vraies données depuis Supabase
        const [usersResult, loansResult, analyticsResult] = await Promise.all([
          getAllUsers(),
          getLoans(),
          getAnalyticsData()
        ]);

        // Traitement des utilisateurs
        if (usersResult.success) {
          const pendingUsers = usersResult.data.filter(user => user.status === 'pending');
          setPendingRegistrations(pendingUsers);
          setStats(prev => ({
            ...prev,
            totalUsers: usersResult.data.length
          }));
        }
        
        // Traitement des prêts
        if (loansResult.success) {
          const recentLoans = loansResult.data.slice(0, 5).map(loan => ({
            id: loan.id,
            user: {
              firstName: loan.users?.first_name || 'Utilisateur',
              lastName: loan.users?.last_name || 'Inconnu',
              email: loan.users?.email || 'email@inconnu.com'
            },
            amount: loan.amount || 0,
            status: loan.status || 'pending',
            requestDate: loan.created_at || new Date().toISOString(),
            purpose: loan.purpose || 'Non spécifié'
          }));
          setRecentRequests(recentLoans);
          
          // Mettre à jour les statistiques des prêts
          const totalLoans = loansResult.data.length;
          const totalAmount = loansResult.data.reduce((sum, loan) => sum + (loan.amount || 0), 0);
          // Compter les demandes de prêt en attente
          const pendingLoans = loansResult.data.filter(loan => (loan.status || '').toLowerCase() === 'pending').length;
          // Prêts approuvés par l'admin
          // Règle robuste: si approved_by/approved_at est présent → approuvé par l'admin
          // Sinon, fallback sur les statuts qui suivent l'approbation ('active' ou 'approved')
          const approvedLoans = loansResult.data.filter(loan => {
            const s = (loan.status || '').toLowerCase();
            const hasAdminApproval = Boolean(loan.approved_by) || Boolean(loan.approved_at);
            const statusLooksApproved = s === 'active' || s === 'approved';
            return hasAdminApproval || statusLooksApproved;
          });
          const approvedCount = approvedLoans.length;
          const approvedAmount = approvedLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
          setStats(prev => ({
            ...prev,
            totalLoans,
            totalAmount,
            pendingRequests: pendingLoans,
            approvedCount,
            approvedAmount
          }));
        }

        // Traitement des analytics
        if (analyticsResult.success) {
          const analytics = analyticsResult.data;
          setStats(prev => ({
            ...prev,
            totalUsers: analytics.overview?.totalUsers || prev.totalUsers,
            totalLoans: analytics.overview?.totalLoans || prev.totalLoans,
            totalAmount: analytics.overview?.totalAmount || prev.totalAmount
          }));
        }

      } catch (error) {
        console.error('[ADMIN] Erreur lors du chargement des données:', error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      const result = await updateLoanStatus(requestId, 'approved', user?.id);
      
      if (result.success) {
        // Mettre à jour l'interface
      setRecentRequests(prev => 
        prev.map(request => 
          request.id === requestId 
            ? { ...request, status: 'approved' }
            : request
        )
      );
      setStats(prev => ({
        ...prev,
        pendingRequests: Math.max(0, prev.pendingRequests - 1)
      }));
      alert('Demande approuvée avec succès !');
      } else {
        alert('Erreur lors de l\'approbation de la demande');
      }
    } catch (error) {
      console.error('[ADMIN] Erreur lors de l\'approbation:', error);
      alert('Erreur lors de l\'approbation de la demande');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const result = await updateLoanStatus(requestId, 'rejected', user?.id);
      
      if (result.success) {
        // Mettre à jour l'interface
      setRecentRequests(prev => 
        prev.map(request => 
          request.id === requestId 
            ? { ...request, status: 'rejected' }
            : request
        )
      );
      setStats(prev => ({
        ...prev,
        pendingRequests: Math.max(0, prev.pendingRequests - 1)
      }));
      alert('Demande rejetée avec succès !');
      } else {
        alert('Erreur lors du rejet de la demande');
      }
    } catch (error) {
      console.error('[ADMIN] Erreur lors du rejet:', error);
      alert('Erreur lors du rejet de la demande');
    }
  };

  const handleApproveRegistration = async (userId) => {
    try {
      const result = await updateUserStatus(userId, 'approved');
      
      if (result.success) {
        // Mettre à jour l'interface
      setPendingRegistrations(prev => 
        prev.filter(user => user.id !== userId)
      );
      
        // Recharger les statistiques
        const usersResult = await getAllUsers();
        if (usersResult.success) {
          const pendingUsers = usersResult.data.filter(user => user.status === 'pending');
          setStats(prev => ({
            ...prev,
            totalUsers: usersResult.data.length,
            pendingRequests: pendingUsers.length
          }));
        }
      
      alert('Inscription approuvée avec succès !');
      } else {
        alert('Erreur lors de l\'approbation de l\'inscription');
      }
    } catch (error) {
      console.error('[ADMIN] Erreur lors de l\'approbation de l\'inscription:', error);
      alert('Erreur lors de l\'approbation de l\'inscription');
    }
  };

  const handleRejectRegistration = async (userId) => {
    try {
      const result = await updateUserStatus(userId, 'rejected');
      
      if (result.success) {
        // Mettre à jour l'interface
      setPendingRegistrations(prev => 
        prev.filter(user => user.id !== userId)
      );
      
        // Recharger les statistiques
        const usersResult = await getAllUsers();
        if (usersResult.success) {
          const pendingUsers = usersResult.data.filter(user => user.status === 'pending');
          setStats(prev => ({
            ...prev,
            totalUsers: usersResult.data.length,
            pendingRequests: pendingUsers.length
          }));
        }
      
      alert('Inscription rejetée avec succès !');
      } else {
        alert('Erreur lors du rejet de l\'inscription');
      }
    } catch (error) {
      console.error('[ADMIN] Erreur lors du rejet de l\'inscription:', error);
      alert('Erreur lors du rejet de l\'inscription');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      default: return 'Inconnu';
    }
  };

  const handleLogout = async () => {
    try {
      console.log('[ADMIN] Tentative de déconnexion...');
      await logout();
      console.log('[ADMIN] ✅ Déconnexion réussie, redirection vers login');
      navigate('/login');
    } catch (error) {
      console.error('[ADMIN] ❌ Erreur lors de la déconnexion:', error);
      // Forcer la déconnexion locale même en cas d'erreur
      try { localStorage.removeItem('ab_user_cache'); } catch (_) {}
    navigate('/login');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-accent-50 w-full overflow-x-hidden">
      {/* Contenu du dashboard */}
      <main className="w-full overflow-x-hidden">
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            {/* Background avec gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 opacity-10"></div>
            
            {/* Pattern décoratif */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
              <div className="absolute top-0 right-0 w-72 h-72 bg-secondary-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
          </div>
          
            {/* Contenu Hero */}
            <div className="relative px-4 lg:px-8 pt-8 lg:pt-12 pb-12 lg:pb-16">
              <div className="max-w-7xl mx-auto">
                {/* En-tête avec salutation */}
                <div className="text-center mb-8 lg:mb-12">


                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl lg:text-6xl font-bold text-secondary-900 font-montserrat mb-4"
                  >
                    {getGreeting()}, <span className="text-primary-600">Abel</span> ! 👋
                  </motion.h1>


            </div>
            
                {/* Statistiques rapides */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/admin/loan-requests?status=approved')}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-primary-100 rounded-xl">
                        <CreditCard size={20} className="text-primary-600" />
            </div>
                      <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                        Accordés
                      </span>
          </div>
                    <div className="flex items-baseline gap-3">
                      <p className="text-2xl font-bold text-secondary-900 font-montserrat">
                        {formatCurrency(stats.approvedAmount || 0)}
                      </p>
                      <span className="text-sm text-neutral-500">
                        {stats.approvedCount || 0} prêts
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/admin/user-management')}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Users size={20} className="text-green-600" />
                  </div>
                      <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                        Actifs
                      </span>
                </div>
                    <p className="text-2xl font-bold text-secondary-900 font-montserrat mb-1">
                      {stats.totalUsers}
                    </p>
                    <p className="text-sm text-neutral-600 font-montserrat">
                      Clients inscrits
                    </p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/admin/loan-requests')}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-yellow-100 rounded-xl">
                        <Clock size={20} className="text-yellow-600" />
                      </div>
                      <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                        En attente
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-secondary-900 font-montserrat mb-1">
                      {stats.pendingRequests}
                    </p>
                    <p className="text-sm text-neutral-600 font-montserrat">
                      Demandes à traiter
                    </p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <TrendingUp size={20} className="text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                        Ce mois
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-secondary-900 font-montserrat mb-1">
                      {formatCurrency(stats.totalAmount * 0.3)}
                    </p>
                    <p className="text-sm text-neutral-600 font-montserrat">
                      Nouveaux prêts
                    </p>
                  </div>
                </motion.div>

                {/* Actions rapides */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/admin/loan-requests')}
                    className="group cursor-pointer h-full"
                  >
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                          <CreditCard size={24} />
                        </div>
                        <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold font-montserrat mb-2">
                          Gérer les Demandes
                        </h3>
                        <p className="text-primary-100 text-sm font-montserrat">
                          Traiter les demandes de prêt en attente
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group cursor-pointer h-full relative menu-container"
                  >
                    <div 
                      onClick={() => setShowMenu(!showMenu)}
                      className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                          <Menu size={24} />
                        </div>
                        <ChevronDown size={20} className={`transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold font-montserrat mb-2">
                          Menu
                        </h3>
                        <p className="text-green-100 text-sm font-montserrat">
                          Accéder aux fonctionnalités
                        </p>
                      </div>
                    </div>
                    
                    {/* Menu déroulant */}
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
                      >
                        <div className="p-2">
                          <button
                            onClick={() => {
                              navigate('/admin/user-management');
                              setShowMenu(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Users size={20} className="text-gray-600" />
                            <div>
                              <p className="font-medium text-gray-900">Gérer les Utilisateurs</p>
                              <p className="text-sm text-gray-500">Voir et gérer tous les clients</p>
                            </div>
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('/admin/ab-epargne');
                              setShowMenu(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <PiggyBank size={20} className="text-green-600" />
                            <div>
                              <p className="font-medium text-gray-900">AB Epargne</p>
                              <p className="text-sm text-gray-500">Gérer les comptes d'épargne</p>
                            </div>
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('/admin/test-notifications');
                              setShowMenu(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Bell size={20} className="text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900">Test Notifications</p>
                              <p className="text-sm text-gray-500">Tester les notifications push</p>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/admin/analytics')}
                    className="group cursor-pointer h-full"
                  >
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                          <BarChart3 size={24} />
                        </div>
                        <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold font-montserrat mb-2">
                          Voir les Rapports
                        </h3>
                        <p className="text-blue-100 text-sm font-montserrat">
                          Analyser les performances
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/admin/settings')}
                    className="group cursor-pointer h-full"
                  >
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                          <Settings size={24} />
                        </div>
                        <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold font-montserrat mb-2">
                          Paramètres
                        </h3>
                        <p className="text-purple-100 text-sm font-montserrat">
                          Configurer l'application
                        </p>
                      </div>
                    </div>
                  </motion.div>


                </motion.div>
                </div>
            </div>
          </div>





          {/* Contenu principal après Hero */}
          <div className="px-4 lg:px-8 py-8 lg:py-12">
            <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
              
              {/* Notifications et demandes en attente */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="bg-white/90 backdrop-blur-sm">
                    <AdminNotifications />
                  </Card>
                </div>
                
                {/* Actions rapides */}
                <div className="space-y-4">
                  <Card className="bg-white/90 backdrop-blur-sm">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                      <div className="space-y-3">
                        <Button
                          onClick={() => navigate('/admin/loan-requests')}
                          className="w-full justify-center"
                        >
                          <CreditCard size={16} className="mr-2" />
                          Gérer les prêts
                        </Button>
                        <div className="relative menu-container">
                          <Button
                            onClick={() => setShowMenu(!showMenu)}
                            variant="outline"
                            className="w-full justify-center"
                          >
                            <Menu size={16} className="mr-2" />
                            Menu
                            <ChevronDown size={16} className={`ml-2 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
                          </Button>
                          
                          {/* Menu déroulant pour les actions rapides */}
                          {showMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                            >
                              <div className="p-1">
                                <button
                                  onClick={() => {
                                    navigate('/admin/user-management');
                                    setShowMenu(false);
                                  }}
                                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors text-sm"
                                >
                                  <Users size={16} className="text-gray-600" />
                                  <span>Gérer les Utilisateurs</span>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    navigate('/admin/ab-epargne');
                                    setShowMenu(false);
                                  }}
                                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors text-sm"
                                >
                                  <PiggyBank size={16} className="text-green-600" />
                                  <span>AB Epargne</span>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    navigate('/admin/test-notifications');
                                    setShowMenu(false);
                                  }}
                                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors text-sm"
                                >
                                  <Bell size={16} className="text-blue-600" />
                                  <span>Test Notifications</span>
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              
            </div>
          </div>
        </main>

      {/* Bouton flottant */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 text-white rounded-full shadow-large hover:bg-primary-600 transition-colors duration-200 flex items-center justify-center z-30">
        <MessageCircle size={24} />
      </button>
    </div>
  );
};

export default AdminDashboard;
