import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Mail, Phone, ArrowLeft } from 'lucide-react';
import Logo from '../UI/Logo';
import Button from '../UI/Button';

const PendingApproval = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-4" />
        </div>

        {/* Card principale */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Icône de succès */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Inscription réussie !
            </h1>
            <p className="text-gray-600">
              Votre compte a été créé avec succès
            </p>
          </div>

          {/* Statut en attente */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">
                  En attente d'approbation
                </h3>
                <p className="text-sm text-yellow-700">
                  Votre compte sera activé sous 24-48h
                </p>
              </div>
            </div>
          </div>

          {/* Prochaines étapes */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Prochaines étapes :
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary-600">1</span>
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>Vérification des documents</strong> - Nous vérifions vos informations
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary-600">2</span>
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>Notification par SMS/Email</strong> - Vous recevrez une confirmation
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary-600">3</span>
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>Accès à votre compte</strong> - Vous pourrez vous connecter
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Besoin d'aide ?
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">+229 90 00 00 00</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">support@abpret.com</span>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full"
              variant="primary"
            >
              Retour à l'accueil
            </Button>
            
            <Link to="/login">
              <Button
                className="w-full"
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Aller à la connexion
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2025 AB CAMPUS FINANCE. Tous droits réservés.
          </p>
          <p className="text-sm text-primary-600 font-semibold mt-1">
            Made in Bénin 🇧🇯
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PendingApproval; 