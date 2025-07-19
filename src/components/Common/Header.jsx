import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell, Menu, X } from 'lucide-react';
import Logo from '../UI/Logo';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-soft border-b border-accent-200 w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center py-4 w-full">
          {/* Logo CAMPUS FINANCE */}
          <Logo size="md" />

          {/* Navigation desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            <a href="/dashboard" className="text-neutral-600 hover:text-secondary-900 font-montserrat transition-colors duration-200">
              Accueil
            </a>
            <a href="/loan-request" className="text-neutral-600 hover:text-secondary-900 font-montserrat transition-colors duration-200">
              Demander un prêt
            </a>
            <a href="/loan-history" className="text-neutral-600 hover:text-secondary-900 font-montserrat transition-colors duration-200">
              Historique
            </a>
            <a href="/repayment" className="text-neutral-600 hover:text-secondary-900 font-montserrat transition-colors duration-200">
              Remboursement
            </a>
          </nav>

          {/* Actions utilisateur desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            <button className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors duration-200">
              <Bell size={20} />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-primary-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-secondary-900 font-montserrat">
                  {user?.firstName} {user?.lastName}
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
                      {user?.firstName} {user?.lastName}
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