import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-primary-600 mb-4">AB Prêt</h3>
            <p className="text-gray-600 text-sm">
              Votre partenaire de confiance pour des prêts rapides et sécurisés au Bénin.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Prêts personnels</li>
              <li>Remboursement facile</li>
              <li>Support client</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Paiements</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>MTN Mobile Money</li>
              <li>Moov Money</li>
              <li>Transferts sécurisés</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Email: support@abpret.bj</li>
              <li>Tél: +229 XX XX XX XX</li>
              <li>Cotonou, Bénin</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; 2025 AB Prêt. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;