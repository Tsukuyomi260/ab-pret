import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Logo from '../UI/Logo';
import { Clock, Mail, Phone, CheckCircle } from 'lucide-react';

const PendingApproval = () => {
  const location = useLocation();
  const user = location.state?.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-large p-8 border border-accent-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo size="xl" showText={true} />
            </div>
            
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock size={32} className="text-yellow-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-secondary-900 font-montserrat mb-2">
              Inscription reçue !
            </h2>
            <p className="text-neutral-600 font-montserrat">
              Votre compte est en attente de validation
            </p>
          </div>

          {/* Informations de l'utilisateur */}
          {user && (
            <div className="bg-accent-50 rounded-xl p-4 mb-6">
              <h3 className="font-medium text-secondary-900 font-montserrat mb-3">
                Vos informations :
              </h3>
              <div className="space-y-2 text-sm text-neutral-600 font-montserrat">
                <p><strong>Nom :</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Filière :</strong> {user.filiere}</p>
                <p><strong>Année :</strong> {user.anneeEtude}</p>
                <p><strong>Entité :</strong> {user.entite}</p>
                <p><strong>Email :</strong> {user.email}</p>
                <p><strong>Téléphone :</strong> {user.phone}</p>
              </div>
            </div>
          )}

          {/* Processus */}
          <div className="space-y-4 mb-6">
            <h3 className="font-medium text-secondary-900 font-montserrat">
              Prochaines étapes :
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle size={16} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-900 font-montserrat">
                    Vérification des documents
                  </p>
                  <p className="text-xs text-neutral-600 font-montserrat">
                    Nous vérifions votre carte étudiant et votre carte d'identité
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle size={16} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-900 font-montserrat">
                    Validation par l'administrateur
                  </p>
                  <p className="text-xs text-neutral-600 font-montserrat">
                    Abel Viakinnou examine votre demande
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock size={16} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-900 font-montserrat">
                    Notification par email
                  </p>
                  <p className="text-xs text-neutral-600 font-montserrat">
                    Vous recevrez un email dès que votre compte sera validé
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Temps estimé */}
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Clock size={20} className="text-primary-600" />
              <span className="text-sm font-medium text-primary-800 font-montserrat">
                Temps de traitement estimé : 24-48 heures
              </span>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center">
            <p className="text-sm text-neutral-600 font-montserrat mb-4">
              Questions ? Contactez-nous :
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-neutral-600 font-montserrat">
              <div className="flex items-center space-x-1">
                <Mail size={16} />
                <span>abpret51@gmail.com</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone size={16} />
                <span>+229 53463606</span>
              </div>
            </div>
          </div>

          {/* Retour à la connexion */}
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-primary-600 hover:text-primary-700 font-medium font-montserrat"
            >
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval; 