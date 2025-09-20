import React from 'react';
import Header from './Header';
import Footer from './Footer';
import NotificationBell from '../UI/NotificationBell';
import { DockProvider } from '../../context/DockContext';

const Layout = ({ children }) => {
  return (
    <DockProvider>
      <div className="bg-gray-50 w-full overflow-x-hidden">
        <Header />
        <main className="w-full overflow-x-hidden pt-20">
          {children}
        </main>
        <Footer />
        
        {/* Notification Bell - Présent sur toutes les pages */}
      </div>
    </DockProvider>
  );
};

export default Layout;