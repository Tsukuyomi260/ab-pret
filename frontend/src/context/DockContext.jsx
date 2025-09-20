import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import Dock from '../components/UI/Dock';
import { 
  Home,
  FileText,
  Wallet,
  User,
  Users,
  BarChart3,
  Settings,
  CreditCard,
  Grid
} from 'lucide-react';

const DockContext = createContext();

export const useDock = () => {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within a DockProvider');
  }
  return context;
};

export const DockProvider = ({ children }) => {
  const { user } = useAuth();

  // Configuration du dock selon le rôle de l'utilisateur
  const getDockItems = () => {
    if (user?.role === 'admin') {
      return [
        { 
          icon: <Home size={20} />, 
          label: 'Accueil', 
          path: '/admin'
        },
        { 
          icon: <CreditCard size={20} />, 
          label: 'Demandes', 
          path: '/admin/loan-requests'
        },
        { 
          icon: <Users size={20} />, 
          label: 'Utilisateurs', 
          path: '/admin/user-management'
        },
        { 
          icon: <BarChart3 size={20} />, 
          label: 'Analytics', 
          path: '/admin/analytics'
        },
        { 
          icon: <Settings size={20} />, 
          label: 'Paramètres', 
          path: '/admin/settings'
        }
      ];
    } else {
      return [
        { 
          icon: <Home size={20} />, 
          label: 'Accueil', 
          path: '/dashboard'
        },
        { 
          icon: <FileText size={20} />, 
          label: 'Demandes', 
          path: '/loan-request'
        },
        { 
          icon: <Grid size={20} />, 
          label: 'Menu', 
          path: '/menu'
        },
        { 
          icon: <Wallet size={20} />, 
          label: 'Rembourser', 
          path: '/repayment'
        },
        { 
          icon: <User size={20} />, 
          label: 'Profil', 
          path: '/profile'
        }
      ];
    }
  };

  const dockItems = getDockItems();

  return (
    <DockContext.Provider value={{ dockItems }}>
      {children}
      
      {/* Dock global - toujours présent */}
      <Dock 
        items={dockItems}
        panelHeight={80}
        baseItemSize={60}
        magnification={80}
      />
    </DockContext.Provider>
  );
}; 