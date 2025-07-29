import React from 'react';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const Footer = () => {
  const handleEmailClick = () => {
    window.open('mailto:abpret51@gmail.com', '_blank');
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = '+22953463606';
    const message = 'Bonjour, je souhaite avoir plus d\'informations sur vos services de prêt.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleLocationClick = () => {
    // Ouvrir Google Maps pour Cotonou, Bénin
    const location = 'Cotonou, Bénin';
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(location)}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-accent-200 mt-8">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Version mobile compacte */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold text-sm">AB</span>
              </div>
              <div>
                <p className="text-xs font-medium text-secondary-900 font-montserrat">AB PRET</p>
                <p className="text-xs text-neutral-600 font-montserrat">Cotonou, Bénin</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEmailClick}
                className="p-2 bg-accent-100 rounded-full hover:bg-accent-200 transition-colors duration-200"
                title="Envoyer un email"
              >
                <Mail size={14} className="text-secondary-600" />
              </button>
              
              <button
                onClick={handleWhatsAppClick}
                className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition-colors duration-200"
                title="Contacter sur WhatsApp"
              >
                <Phone size={14} className="text-green-600" />
              </button>
              
              <button
                onClick={handleLocationClick}
                className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors duration-200"
                title="Voir sur la carte"
              >
                <MapPin size={14} className="text-blue-600" />
              </button>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-accent-200">
            <div className="flex items-center justify-between text-xs text-neutral-600 font-montserrat">
              <span>&copy; 2025 AB PRET</span>
              <span className="text-primary-600">Votre succès, notre mission</span>
            </div>
          </div>
        </div>

        {/* Version desktop */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold">AB</span>
                </div>
                <div>
                  <p className="font-semibold text-secondary-900 font-montserrat">AB PRET</p>
                  <p className="text-sm text-neutral-600 font-montserrat">Votre succès, notre mission</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <button
                  onClick={handleEmailClick}
                  className="flex items-center space-x-2 text-neutral-600 hover:text-primary-600 transition-colors duration-200 font-montserrat"
                >
                  <Mail size={16} />
                  <span>abpret51@gmail.com</span>
                  <ExternalLink size={12} />
                </button>
                
                <button
                  onClick={handleWhatsAppClick}
                  className="flex items-center space-x-2 text-neutral-600 hover:text-green-600 transition-colors duration-200 font-montserrat"
                >
                  <Phone size={16} />
                  <span>+229 53463606</span>
                  <ExternalLink size={12} />
                </button>
                
                <button
                  onClick={handleLocationClick}
                  className="flex items-center space-x-2 text-neutral-600 hover:text-blue-600 transition-colors duration-200 font-montserrat"
                >
                  <MapPin size={16} />
                  <span>Cotonou, Bénin</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
            
            <div className="text-sm text-neutral-600 font-montserrat">
              &copy; 2025 AB PRET. Tous droits réservés.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;