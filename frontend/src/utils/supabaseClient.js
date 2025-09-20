import { createClient } from '@supabase/supabase-js';

// ⚠️ SÉCURITÉ DES LOGS ⚠️
// NE JAMAIS logger de données sensibles :
// - Mots de passe
// - Tokens d'authentification
// - Informations personnelles (email, téléphone, etc.)
// - Données financières
// - Objets d'erreur complets (utiliser error.message seulement)

// Configuration sécurisée via variables d'environnement
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Vérification de sécurité avec fallback pour le développement
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[SUPABASE] Configuration manquante:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    environment: process.env.NODE_ENV
  });
  
  // En développement, on peut utiliser des valeurs par défaut ou afficher un message
  if (process.env.NODE_ENV === 'development') {
    console.warn('[SUPABASE] Mode développement - configuration manquante');
  }
  
  // En production, on ne plante pas l'app mais on affiche un message d'erreur
  if (process.env.NODE_ENV === 'production') {
    console.error('[SUPABASE] Configuration manquante en production - vérifiez Vercel');
  }
}

// Créer le client Supabase seulement si les variables sont disponibles
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Fonction de test de connexion Supabase
export const testSupabaseConnection = async () => {
  if (!supabase) {
    console.error('[SUPABASE] Client non initialisé - configuration manquante');
    return { success: false, error: 'Configuration Supabase manquante' };
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('[SUPABASE] Erreur de connexion:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('[SUPABASE] Connexion réussie');
    return { success: true };
  } catch (error) {
    console.error('[SUPABASE] Erreur de connexion:', error.message);
    return { success: false, error: error.message };
  }
};

// Fonction pour écouter les nouvelles inscriptions en temps réel
export const subscribeToNewUsers = (callback) => {
  if (!supabase) {
    console.error('[SUPABASE] Client non initialisé - configuration manquante');
    return null;
  }

  return supabase
    .channel('users')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'users' 
      }, 
      (payload) => {
        // Log sécurisé - ne pas afficher les données utilisateur
        console.log('[SUPABASE] Nouvelle inscription détectée');
        callback(payload.new);
      }
    )
    .subscribe((status) => {
      console.log('[SUPABASE] Status de la subscription:', status);
    });
};

// Fonction pour enregistrer un nouvel utilisateur
export const registerUser = async (userData) => {
  if (!supabase) {
    console.error('[SUPABASE] Client non initialisé - configuration manquante');
    return { success: false, error: 'Configuration Supabase manquante' };
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();

    if (error) {
      console.error('[SUPABASE] Erreur lors de l\'enregistrement:', error.message);
      throw error;
    }

    console.log('[SUPABASE] Utilisateur enregistré avec succès');
    return { success: true, data };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de l\'enregistrement:', error.message);
    return { success: false, error };
  }
};

// Fonction pour récupérer tous les utilisateurs
export const getUsers = async () => {
  if (!supabase) {
    console.error('[SUPABASE] Client non initialisé - configuration manquante');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SUPABASE] Erreur lors de la récupération des utilisateurs:', error.message);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la récupération des utilisateurs:', error.message);
    return { success: false, error };
  }
};

// Fonction pour récupérer les données de prêts depuis Supabase
export const getLoans = async () => {
  if (!supabase) {
    console.error('[SUPABASE] Client non initialisé - configuration manquante');
    return { success: true, data: [] };
  }

  try {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        users!inner(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SUPABASE] Erreur lors de la récupération des prêts:', error.message);
      throw error;
    }

    // Transformer les données pour correspondre au format attendu
    const formattedLoans = data.map(loan => ({
      id: loan.id,
      amount: loan.amount,
      status: loan.status,
      date: loan.created_at,
      user_id: loan.user_id,
      user_name: `${loan.users.first_name} ${loan.users.last_name}`,
      user_email: loan.users.email,
      loan_type: loan.loan_type,
      duration: loan.duration,
      interest_rate: loan.interest_rate,
      monthly_payment: loan.monthly_payment
    }));

    return { success: true, data: formattedLoans };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la récupération des prêts:', error.message);
    return { success: false, error };
  }
};

// Fonction pour récupérer les statistiques d'analytics
export const getAnalyticsData = async () => {
  if (!supabase) {
    console.error('[SUPABASE] Client non initialisé - configuration manquante');
    return {
      totalLoans: 0,
      totalAmount: 0,
      activeLoans: 0,
      totalUsers: 0,
      pendingUsers: 0,
      approvedUsers: 0,
      rejectedUsers: 0,
      monthlyGrowth: 0,
      loanGrowth: 0,
      userGrowth: 0,
      recentActivity: []
    };
  }

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

    // Calculer les tendances basées sur les vraies données
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const recentLoans = loans.filter(loan => new Date(loan.date) >= lastMonth);
    const recentUsers = users.filter(user => new Date(user.created_at) >= lastMonth);
    
    const monthlyGrowth = users.length > 0 ? ((recentUsers.length / users.length) * 100).toFixed(1) : 0;
    const loanGrowth = loans.length > 0 ? ((recentLoans.length / loans.length) * 100).toFixed(1) : 0;
    const userGrowth = users.length > 0 ? ((recentUsers.length / users.length) * 100).toFixed(1) : 0;

    // Top performeurs basés sur les vraies données
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

    // Activité récente basée sur les vraies données
    const recentActivity = [];
    
    // Ajouter les prêts récents
    loans.slice(0, 5).forEach(loan => {
      recentActivity.push({
        type: loan.status === 'active' ? 'loan_approved' : 
              loan.status === 'repaid' ? 'loan_repaid' : 'loan_requested',
        user: loan.user_name,
        amount: loan.amount,
        date: loan.date
      });
    });
    
    // Ajouter les utilisateurs récents
    users.slice(0, 3).forEach(user => {
      recentActivity.push({
        type: 'user_registered',
        user: `${user.first_name} ${user.last_name}`,
        date: user.created_at
      });
    });
    
    // Trier par date
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

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
    console.error('[SUPABASE] Erreur lors de la récupération des analytics:', error.message);
    return { success: false, error };
  }
};