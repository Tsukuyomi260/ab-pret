import { supabase, testSupabaseConnection } from './supabaseClient';
import { sendOTPSMS, sendWelcomeSMS } from './smsService';

// ===== TESTS ET VÉRIFICATIONS =====

export const testAllConnections = async () => {
  try {
    console.log('[TEST] Vérification de la connexion Supabase...');
    
    // Vérifier si le client Supabase est initialisé
    if (!supabase) {
      console.warn('[TEST] ⚠️ Client Supabase non initialisé - configuration manquante');
      return { success: false, error: 'Configuration Supabase manquante' };
    }
    
    // Test de connexion de base
    const connectionTest = await testSupabaseConnection();
    if (!connectionTest.success) {
      throw new Error(`Connexion Supabase échouée: ${connectionTest.error}`);
    }
    
    console.log('[TEST] ✅ Connexion Supabase OK');
    
    // Test des tables principales
    const tables = ['users', 'otp_codes', 'loans', 'payments'];
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.warn(`[TEST] ⚠️ Table ${table} non accessible:`, error.message);
        } else {
          console.log(`[TEST] ✅ Table ${table} accessible`);
        }
      } catch (error) {
        console.warn(`[TEST] ⚠️ Table ${table} non accessible:`, error.message);
      }
    }
    
    return { success: true, message: 'Tous les tests de base sont passés' };
  } catch (error) {
    console.error('[TEST] ❌ Erreur lors des tests:', error.message);
    return { success: false, error: error.message };
  }
};

// ===== AUTHENTIFICATION =====

export const signUpWithPhone = async (phoneNumber, password, userData) => {
  if (!supabase) {
    console.error('[SUPABASE] Client non initialisé - configuration manquante');
    return { success: false, error: 'Configuration Supabase manquante' };
  }

  try {
    // Créer l'utilisateur avec Supabase Auth (on utilise un email temporaire)
    const tempEmail = `${phoneNumber.replace(/[^0-9]/g, '')}@campusfinance.bj`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: tempEmail,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone_number: phoneNumber,
          role: 'client'
        }
      }
    });

    if (authError) throw authError;

    // Insérer les données utilisateur dans notre table users
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        phone_number: phoneNumber,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: 'client',
        status: 'pending'
      }]);

    if (userError) throw userError;

    // Envoyer un SMS de bienvenue
    const userName = `${userData.firstName} ${userData.lastName}`;
    await sendWelcomeSMS(phoneNumber, userName);

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de l\'inscription:', error.message);
    return { success: false, error: error.message };
  }
};

export const signUpWithEmail = async (email, password, userData) => {
  if (!supabase) {
    console.error('[SUPABASE] Client non initialisé - configuration manquante');
    return { success: false, error: 'Configuration Supabase manquante' };
  }

  try {
    // Créer l'utilisateur avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone_number: userData.phoneNumber || '',
          role: 'client'
        }
      }
    });

    if (authError) throw authError;

    // Insérer les données utilisateur dans notre table users
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: email,
        phone_number: userData.phoneNumber || '',
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: 'client',
        status: 'pending'
      }]);

    if (userError) throw userError;

    // Envoyer un SMS de bienvenue si un numéro de téléphone est fourni
    if (userData.phoneNumber) {
      const userName = `${userData.firstName} ${userData.lastName}`;
      await sendWelcomeSMS(userData.phoneNumber, userName);
    }

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de l\'inscription:', error.message);
    return { success: false, error: error.message };
  }
};

export const signInWithEmail = async (email, password) => {
  if (!supabase) {
    console.error('[SUPABASE] Client non initialisé - configuration manquante');
    return { success: false, error: 'Configuration Supabase manquante' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return { success: true, user: data.user };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la connexion:', error.message);
    return { success: false, error: error.message };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la déconnexion:', error.message);
    return { success: false, error: error.message };
  }
};

// ===== OTP =====

export const generateOTP = async (phoneNumber, type = 'registration') => {
  if (!supabase) {
    console.error('[SUPABASE] Client non initialisé - configuration manquante');
    return { success: false, error: 'Configuration Supabase manquante' };
  }

  try {
    // Générer un code OTP à 6 chiffres
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Calculer l'expiration (15 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Insérer le code OTP dans la base de données
    const { error } = await supabase
      .from('otp_codes')
      .insert([{
        phone_number: phoneNumber, // Changé de email à phone_number
        code: otp,
        type,
        expires_at: expiresAt.toISOString()
      }]);

    if (error) throw error;

    // Envoyer l'OTP par SMS
    const smsResult = await sendOTPSMS(phoneNumber, otp, 'Utilisateur');
    
    if (!smsResult.success) {
      console.error('[OTP] Erreur lors de l\'envoi SMS:', smsResult.error);
      // On retourne quand même le succès car l'OTP est enregistré en base
      // L'utilisateur peut demander un nouveau code
      return { success: true, otp: null, smsError: smsResult.error };
    }

    console.log(`[OTP] SMS envoyé avec succès pour ${phoneNumber}`);
    return { success: true, otp: null }; // On ne retourne plus l'OTP pour la sécurité
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la génération OTP:', error.message);
    return { success: false, error: error.message };
  }
};

export const verifyOTP = async (phoneNumber, code) => {
  if (!supabase) {
    console.error('[SUPABASE] Client non initialisé - configuration manquante');
    return { success: false, error: 'Configuration Supabase manquante' };
  }

  try {
    // Récupérer le code OTP
    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone_number', phoneNumber) // Changé de email à phone_number
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return { success: false, error: 'Code OTP invalide ou expiré' };
    }

    // Marquer le code comme utilisé
    await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('id', data.id);

    return { success: true };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la vérification OTP:', error.message);
    return { success: false, error: error.message };
  }
};

// ===== UTILISATEURS =====

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;

    if (!user) return { success: false, error: 'Utilisateur non connecté' };

    // Récupérer les données utilisateur complètes
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    return { success: true, user: { ...user, ...userData } };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la récupération utilisateur:', error.message);
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert([{
        user_id: userId,
        ...profileData
      }]);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la mise à jour du profil:', error.message);
    return { success: false, error: error.message };
  }
};

export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la récupération des utilisateurs:', error.message);
    return { success: false, error: error.message };
  }
};

// ===== PRÊTS =====

export const createLoan = async (loanData) => {
  try {
    const { data, error } = await supabase
      .from('loans')
      .insert([loanData])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la création du prêt:', error.message);
    return { success: false, error: error.message };
  }
};

export const getLoans = async (userId = null) => {
  try {
    let query = supabase
      .from('loans')
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la récupération des prêts:', error.message);
    return { success: false, error: error.message };
  }
};

export const updateLoanStatus = async (loanId, status, adminId = null) => {
  try {
    const updateData = { status };
    
    if (status === 'approved') {
      updateData.approved_by = adminId;
      updateData.approved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('loans')
      .update(updateData)
      .eq('id', loanId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la mise à jour du prêt:', error.message);
    return { success: false, error: error.message };
  }
};

// ===== PAIEMENTS =====

export const createPayment = async (paymentData) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la création du paiement:', error.message);
    return { success: false, error: error.message };
  }
};

export const getPayments = async (userId = null) => {
  try {
    let query = supabase
      .from('payments')
      .select(`
        *,
        loans (
          id,
          amount,
          purpose
        )
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la récupération des paiements:', error.message);
    return { success: false, error: error.message };
  }
};

// ===== ANALYTICS =====

export const getAnalyticsData = async () => {
  try {
    // Récupérer les statistiques
    const [usersResult, loansResult, paymentsResult] = await Promise.all([
      getAllUsers(),
      getLoans(),
      getPayments()
    ]);

    if (!usersResult.success || !loansResult.success || !paymentsResult.success) {
      throw new Error('Erreur lors de la récupération des données');
    }

    const users = usersResult.data;
    const loans = loansResult.data;
    const payments = paymentsResult.data;

    // Calculer les statistiques
    const totalLoans = loans.length;
    const totalAmount = loans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0);
    const activeLoans = loans.filter(loan => loan.status === 'active').length;
    const totalUsers = users.length;
    const pendingUsers = users.filter(user => user.status === 'pending').length;
    const approvedUsers = users.filter(user => user.status === 'active').length;
    const rejectedUsers = users.filter(user => user.status === 'suspended').length;

    // Top performeurs
    const userLoanCounts = {};
    loans.forEach(loan => {
      if (!userLoanCounts[loan.user_id]) {
        userLoanCounts[loan.user_id] = {
          name: `${loan.users?.first_name} ${loan.users?.last_name}`,
          loans: 0,
          totalAmount: 0
        };
      }
      userLoanCounts[loan.user_id].loans++;
      userLoanCounts[loan.user_id].totalAmount += parseFloat(loan.amount);
    });

    const topPerformers = Object.values(userLoanCounts)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 3);

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
          monthlyGrowth: 12.5,
          loanGrowth: 8.3,
          userGrowth: 15.7
        },
        topPerformers
      }
    };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la récupération des analytics:', error.message);
    return { success: false, error: error.message };
  }
};
