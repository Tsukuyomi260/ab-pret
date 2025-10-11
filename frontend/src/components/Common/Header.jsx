import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { LogOut, User, Bell, Menu, X, ArrowRight } from 'lucide-react';
import Logo from '../UI/Logo';
import NotificationBell from '../UI/NotificationBell';
// Animations supprimées pour améliorer les performances

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showInfo, notifications, markAsRead, refreshNotifications } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Charger les notifications pour l'utilisateur connecté
  useEffect(() => {
    if (user?.id) {
      refreshNotifications(user.id);
    }
  }, [user?.id, refreshNotifications]);

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

  const handleLogout = async () => {
    try {
      console.log('[HEADER] Tentative de déconnexion...');
      await logout();
      console.log('[HEADER] ✅ Déconnexion réussie, redirection vers login');
      navigate('/login');
    } catch (error) {
      console.error('[HEADER] ❌ Erreur lors de la déconnexion:', error);
      // Forcer la déconnexion locale même en cas d'erreur
      try { localStorage.removeItem('ab_user_cache'); } catch (_) {}
      navigate('/login');
    }
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
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email || 'Utilisateur';
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-soft border-b border-accent-200 w-full z-50">
      <div className="w-full">
        <div className="flex justify-between items-center py-4 w-full px-4 lg:px-8">
          {/* Logo AB CAMPUS FINANCE */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
          >
            <Logo size="md" />
          </button>

          {/* Cloche de notification mobile - à droite du logo */}
          <div className="lg:hidden">
            <NotificationBell 
              notifications={notifications}
              onNotificationClick={(notification) => {
                markAsRead(notification.id);
                // Navigation basée sur le type de notification
                if (notification.type === 'payment') {
                  navigate('/repayment');
                } else if (notification.type === 'loan') {
                  navigate('/loan-history');
                }
              }}
            />
          </div>

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
            {/* Cloche de notification desktop - pour tous les utilisateurs */}
            <NotificationBell 
              notifications={notifications}
              onNotificationClick={(notification) => {
                markAsRead(notification.id);
                // Navigation basée sur le type de notification
                if (notification.type === 'payment') {
                  navigate('/repayment');
                } else if (notification.type === 'loan') {
                  navigate('/loan-history');
                }
              }}
            />
            
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
                  {user?.role === 'admin' ? 'Administrateur' : 'Client AB CAMPUS FINANCE'}
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
            className="lg:hidden relative p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-white/90 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col space-y-1.5">
              <span className="w-6 h-0.5 bg-gray-700 rounded-full" />
              <span className="w-6 h-0.5 bg-gray-700 rounded-full" />
              <span className="w-6 h-0.5 bg-gray-700 rounded-full" />
            </div>
          </button>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-accent-200 py-4 w-full overflow-hidden">
            {/* Section Nous contacter - Contenu principal du menu */}
            <div className="px-4 mb-4">
              <h3 className="text-lg font-semibold text-secondary-900 font-montserrat mb-4">
                Nous contacter
              </h3>
            </div>

            {/* Section Nous contacter */}
            <div className="px-4">
                
                <div className="space-y-2">
                  {/* WhatsApp */}
                  <a 
                    href="https://wa.me/22953463606" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-green-50 transition-all duration-200 group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-secondary-900 font-montserrat group-hover:text-green-600 transition-colors">
                        WhatsApp
                      </p>
                      <p className="text-xs text-neutral-600 font-montserrat">
                        +229 53 46 36 06
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-neutral-400 group-hover:text-green-600 transition-colors" />
                  </a>

                  {/* Email */}
                  <a 
                    href="mailto:abpret51@gmail.com" 
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-secondary-900 font-montserrat group-hover:text-blue-600 transition-colors">
                        Email
                      </p>
                      <p className="text-xs text-neutral-600 font-montserrat">
                        abpret51@gmail.com
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-neutral-400 group-hover:text-blue-600 transition-colors" />
                  </a>

                  {/* Facebook */}
                  <a 
                    href="https://www.facebook.com/abpret.2024" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-secondary-900 font-montserrat group-hover:text-blue-600 transition-colors">
                        Facebook
                      </p>
                      <p className="text-xs text-neutral-600 font-montserrat">
                        AB Campus Finance
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-neutral-400 group-hover:text-blue-600 transition-colors" />
                  </a>
                </div>
              </div>
               
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
                     onClick={handleLogout}
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