import React from 'react';
import Header from './Header';
import Footer from './Footer';
import NotificationBell from '../UI/NotificationBell';
import { DockProvider } from '../../context/DockContext';

const Layout = ({ children }) => {
  return (
    <DockProvider>
      <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
        <Header />
        <main className="w-full overflow-x-hidden pb-24">
          {children}
        </main>
        <Footer />
        
        {/* Notification Bell - Présent sur toutes les pages */}
        <div className="fixed top-6 right-6 z-40">
          <NotificationBell />
        </div>
      </div>
    </DockProvider>
  );
};

export default Layout;