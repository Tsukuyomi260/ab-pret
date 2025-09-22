import React from 'react';
import { Facebook, ExternalLink } from 'lucide-react';
import WhatsAppIcon from '../UI/WhatsAppIcon';
import GmailIcon from '../UI/GmailIcon';

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

  const handleFacebookClick = () => {
    // Ouvrir la page Facebook d'AB CAMPUS FINANCE
    const facebookUrl = 'https://www.facebook.com/abpret.2024';
    window.open(facebookUrl, '_blank');
  };

  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-accent-200">
      <div className="max-w-7xl mx-auto px-4 pt-2 pb-4">
        {/* Version mobile compacte */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold text-sm">AB</span>
              </div>
              <div>
                <p className="text-xs font-medium text-secondary-900 font-montserrat">AB CAMPUS FINANCE</p>
                <p className="text-xs text-neutral-600 font-montserrat">Cotonou, Bénin</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEmailClick}
                className="p-2 bg-red-100 rounded-full hover:bg-red-200 transition-colors duration-200"
                title="Envoyer un email"
              >
                <GmailIcon size={14} className="text-red-600" />
              </button>
              
              <button
                onClick={handleWhatsAppClick}
                className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition-colors duration-200"
                title="Contacter sur WhatsApp"
              >
                <WhatsAppIcon size={14} className="text-green-600" />
              </button>
              
              <button
                onClick={handleFacebookClick}
                className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors duration-200"
                title="Suivre sur Facebook"
              >
                <Facebook size={14} className="text-blue-600" />
              </button>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-accent-200">
            <div className="flex items-center justify-between text-xs text-neutral-600 font-montserrat">
              <span>&copy; 2025 AB CAMPUS FINANCE</span>
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
                  <p className="font-semibold text-secondary-900 font-montserrat">AB CAMPUS FINANCE</p>
                  <p className="text-sm text-neutral-600 font-montserrat">Votre succès, notre mission</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <button
                  onClick={handleEmailClick}
                  className="flex items-center space-x-2 text-neutral-600 hover:text-red-600 transition-colors duration-200 font-montserrat"
                >
                  <GmailIcon size={16} />
                  <span>abpret51@gmail.com</span>
                  <ExternalLink size={12} />
                </button>
                
                <button
                  onClick={handleWhatsAppClick}
                  className="flex items-center space-x-2 text-neutral-600 hover:text-green-600 transition-colors duration-200 font-montserrat"
                >
                  <WhatsAppIcon size={16} />
                  <span>+229 53463606</span>
                  <ExternalLink size={12} />
                </button>
                
                <button
                  onClick={handleFacebookClick}
                  className="flex items-center space-x-2 text-neutral-600 hover:text-blue-600 transition-colors duration-200 font-montserrat"
                >
                  <Facebook size={16} />
                  <span>Suivre sur Facebook</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
            
            <div className="text-sm text-neutral-600 font-montserrat">
              &copy; 2025 AB CAMPUS FINANCE. Tous droits réservés.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;