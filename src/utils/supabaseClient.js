import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bumugimkpllutxxfujvf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bXVnaW1rcGxsdXR4eGZ1anZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NDMzMDUsImV4cCI6MjA2ODUxOTMwNX0.7af19dPXwTeJbEmUcgPEwNwtq98VLzgJNJsWu7bv01M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction pour écouter les nouvelles inscriptions en temps réel
export const subscribeToNewUsers = (callback) => {
  return supabase
    .channel('users')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'users' 
      }, 
      (payload) => {
        console.log('Nouvelle inscription détectée:', payload.new);
        callback(payload.new);
      }
    )
    .subscribe((status) => {
      console.log('Status de la subscription:', status);
    });
};

// Fonction pour enregistrer un nouvel utilisateur
export const registerUser = async (userData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();

    if (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      throw error;
    }

    console.log('Utilisateur enregistré avec succès:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    return { success: false, error };
  }
};

// Fonction pour récupérer tous les utilisateurs
export const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return { success: false, error };
  }
};

// Fonction pour récupérer les données de prêts (simulation pour l'instant)
export const getLoans = async () => {
  try {
    // Simulation des données de prêts (à remplacer par de vraies données Supabase)
    const mockLoans = [
      { id: 1, amount: 75000, status: 'active', date: '2025-01-15', user_id: 'user1', user_name: 'Kossi Ablo' },
      { id: 2, amount: 120000, status: 'active', date: '2025-01-14', user_id: 'user2', user_name: 'Fatou Diallo' },
      { id: 3, amount: 50000, status: 'repaid', date: '2025-01-13', user_id: 'user3', user_name: 'Moussa Traoré' },
      { id: 4, amount: 90000, status: 'active', date: '2025-01-12', user_id: 'user4', user_name: 'Aminata Keita' },
      { id: 5, amount: 60000, status: 'pending', date: '2025-01-11', user_id: 'user5', user_name: 'Souleymane Ouattara' }
    ];

    return { success: true, data: mockLoans };
  } catch (error) {
    console.error('Erreur lors de la récupération des prêts:', error);
    return { success: false, error };
  }
};

// Fonction pour récupérer les statistiques d'analytics
export const getAnalyticsData = async () => {
  try {
    // Récupérer les utilisateurs
    const usersResult = await getUsers();
    const loansResult = await getLoans();
    
    if (!usersResult.success || !loansResult.success) {
      throw new Error('Erreur lors de la récupération des données');
    }

    const users = usersResult.data;
    const loans = loansResult.data;

    // Calculer les statistiques
    const totalLoans = loans.length;
    const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const activeLoans = loans.filter(loan => loan.status === 'active').length;
    const totalUsers = users.length;
    const pendingUsers = users.filter(user => user.status === 'pending').length;
    const approvedUsers = users.filter(user => user.status === 'approved').length;
    const rejectedUsers = users.filter(user => user.status === 'rejected').length;

    // Calculer les tendances (simulation)
    const monthlyGrowth = 12.5;
    const loanGrowth = 8.3;
    const userGrowth = 15.7;

    // Top performeurs
    const userLoanCounts = {};
    loans.forEach(loan => {
      if (!userLoanCounts[loan.user_id]) {
        userLoanCounts[loan.user_id] = {
          name: loan.user_name,
          loans: 0,
          totalAmount: 0
        };
      }
      userLoanCounts[loan.user_id].loans++;
      userLoanCounts[loan.user_id].totalAmount += loan.amount;
    });

    const topPerformers = Object.values(userLoanCounts)
      .map(user => ({
        ...user,
        avgAmount: user.totalAmount / user.loans
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 3);

    // Activité récente
    const recentActivity = [
      { type: 'loan_approved', user: 'Kossi Ablo', amount: 75000, date: '2025-01-15' },
      { type: 'user_registered', user: 'Fatou Diallo', date: '2025-01-14' },
      { type: 'loan_repaid', user: 'Moussa Traoré', amount: 50000, date: '2025-01-13' },
      { type: 'loan_requested', user: 'Souleymane Ouattara', amount: 60000, date: '2025-01-11' }
    ];

    return {
      success: true,
      data: {
        overview: {
          totalLoans,
          totalAmount,
          activeLoans,
          totalUsers,
          pendingUsers,
          approvedUsers,
          rejectedUsers
        },
        trends: {
          monthlyGrowth,
          loanGrowth,
          userGrowth
        },
        topPerformers,
        recentActivity
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des analytics:', error);
    return { success: false, error };
  }
};