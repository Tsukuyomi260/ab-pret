import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { LogOut, User, Bell, Menu, X } from 'lucide-react';
import Logo from '../UI/Logo';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showInfo } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Vérifier les nouvelles notifications pour l'admin
  useEffect(() => {
    if (user?.role === 'admin') {
      const checkNotifications = () => {
        const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        const unreadNotifications = adminNotifications.filter(notification => 
          !notification.read && 
          new Date(notification.timestamp) > new Date(Date.now() - 5 * 60 * 1000) // 5 dernières minutes
        );
        
        if (unreadNotifications.length > 0) {
          setNotificationCount(unreadNotifications.length);
          
          // Afficher une notification toast pour la première nouvelle inscription
          const latestNotification = unreadNotifications[0];
          if (latestNotification.type === 'new_registration') {
            showInfo(`Nouvelle inscription : ${latestNotification.user.firstName} ${latestNotification.user.lastName}`);
          }
        }
      };

      // Vérifier toutes les 30 secondes
      const interval = setInterval(checkNotifications, 30000);
      checkNotifications(); // Vérifier immédiatement

      return () => clearInterval(interval);
    }
  }, [user?.role, showInfo]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoClick = () => {
    // Si l'utilisateur est admin et qu'on est dans une page admin, rester dans l'admin
    if (user?.role === 'admin' && location.pathname.startsWith('/admin')) {
      navigate('/admin');
    } else if (user?.role === 'admin') {
      // Si admin mais pas dans une page admin, aller vers l'admin
      navigate('/admin');
    } else {
      // Sinon, aller vers le dashboard utilisateur
      navigate('/dashboard');
    }
  };

  // Fonction pour obtenir le nom d'affichage
  const getDisplayName = () => {
    if (user?.role === 'admin') {
      return 'Abel Viakinnou';
    }
    return `${user?.firstName} ${user?.lastName}`;
  };

  return (
    <header className="bg-white shadow-soft border-b border-accent-200 w-full overflow-x-hidden">
      <div className="w-full">
        <div className="flex justify-between items-center py-4 w-full px-4 lg:px-8">
          {/* Logo AB PRET */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
          >
            <Logo size="md" />
          </button>

          {/* Navigation desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            <a href="/dashboard" className="text-neutral-600 hover:text-secondary-900 font-montserrat transition-colors duration-200">
              Accueil
            </a>
            {user?.role === 'admin' ? (
              <>
                <a href="/admin/loan-requests" className="text-neutral-600 hover:text-secondary-900 font-montserrat transition-colors duration-200">
                  Demandes de prêt
                </a>
                <a href="/admin/user-management" className="text-neutral-600 hover:text-secondary-900 font-montserrat transition-colors duration-200">
                  Gestion utilisateur
                </a>
                <a href="/admin/analytics" className="text-neutral-600 hover:text-secondary-900 font-montserrat transition-colors duration-200">
                  Analytiques
                </a>
              </>
            ) : (
              <>
                <a href="/loan-request" className="text-neutral-600 hover:text-secondary-900 font-montserrat transition-colors duration-200">
                  Demander un prêt
                </a>
                <a href="/loan-history" className="text-neutral-600 hover:text-secondary-900 font-montserrat transition-colors duration-200">
                  Historique
                </a>
                <a href="/repayment" className="text-neutral-600 hover:text-secondary-900 font-montserrat transition-colors duration-200">
                  Remboursement
                </a>
              </>
            )}
          </nav>

          {/* Actions utilisateur desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            {user?.role === 'admin' && notificationCount > 0 && (
              <button className="relative p-2 text-neutral-400 hover:text-neutral-600 transition-colors duration-200">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              </button>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-primary-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-secondary-900 font-montserrat">
                  {getDisplayName()}
                </span>
                <span className="text-xs text-neutral-600 font-montserrat">
                  {user?.role === 'admin' ? 'Administrateur' : 'Client'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Bouton menu mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-400 hover:text-neutral-600"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-accent-200 py-4 w-full">
            <nav className="flex flex-col space-y-4">
              <a 
                href="/dashboard" 
                className="text-neutral-600 hover:text-secondary-900 font-montserrat transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-accent-50 flex items-start space-x-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="w-5 h-5 flex-shrink-0 mt-0.5">🏠</span>
                <span>Accueil</span>
              </a>
              {user?.role === 'admin' ? (
                <>
                  <a 
                    href="/admin/loan-requests" 
                    className="text-neutral-600 hover:text-secondary-900 font-montserrat transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-accent-50 flex items-start space-x-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="w-5 h-5 flex-shrink-0 mt-0.5">📋</span>
                    <span>Demandes de prêt</span>
                  </a>
                  <a 
                    href="/admin/user-management" 
                    className="text-neutral-600 hover:text-secondary-900 font-montserrat transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-accent-50 flex items-start space-x-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="w-5 h-5 flex-shrink-0 mt-0.5">👥</span>
                    <span>Gestion utilisateur</span>
                  </a>
                  <a 
                    href="/admin/analytics" 
                    className="text-neutral-600 hover:text-secondary-900 font-montserrat transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-accent-50 flex items-start space-x-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="w-5 h-5 flex-shrink-0 mt-0.5">📊</span>
                    <span>Analytiques</span>
                  </a>
                </>
              ) : (
                <>
                  <a 
                    href="/loan-request" 
                    className="text-neutral-600 hover:text-secondary-900 font-montserrat transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-accent-50 flex items-start space-x-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="w-5 h-5 flex-shrink-0 mt-0.5">💳</span>
                    <span className="text-left leading-tight">
                      Demander un<br />prêt
                    </span>
                  </a>
                  <a 
                    href="/loan-history" 
                    className="text-neutral-600 hover:text-secondary-900 font-montserrat transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-accent-50 flex items-start space-x-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="w-5 h-5 flex-shrink-0 mt-0.5">📊</span>
                    <span>Historique</span>
                  </a>
                  <a 
                    href="/repayment" 
                    className="text-neutral-600 hover:text-secondary-900 font-montserrat transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-accent-50 flex items-start space-x-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="w-5 h-5 flex-shrink-0 mt-0.5">💰</span>
                    <span>Remboursement</span>
                  </a>
                </>
              )}
            </nav>
            
            {/* Actions utilisateur mobile */}
            <div className="mt-6 pt-6 border-t border-accent-200">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-primary-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-secondary-900 font-montserrat">
                      {getDisplayName()}
                    </span>
                    <span className="text-xs text-neutral-600 font-montserrat">
                      {user?.role === 'admin' ? 'Administrateur' : 'Client'}
              </span>
            </div>
                </div>
            <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;