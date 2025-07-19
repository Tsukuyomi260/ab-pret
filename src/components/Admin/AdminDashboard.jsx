import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Logo from '../UI/Logo';
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
  UserX,
  Home,
  FileText,
  Settings,
  BarChart3,
  LogOut,
  Search,
  ArrowLeft,
  Store,
  Copy,
  MoreHorizontal,
  Monitor,
  Plus,
  Star,
  Zap,
  MessageCircle,
  Info,
  Menu,
  X
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLoans: 0,
    totalAmount: 0,
    pendingRequests: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulation des données (à remplacer par des appels API)
    setTimeout(() => {
      setStats({
        totalUsers: 132,
        totalLoans: 890,
        totalAmount: 824000,
        pendingRequests: 15
      });
      
      setRecentRequests([
        {
          id: 1,
          user: {
            firstName: 'Kossi',
            lastName: 'Ablo',
            email: 'kossi.ablo@email.com'
          },
          amount: 75000,
          status: 'pending',
          requestDate: '2025-08-15',
          purpose: 'Achat de matériel informatique'
        },
        {
          id: 2,
          user: {
            firstName: 'Fatou',
            lastName: 'Diallo',
            email: 'fatou.diallo@email.com'
          },
          amount: 120000,
          status: 'approved',
          requestDate: '2025-08-14',
          purpose: 'Rénovation de boutique'
        },
        {
          id: 3,
          user: {
            firstName: 'Moussa',
            lastName: 'Traoré',
            email: 'moussa.traore@email.com'
          },
          amount: 50000,
          status: 'rejected',
          requestDate: '2025-08-13',
          purpose: 'Frais de scolarité'
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const handleApprove = async (requestId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
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
    } catch (error) {
      alert('Erreur lors de l\'approbation de la demande');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
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
    } catch (error) {
      alert('Erreur lors du rejet de la demande');
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

  const handleLogout = () => {
    logout();
    navigate('/login');
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
    <div className="flex min-h-screen bg-accent-50 w-full overflow-x-hidden">
      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-soft border-r border-accent-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 h-full flex flex-col">
          {/* Header mobile avec bouton fermer */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <Logo size="sm" showText={true} />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-neutral-400 hover:text-neutral-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Logo CAMPUS FINANCE (desktop) */}
          <div className="hidden lg:block mb-8">
            <Logo size="md" showText={true} />
            <div className="mt-2">
              <div className="inline-block bg-accent-100 text-accent-700 text-xs px-2 py-1 rounded-full font-montserrat">
                Admin
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            <button
              onClick={() => {
                navigate('/admin');
                setSidebarOpen(false);
              }}
              className="w-full flex items-start space-x-3 px-4 py-3 text-secondary-900 bg-primary-100 rounded-xl font-montserrat"
            >
              <Home size={20} className="flex-shrink-0 mt-0.5" />
              <span className="font-medium">Accueil</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/admin/loan-requests');
                setSidebarOpen(false);
              }}
              className="w-full flex items-start space-x-3 px-4 py-3 text-neutral-600 hover:text-secondary-900 hover:bg-accent-100 rounded-xl transition-colors duration-200 font-montserrat"
            >
              <CreditCard size={20} className="flex-shrink-0 mt-0.5" />
              <span className="text-left leading-tight">
                Demandes de<br />prêt
              </span>
            </button>
            
            <button
              onClick={() => {
                navigate('/admin/users');
                setSidebarOpen(false);
              }}
              className="w-full flex items-start space-x-3 px-4 py-3 text-neutral-600 hover:text-secondary-900 hover:bg-accent-100 rounded-xl transition-colors duration-200 font-montserrat"
            >
              <Users size={20} className="flex-shrink-0 mt-0.5" />
              <span className="text-left leading-tight">
                Gestion<br />utilisateurs
              </span>
            </button>
            
            <button
              onClick={() => {
                navigate('/admin/reports');
                setSidebarOpen(false);
              }}
              className="w-full flex items-start space-x-3 px-4 py-3 text-neutral-600 hover:text-secondary-900 hover:bg-accent-100 rounded-xl transition-colors duration-200 font-montserrat"
            >
              <BarChart3 size={20} className="flex-shrink-0 mt-0.5" />
              <span>Analytiques</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/admin/settings');
                setSidebarOpen(false);
              }}
              className="w-full flex items-start space-x-3 px-4 py-3 text-neutral-600 hover:text-secondary-900 hover:bg-accent-100 rounded-xl transition-colors duration-200 font-montserrat"
            >
              <Settings size={20} className="flex-shrink-0 mt-0.5" />
              <span>Paramètres</span>
            </button>
          </nav>
          
          {/* Déconnexion en bas */}
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors duration-200 font-montserrat"
            >
              <LogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 w-full overflow-x-hidden">
        {/* Header */}
        <header className="bg-white shadow-soft border-b border-accent-200 px-4 lg:px-8 py-4 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              {/* Bouton menu burger pour mobile */}
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-neutral-400 hover:text-neutral-600"
              >
                <Menu size={24} />
              </button>
              
              <button className="hidden lg:block p-2 text-neutral-400 hover:text-neutral-600">
                <ArrowLeft size={20} />
              </button>
              <span className="text-lg font-medium text-secondary-900 font-montserrat">Aperçu</span>
            </div>
            
            {/* Barre de recherche */}
            <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-accent-50 border border-accent-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-montserrat"
                />
              </div>
            </div>
            
            {/* Actions utilisateur */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="hidden lg:flex items-center space-x-2"
              >
                <Store size={16} />
                <span>Visiter le site</span>
              </Button>
              <button className="p-2 text-neutral-400 hover:text-neutral-600">
                <Copy size={20} />
              </button>
              <button className="p-2 text-neutral-400 hover:text-neutral-600">
                <MoreHorizontal size={20} />
              </button>
              <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
                <Monitor size={16} className="text-secondary-900" />
              </div>
            </div>
          </div>
        </header>

        {/* Contenu du dashboard */}
        <main className="p-4 lg:p-8 w-full overflow-x-hidden">
          {/* Message de bienvenue */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-secondary-900 font-montserrat mb-2">
              {getGreeting()} Abel ! ☀️
            </h1>
            <p className="text-base lg:text-lg text-neutral-600 font-montserrat">
              Gérez vos prêts et accompagnez vos clients vers le succès. ☀️
            </p>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 lg:mb-8">
            <Button
              variant="outline"
              className="p-4 h-auto flex-col space-y-2 bg-white"
            >
              <Users size={24} className="text-primary-500" />
              <span className="font-medium text-secondary-900">Gérer les utilisateurs</span>
            </Button>
            
            <Button
              variant="outline"
              className="p-4 h-auto flex-col space-y-2 bg-white"
            >
              <CreditCard size={24} className="text-primary-500" />
              <span className="font-medium text-secondary-900">Approuver des demandes</span>
            </Button>
            
            <Button
              variant="outline"
              className="p-4 h-auto flex-col space-y-2 bg-white"
            >
              <BarChart3 size={24} className="text-primary-500" />
              <span className="font-medium text-secondary-900">Voir les rapports</span>
            </Button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <Card className="bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-600 font-montserrat mb-1">Prêts totaux accordés</p>
                  <p className="text-lg lg:text-xl font-bold text-secondary-900 font-montserrat truncate">
                    {formatCurrency(stats.totalAmount)}
                  </p>
                </div>
                <div className="p-2 bg-primary-100 rounded-full ml-3 flex-shrink-0 mt-0.5">
                  <CreditCard size={16} className="text-primary-600" />
                </div>
              </div>
            </Card>

            <Card className="bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-600 font-montserrat mb-1">Prêts ce mois</p>
                  <p className="text-lg lg:text-xl font-bold text-secondary-900 font-montserrat truncate">
                    {formatCurrency(stats.totalAmount * 0.3)}
                  </p>
                </div>
                <div className="p-2 bg-primary-100 rounded-full ml-3 flex-shrink-0 mt-0.5">
                  <TrendingUp size={16} className="text-primary-600" />
                </div>
              </div>
            </Card>

            <Card className="bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-600 font-montserrat mb-1">Utilisateurs actifs</p>
                  <p className="text-lg lg:text-xl font-bold text-secondary-900 font-montserrat truncate">
                    {stats.totalUsers}
                  </p>
                </div>
                <div className="p-2 bg-primary-100 rounded-full ml-3 flex-shrink-0 mt-0.5">
                  <Users size={16} className="text-primary-600" />
                </div>
              </div>
            </Card>

            <Card className="bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-600 font-montserrat mb-1">Demandes en attente</p>
                  <p className="text-lg lg:text-xl font-bold text-secondary-900 font-montserrat truncate">
                    {stats.pendingRequests}
                  </p>
                </div>
                <div className="p-2 bg-primary-100 rounded-full ml-3 flex-shrink-0 mt-0.5">
                  <Clock size={16} className="text-primary-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Demandes récentes */}
          <Card title="Demandes récentes" className="bg-white">
            {recentRequests.length > 0 ? (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div 
                    key={request.id}
                    className="flex flex-col lg:flex-row lg:items-start lg:justify-between p-4 border border-accent-200 rounded-xl hover:shadow-soft transition-shadow duration-200"
                  >
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex flex-col lg:flex-row lg:items-start space-y-2 lg:space-y-0 lg:space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span>{getStatusText(request.status)}</span>
                          </span>
                        </div>
                        <p className="font-medium text-secondary-900 font-montserrat">
                          {request.user.firstName} {request.user.lastName}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-neutral-600 font-montserrat">Montant:</span>
                          <p className="font-medium text-secondary-900 font-montserrat">{formatCurrency(request.amount)}</p>
                        </div>
                        <div>
                          <span className="text-neutral-600 font-montserrat">Date:</span>
                          <p className="font-medium text-secondary-900 font-montserrat">{new Date(request.requestDate).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div>
                          <span className="text-neutral-600 font-montserrat">Objet:</span>
                          <p className="font-medium text-secondary-900 font-montserrat truncate">{request.purpose}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 lg:flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/loan-request/${request.id}`)}
                      >
                        <Eye size={16} />
                      </Button>
                      
                      {request.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(request.id)}
                          >
                            <UserCheck size={16} />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(request.id)}
                          >
                            <UserX size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-500 font-montserrat">Aucune demande récente</p>
              </div>
            )}
          </Card>
        </main>
      </div>

      {/* Bouton flottant */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 text-white rounded-full shadow-large hover:bg-primary-600 transition-colors duration-200 flex items-center justify-center z-30">
        <MessageCircle size={24} />
      </button>
    </div>
  );
};

export default AdminDashboard;
