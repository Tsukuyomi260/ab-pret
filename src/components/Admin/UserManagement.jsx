import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users
} from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';

const UserManagement = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useNotifications();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Données fictives pour les utilisateurs
  const mockUsers = [
    {
      id: 1,
      firstName: 'Kossi',
      lastName: 'Adama',
      email: 'kossi.adama@student.bj',
      phone: '+229 90123456',
      status: 'active',
      registrationDate: '2023-09-01'
    },
    {
      id: 2,
      firstName: 'Fatou',
      lastName: 'Diallo',
      email: 'fatou.diallo@student.bj',
      phone: '+229 90234567',
      status: 'active',
      registrationDate: '2023-10-15'
    }
  ];

  useEffect(() => {
    // Simulation du chargement des données
    setTimeout(() => {
      setUsers(mockUsers);
        setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-accent-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-50">
      {/* Header */}
      <div className="bg-white shadow-soft border-b border-accent-200">
        <div className="px-4 lg:px-8 py-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <Users size={32} className="text-primary-600" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 font-montserrat">
                Gestion des Utilisateurs
              </h1>
            </div>
            <p className="text-xl lg:text-2xl text-gray-600 font-montserrat leading-relaxed mb-8 max-w-3xl mx-auto">
              Gérez et supervisez tous les utilisateurs de AB PRET
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-lg text-gray-600">Liste des utilisateurs</p>
          <p className="text-sm text-gray-500 mt-2">Total: {users.length} utilisateurs</p>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;