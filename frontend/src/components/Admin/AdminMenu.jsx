import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PiggyBank, CreditCard, ArrowRight } from 'lucide-react';

const AdminMenu = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'ab-epargne',
      title: 'AB Epargne',
      description: 'Gestion des comptes d\'épargne et des plans',
      icon: PiggyBank,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      path: '/admin/ab-epargne'
    },
    {
      id: 'ab-pret',
      title: 'AB Pret',
      description: 'Gestion des demandes de prêts et remboursements',
      icon: CreditCard,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      path: '/admin/loan-requests'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 font-montserrat">
              Menu Admin
            </h1>
            <p className="text-gray-600 font-montserrat mt-2">
              Sélectionnez une section pour gérer
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100 overflow-hidden"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative">
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-2xl ${item.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon size={40} className={item.iconColor} />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 font-montserrat mb-3">
                  {item.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 font-montserrat mb-6">
                  {item.description}
                </p>

                {/* Arrow */}
                <div className="flex items-center text-primary-600 font-semibold font-montserrat group-hover:translate-x-2 transition-transform duration-300">
                  <span>Accéder</span>
                  <ArrowRight size={20} className="ml-2" />
                </div>
              </div>

              {/* Decorative Circle */}
              <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-gradient-to-br ${item.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminMenu;

