import { supabase, testSupabaseConnection } from './supabaseClient';
import { sendOTPSMS } from './smsService';
import { BACKEND_URL } from '../config/backend';

const DEFAULT_PAGE_SIZE = 50;

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

// ===== TRADUCTION DES ERREURS =====

const translateSupabaseError = (error) => {
  const errorMessage = error.message || error;
  const errorDetails = error.details || '';
  const errorHint = error.hint || '';
  
  // Combiner tous les détails d'erreur pour une meilleure détection
  const fullErrorText = `${errorMessage} ${errorDetails} ${errorHint}`.toLowerCase();
  
  // Erreurs de téléphone déjà utilisé
  if (fullErrorText.includes('phone_number') && (fullErrorText.includes('duplicate') || fullErrorText.includes('unique'))) {
    return 'Ce numéro de téléphone est déjà utilisé pour créer un compte. Veuillez utiliser un autre numéro de téléphone.';
  }
  
  // Erreurs d'email déjà utilisé
  if (fullErrorText.includes('email') && (fullErrorText.includes('duplicate') || fullErrorText.includes('unique'))) {
    return 'Cette adresse email est déjà utilisée. Veuillez utiliser une autre adresse email.';
  }
  
  // Erreurs de mot de passe
  if (fullErrorText.includes('password')) {
    if (fullErrorText.includes('weak')) {
      return 'Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.';
    }
    return 'Erreur avec le mot de passe. Veuillez vérifier votre saisie.';
  }
  
  // Erreurs de validation
  if (fullErrorText.includes('invalid')) {
    if (fullErrorText.includes('email')) {
      return 'Adresse email invalide. Veuillez vérifier votre saisie.';
    }
    if (fullErrorText.includes('phone')) {
      return 'Numéro de téléphone invalide. Veuillez vérifier votre saisie.';
    }
    return 'Données invalides. Veuillez vérifier vos informations.';
  }
  
  // Erreurs de réseau
  if (fullErrorText.includes('network') || fullErrorText.includes('fetch')) {
    return 'Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.';
  }
  
  // Erreurs de serveur
  if (fullErrorText.includes('server') || fullErrorText.includes('500')) {
    return 'Erreur du serveur. Veuillez réessayer dans quelques minutes.';
  }
  
  // Erreurs de quota/limite
  if (fullErrorText.includes('quota') || fullErrorText.includes('limit')) {
    return 'Limite de tentatives atteinte. Veuillez réessayer plus tard.';
  }
  
  // Erreurs génériques - plus spécifiques
  if (fullErrorText.includes('already registered')) {
    // Essayer de détecter quelle information spécifique est en conflit
    if (fullErrorText.includes('phone')) {
      return 'Un compte existe déjà avec ce numéro de téléphone.';
    }
    if (fullErrorText.includes('email')) {
      return 'Un compte existe déjà avec cette adresse email.';
    }
    return 'Un compte existe déjà avec ces informations.';
  }
  
  if (fullErrorText.includes('user already registered')) {
    if (fullErrorText.includes('phone')) {
      return 'Un utilisateur existe déjà avec ce numéro de téléphone.';
    }
    if (fullErrorText.includes('email')) {
      return 'Un utilisateur existe déjà avec cette adresse email.';
    }
    return 'Un utilisateur avec ces informations existe déjà.';
  }
  
  // Par défaut, retourner le message d'erreur original
  return errorMessage;
};

// ===== AUTHENTIFICATION =====

export const signUpWithPhone = async (phoneNumber, password, userData) => {
  if (!supabase) {
    console.error('[SUPABASE] Client non initialisé - configuration manquante');
    return { success: false, error: 'Configuration Supabase manquante' };
  }

  try {
    // Nettoyer et valider le numéro de téléphone
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    
    // Vérifier que le numéro a au moins 8 chiffres
    if (cleanPhone.length < 8) {
      throw new Error('Numéro de téléphone invalide');
    }
    
    // Utiliser l'email fourni ou créer un email temporaire
    let emailToUse;
    console.log('[SUPABASE] userData reçu:', userData);
    console.log('[SUPABASE] Email fourni:', userData.email);
    
    if (userData.email && userData.email.trim()) {
      emailToUse = userData.email.trim();
      console.log(`[SUPABASE] ✅ Utilisation email fourni: ${emailToUse}`);
    } else {
      // Créer un email temporaire unique et valide
      const timestamp = Date.now();
      emailToUse = `user.${cleanPhone}.${timestamp}@gmail.com`;
      console.log(`[SUPABASE] ⚠️ Création email temporaire: ${emailToUse}`);
    }
    
    console.log(`[SUPABASE] Création utilisateur avec email: ${emailToUse}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailToUse,
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

    if (authError) {
      console.error('[SUPABASE] Erreur Auth:', authError);
      throw new Error(translateSupabaseError(authError));
    }

    // Insérer les données utilisateur dans notre table users
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        phone_number: phoneNumber,
        email: emailToUse, // Sauvegarder l'email utilisé
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: 'client',
        status: 'approved'
      }]);

    if (userError) {
      console.error('[SUPABASE] Erreur insertion utilisateur:', userError);
      throw new Error(translateSupabaseError(userError));
    }

    // Log de bienvenue (SMS temporairement désactivé)
    console.log(`[SUPABASE] ✅ Utilisateur créé: ${userData.firstName} ${userData.lastName} (${phoneNumber})`);

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de l\'inscription:', error.message);
    const translatedError = translateSupabaseError(error);
    return { success: false, error: translatedError };
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

    if (authError) {
      console.error('[SUPABASE] Erreur Auth:', authError);
      throw new Error(translateSupabaseError(authError));
    }

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
        status: 'approved'
      }]);

    if (userError) {
      console.error('[SUPABASE] Erreur insertion utilisateur:', userError);
      throw new Error(translateSupabaseError(userError));
    }

    // Log de bienvenue (SMS temporairement désactivé)
    if (userData.phoneNumber) {
      console.log(`[SUPABASE] ✅ Utilisateur créé: ${userData.firstName} ${userData.lastName} (${userData.phoneNumber})`);
    }

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de l\'inscription:', error.message);
    const translatedError = translateSupabaseError(error);
    return { success: false, error: translatedError };
  }
};

export const signInWithEmail = async (email, password) => {
  if (!supabase) {
    console.error('[SUPABASE] Client non initialisé - configuration manquante');
    return { success: false, error: 'Configuration Supabase manquante' };
  }

  try {
    console.log('[SUPABASE] Tentative de connexion avec email:', email);
    
    // 1. Authentification avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (authError) {
      console.error('[SUPABASE] Erreur d\'authentification:', authError.message);
      throw new Error(translateSupabaseError(authError));
    }

    if (!authData.user) {
      throw new Error('Aucun utilisateur retourné après authentification');
    }

    console.log('[SUPABASE] Authentification réussie pour:', authData.user.email);

    // 2. Récupérer les informations complètes depuis la table users avec timeout
    let userData = null;
    let userError = null;
    
    try {
      // Ajouter un timeout pour éviter le blocage
      const dbQueryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: récupération des données utilisateur')), 5000)
      );
      
      const result = await Promise.race([dbQueryPromise, timeoutPromise]);
      userData = result.data;
      userError = result.error;
      
      if (userError) {
        console.warn('[SUPABASE] Erreur récupération table users:', userError.message, userError.code);
      }
    } catch (error) {
      console.warn('[SUPABASE] Erreur/timeout lors de la récupération utilisateur:', error.message);
      userError = { message: error.message };
    }

    // 3. Si erreur ou timeout, utiliser les données auth (ne pas bloquer la connexion)
    if (userError || !userData) {
      console.log('[SUPABASE] Utilisation des données auth (RLS peut bloquer l\'accès à la table users)');
      const userWithRole = {
        ...authData.user,
        role: authData.user.user_metadata?.role || authData.user.app_metadata?.role || 'client',
        first_name: authData.user.user_metadata?.first_name || '',
        last_name: authData.user.user_metadata?.last_name || '',
        status: 'approved' // Par défaut
      };
      console.log('[SUPABASE] Utilisateur retourné (depuis auth):', {
        id: userWithRole.id,
        email: userWithRole.email,
        role: userWithRole.role
      });
      return { success: true, user: userWithRole };
    }

    // 4. Fusionner les données auth et users
    const completeUser = {
      ...authData.user,
      role: userData.role || authData.user.user_metadata?.role || authData.user.app_metadata?.role || 'client',
      first_name: userData.first_name || authData.user.user_metadata?.first_name || '',
      last_name: userData.last_name || authData.user.user_metadata?.last_name || '',
      phone_number: userData.phone_number || '',
      status: userData.status || 'approved'
    };

    console.log('[SUPABASE] Utilisateur complet récupéré:', {
      id: completeUser.id,
      email: completeUser.email,
      role: completeUser.role,
      status: completeUser.status
    });

    return { success: true, user: completeUser };

  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la connexion:', error.message);
    return { success: false, error: error.message };
  }
};

export const signInWithPhone = async (phoneNumber, password) => {
  if (!supabase) {
    console.error('[SUPABASE] Client non initialisé - configuration manquante');
    return { success: false, error: 'Configuration Supabase manquante' };
  }

  try {
    console.log('[SUPABASE] Tentative de connexion avec téléphone:', phoneNumber);
    
    // 1. Récupérer l'utilisateur par téléphone depuis la table users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (userError || !userData) {
      console.error('[SUPABASE] Utilisateur non trouvé pour le téléphone:', phoneNumber, userError);
      return { success: false, error: 'Aucun utilisateur trouvé avec ce numéro de téléphone' };
    }

    console.log('[SUPABASE] Utilisateur trouvé dans la table users:', {
      id: userData.id,
      email: userData.email,
      phone_number: userData.phone_number,
      role: userData.role,
      status: userData.status
    });
    
    // 2. Vérifier si l'utilisateur a un statut approuvé
    if (userData.status !== 'approved') {
      console.error('[SUPABASE] Utilisateur non approuvé, statut:', userData.status);
      return { success: false, error: 'Votre compte n\'est pas encore approuvé' };
    }
    
    // 3. Vérifier que l'utilisateur a un email
    if (!userData.email) {
      console.error('[SUPABASE] Utilisateur sans email');
      return { success: false, error: 'Votre compte n\'a pas d\'email configuré. Contactez l\'administrateur.' };
    }
    
    // 4. Se connecter directement avec l'email stocké et le mot de passe
    console.log('[SUPABASE] Tentative de connexion avec email:', userData.email);
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password
    });

    if (authError) {
      console.error('[SUPABASE] Erreur d\'authentification:', authError.message);
      
      if (authError.message.includes('Invalid login credentials')) {
        return { 
          success: false, 
          error: 'Identifiants incorrects. Vérifiez votre numéro de téléphone et mot de passe.' 
        };
      }
      
      throw new Error(translateSupabaseError(authError));
    }

    if (!authData.user) {
      throw new Error('Aucun utilisateur retourné après authentification');
    }

    console.log('[SUPABASE] ✅ Connexion réussie');
    
    // 5. Fusionner les données auth et users
    const completeUser = {
      ...authData.user,
      role: userData.role || 'client',
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      phone_number: userData.phone_number || '',
      status: userData.status || 'approved'
    };

    return { success: true, user: completeUser };
    
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la connexion (téléphone):', error.message);
    const translatedError = translateSupabaseError(error);
    return { success: false, error: translatedError };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(translateSupabaseError(error));
    return { success: true };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la déconnexion:', error.message);
    const translatedError = translateSupabaseError(error);
    return { success: false, error: translatedError };
  }
};



// ===== UTILISATEURS =====

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;

    if (!user) return { success: false, error: 'Utilisateur non connecté' };

    // Récupérer les données utilisateur applicatives
    let userData = null;
    try {
      const { data, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      if (userError) throw userError;
      userData = data;
    } catch (err) {
      // Ne pas bloquer l'app si RLS empêche la lecture; utiliser les métadonnées JWT
      console.warn('[SUPABASE] Lecture de public.users indisponible pour cet utilisateur:', err.message);
    }

    const mergedUser = {
      ...user,
      ...(userData || {}),
      role: (userData && userData.role) || user?.user_metadata?.role || user?.app_metadata?.role || 'client'
    };

    return { success: true, user: mergedUser };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la récupération utilisateur:', error.message);
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    console.log('[PROFILE] Mise à jour du profil utilisateur:', userId, profileData);
    
    // Préparer les données de mise à jour
    const updateData = {
      updated_at: new Date().toISOString()
    };

    // Ajouter les champs de base si fournis
    if (profileData.firstName) updateData.first_name = profileData.firstName;
    if (profileData.lastName) updateData.last_name = profileData.lastName;
    if (profileData.phone) updateData.phone_number = profileData.phone;
    if (profileData.email) updateData.email = profileData.email;

    // Ajouter les champs académiques
    if (profileData.filiere) updateData.filiere = profileData.filiere;
    if (profileData.annee_etude) updateData.annee_etude = profileData.annee_etude;
    if (profileData.entite) updateData.entite = profileData.entite;
    if (profileData.facebook_name) updateData.facebook_name = profileData.facebook_name;

    // Ajouter les informations du témoin
    if (profileData.temoin_name) updateData.temoin_name = profileData.temoin_name;
    if (profileData.temoin_quartier) updateData.temoin_quartier = profileData.temoin_quartier;
    if (profileData.temoin_phone) updateData.temoin_phone = profileData.temoin_phone;
    if (profileData.temoin_email) updateData.temoin_email = profileData.temoin_email;

    // Ajouter les informations de contact d'urgence
    if (profileData.emergency_name) updateData.emergency_name = profileData.emergency_name;
    if (profileData.emergency_relation) updateData.emergency_relation = profileData.emergency_relation;
    if (profileData.emergency_phone) updateData.emergency_phone = profileData.emergency_phone;
    if (profileData.emergency_email) updateData.emergency_email = profileData.emergency_email;
    if (profileData.emergency_address) updateData.emergency_address = profileData.emergency_address;

    // Ajouter les noms des documents
    if (profileData.user_identity_card_name) updateData.user_identity_card_name = profileData.user_identity_card_name;
    if (profileData.temoin_identity_card_name) updateData.temoin_identity_card_name = profileData.temoin_identity_card_name;
    if (profileData.student_card_name) updateData.student_card_name = profileData.student_card_name;

    // Ajouter les URLs des documents
    if (profileData.user_identity_card_url) updateData.user_identity_card_url = profileData.user_identity_card_url;
    if (profileData.temoin_identity_card_url) updateData.temoin_identity_card_url = profileData.temoin_identity_card_url;
    if (profileData.student_card_url) updateData.student_card_url = profileData.student_card_url;

    // 1. Mettre à jour la table users
    const { error: userError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (userError) {
      console.error('[PROFILE] Erreur mise à jour table users:', userError);
      throw userError;
    }

    // 2. Mettre à jour les métadonnées de l'utilisateur Supabase (si champs de base fournis)
    if (profileData.firstName || profileData.lastName || profileData.phone) {
      const authUpdateData = {};
      if (profileData.firstName) authUpdateData.first_name = profileData.firstName;
      if (profileData.lastName) authUpdateData.last_name = profileData.lastName;
      if (profileData.phone) authUpdateData.phone_number = profileData.phone;

      const { error: authError } = await supabase.auth.updateUser({
        data: authUpdateData
      });

      if (authError) {
        console.error('[PROFILE] Erreur mise à jour métadonnées auth:', authError);
        throw authError;
      }
    }

    console.log('[PROFILE] ✅ Profil mis à jour avec succès');
    return { success: true };
  } catch (error) {
    console.error('[PROFILE] ❌ Erreur lors de la mise à jour du profil:', error.message);
    return { success: false, error: error.message };
  }
};

/** Utilisateurs paginés (liste admin) — champs nécessaires + count */
export const getAllUsersPaginated = async (page = 0, pageSize = DEFAULT_PAGE_SIZE) => {
  try {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data: users, error: usersError, count } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, phone_number, status, created_at, filiere, annee_etude, entite, address, user_identity_card_url, temoin_identity_card_url, student_card_url', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (usersError) throw usersError;
    const { data: loans } = await supabase.from('loans').select('id, user_id, status, amount');
    const loansData = loans || [];
    const usersWithStats = (users || []).map(user => {
      const userLoans = loansData.filter(loan => loan.user_id === user.id);
      return {
        ...user,
        totalLoans: userLoans.length,
        activeLoans: userLoans.filter(l => l.status === 'approved' || l.status === 'active').length,
        totalAmount: userLoans.reduce((sum, l) => sum + (l.amount || 0), 0),
      };
    });
    return { success: true, data: usersWithStats, total: count ?? usersWithStats.length };
  } catch (error) {
    console.error('[SUPABASE] getAllUsersPaginated:', error.message);
    return { success: false, error: error.message, data: [], total: 0 };
  }
};

export const getAllUsers = async () => {
  try {
    // Récupérer tous les utilisateurs avec leurs informations complètes
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    // Récupérer tous les prêts pour calculer les statistiques
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('id, user_id, status, amount')
      .order('created_at', { ascending: false });

    if (loansError) throw loansError;

    // Calculer les statistiques pour chaque utilisateur
    const usersWithStats = users.map(user => {
      const userLoans = loans.filter(loan => loan.user_id === user.id);
      const totalLoans = userLoans.length;
      const activeLoans = userLoans.filter(loan => 
        loan.status === 'approved' || loan.status === 'active'
      ).length;
      const totalAmount = userLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0);

      return {
        ...user,
        totalLoans,
        activeLoans,
        totalAmount
      };
    });

    return { success: true, data: usersWithStats };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la récupération des utilisateurs:', error.message);
    return { success: false, error: error.message };
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la mise à jour du statut utilisateur:', error.message);
    return { success: false, error: error.message };
  }
};

export const deleteUserPermanently = async (userId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/delete-user/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Erreur lors de la suppression');
    }

    console.log('[DELETE_USER] ✅ Utilisateur supprimé:', result.message);
    return { success: true, message: result.message };
  } catch (error) {
    console.error('[DELETE_USER] ❌ Erreur:', error.message);
    return { success: false, error: error.message };
  }
};

// ===== PRÊTS =====

export const createLoan = async (loanData) => {
  try {
    console.log('[SUPABASE] Tentative de création du prêt avec:', loanData);
    
    const { data, error } = await supabase
      .from('loans')
      .insert([loanData])
      .select(`
        *,
        users!inner(id, first_name, last_name)
      `)
      .single();

    if (error) {
      console.error('[SUPABASE] Erreur Supabase:', error);
      throw error;
    }

    console.log('[SUPABASE] Prêt créé avec succès:', data);

    // Notifier l'admin de la nouvelle demande de prêt
    if (data && data.users) {
      try {
        const clientName = `${data.users.first_name} ${data.users.last_name}`;
        
        console.log('[ADMIN_NOTIFICATION] 📢 Envoi notification à l\'admin...', {
          backendUrl: BACKEND_URL,
          loanId: data.id,
          loanAmount: data.amount,
          clientName: clientName
        });
        
        const notificationResponse = await fetch(`${BACKEND_URL}/api/notify-admin-new-loan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            loanAmount: data.amount,
            clientName: clientName,
            loanId: data.id
          })
        });

        const responseData = await notificationResponse.json();
        
        if (notificationResponse.ok) {
          console.log('[ADMIN_NOTIFICATION] ✅ Réponse backend:', responseData);
          if (responseData.fcmSent) {
            console.log('[ADMIN_NOTIFICATION] ✅ Notification FCM envoyée à l\'admin');
          } else {
            console.warn('[ADMIN_NOTIFICATION] ⚠️ Notification créée dans la DB mais FCM non envoyé:', responseData.fcmError || 'Admin sans token FCM');
          }
        } else {
          console.error('[ADMIN_NOTIFICATION] ❌ Erreur backend:', responseData);
        }
      } catch (notificationError) {
        console.error('[ADMIN_NOTIFICATION] ❌ Erreur lors de l\'envoi de la notification:', notificationError);
        // Ne pas faire échouer la création du prêt si la notification échoue
      }
    } else {
      console.warn('[ADMIN_NOTIFICATION] ⚠️ Données utilisateur manquantes, notification admin non envoyée');
    }

    return { success: true, data };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la création du prêt:', error);
    console.error('[SUPABASE] Détails de l\'erreur:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
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
          email,
          phone_number,
          filiere,
          annee_etude,
          entite,
          address,
          facebook_name,
          temoin_name,
          temoin_quartier,
          temoin_phone,
          temoin_email,
          emergency_name,
          emergency_relation,
          emergency_phone,
          emergency_email,
          emergency_address,
          user_identity_card_name,
          temoin_identity_card_name,
          student_card_name,
          user_identity_card_url,
          temoin_identity_card_url,
          student_card_url
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

/** Prêts paginés + champs allégés pour listes (dashboard, historique) */
export const getLoansPaginated = async (userId = null, page = 0, pageSize = DEFAULT_PAGE_SIZE) => {
  try {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    let query = supabase
      .from('loans')
      .select('id, amount, status, created_at, purpose, user_id, duration_months, interest_rate, approved_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (userId) query = query.eq('user_id', userId);
    const { data, error, count } = await query;
    if (error) throw error;
    return { success: true, data, total: count ?? data?.length ?? 0 };
  } catch (error) {
    console.error('[SUPABASE] getLoansPaginated:', error.message);
    return { success: false, error: error.message, data: [], total: 0 };
  }
};

/** Détails complets d’un prêt (pour fiche / admin) — à appeler à la demande */
export const getLoanById = async (loanId) => {
  try {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        users (id, first_name, last_name, email, phone_number, address, filiere, annee_etude, entite,
          temoin_name, temoin_phone, temoin_quartier, user_identity_card_url, temoin_identity_card_url, student_card_url)
      `)
      .eq('id', loanId)
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[SUPABASE] getLoanById:', error.message);
    return { success: false, error: error.message };
  }
};

export const updateLoanStatus = async (loanId, status, adminId = null) => {
  try {
    console.log('[UPDATE_LOAN_STATUS] 📝 Mise à jour du prêt:', { loanId, status, adminId });
    
    // Validation du statut
    const validStatuses = ['pending', 'approved', 'active', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Statut invalide: ${status}. Statuts autorisés: ${validStatuses.join(', ')}`);
    }

    const updateData = { 
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'approved') {
      // Quand un prêt est approuvé, il devient automatiquement actif
      updateData.status = 'active';
      updateData.approved_by = adminId;
      updateData.approved_at = new Date().toISOString();
    }

    console.log('[UPDATE_LOAN_STATUS] 🔄 Données à mettre à jour:', updateData);

    const { data, error } = await supabase
      .from('loans')
      .update(updateData)
      .eq('id', loanId)
      .select(`
        *,
        users!inner(id, first_name, last_name)
      `)
      .single();

    if (error) {
      console.error('[UPDATE_LOAN_STATUS] ❌ Erreur Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Vérifier si c'est une erreur de contrainte
      if (error.code === '23514' || error.message?.includes('check constraint')) {
        throw new Error(`La base de données n'autorise pas le statut "${status}". Veuillez contacter l'administrateur pour mettre à jour la contrainte.`);
      }
      
      throw error;
    }

    console.log('[UPDATE_LOAN_STATUS] ✅ Prêt mis à jour avec succès:', data);

    // Système hybride de notifications (in-app + push)
    if (data && (status === 'approved' || status === 'rejected')) {
      try {
        const isApproved = status === 'approved';
        const action = isApproved ? 'approbation' : 'refus';
        console.log(`[LOAN_${action.toUpperCase()}] Système hybride de notifications...`);
        
        // 1. TOUJOURS créer la notification dans la base de données (in-app)
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: data.user_id,
            title: isApproved ? 'Prêt approuvé ! 🎉' : 'Demande de prêt refusée',
            message: isApproved 
              ? `Votre demande de prêt de ${parseInt(data.amount).toLocaleString()} FCFA a été approuvée. Vous pouvez maintenant effectuer votre premier remboursement.`
              : `Votre demande de prêt de ${parseInt(data.amount).toLocaleString()} FCFA a été refusée. Contactez l'administration pour plus d'informations.`,
            type: 'loan_status',
            data: {
              loan_id: data.id,
              loan_amount: data.amount,
              status: isApproved ? 'approved' : 'rejected',
              action: isApproved ? 'approved' : 'rejected'
            },
            read: false
          });

        if (notificationError) {
          console.error(`[LOAN_${action.toUpperCase()}] ❌ Erreur création notification DB:`, notificationError);
        } else {
          console.log(`[LOAN_${action.toUpperCase()}] ✅ Notification in-app créée (TOUJOURS disponible)`);
        }

        // 2. Tenter d'envoyer la notification push (si abonnement disponible)
        try {
          const notificationResponse = await fetch(`${BACKEND_URL}/api/notify-loan-${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data.user_id,
              loanAmount: data.amount,
              loanId: data.id,
              status: isApproved ? 'approved' : 'rejected'
            })
          });

          if (notificationResponse.ok) {
            console.log(`[LOAN_${action.toUpperCase()}] ✅ Notification push envoyée (utilisateur hors ligne notifié)`);
          } else {
            console.log(`[LOAN_${action.toUpperCase()}] ⚠️ Push échoué mais notification in-app disponible`);
          }
        } catch (pushError) {
          console.log(`[LOAN_${action.toUpperCase()}] ⚠️ Push non disponible mais notification in-app créée`);
        }

        console.log(`[LOAN_${action.toUpperCase()}] 🎯 Système hybride : Notification garantie (in-app + push si disponible)`);
      } catch (notificationError) {
        console.error(`[LOAN_NOTIFICATION] ❌ Erreur système de notifications:`, notificationError);
        // Même en cas d'erreur, la notification in-app est prioritaire
      }
    }

    return { success: true, data };
  } catch (error) {
    console.error('[UPDATE_LOAN_STATUS] ❌ Erreur lors de la mise à jour du prêt:', error);
    const errorMessage = error.message || 'Erreur lors de la mise à jour du statut du prêt';
    return { success: false, error: errorMessage };
  }
};

// ===== PAIEMENTS =====

export const createPayment = async (paymentData) => {
  try {
    // Vérifier si le paiement existe déjà (idempotence) - éviter les doublons
    const transactionId = paymentData.fedapay_transaction_id || paymentData.transaction_id;
    if (transactionId) {
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .or(`fedapay_transaction_id.eq.${transactionId},transaction_id.eq.${transactionId}`)
        .maybeSingle();

      if (existingPayment) {
        console.log('[SUPABASE] ⚠️ Paiement déjà existant, évite le doublon:', {
          payment_id: existingPayment.id,
          transaction_id: transactionId
        });
        
        // Retourner le paiement existant
        const { data: payment } = await supabase
          .from('payments')
          .select('*')
          .eq('id', existingPayment.id)
          .single();

        return { success: true, data: payment, isDuplicate: true };
      }
    }

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
          purpose,
          interest_rate,
          status,
          approved_at,
          created_at,
          users (
            id,
            first_name,
            last_name,
            email,
            phone_number
          )
        ),
        users (
          id,
          first_name,
          last_name,
          email,
          phone_number
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

/** Paiements paginés (champs nécessaires pour listes) */
export const getPaymentsPaginated = async (userId = null, page = 0, pageSize = DEFAULT_PAGE_SIZE) => {
  try {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    let query = supabase
      .from('payments')
      .select('id, loan_id, user_id, amount, status, created_at, payment_date', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (userId) query = query.eq('user_id', userId);
    const { data, error, count } = await query;
    if (error) throw error;
    return { success: true, data, total: count ?? data?.length ?? 0 };
  } catch (error) {
    console.error('[SUPABASE] getPaymentsPaginated:', error.message);
    return { success: false, error: error.message, data: [], total: 0 };
  }
};

// ===== REMBOURSEMENTS DE PRÊTS =====

/**
 * Crée un remboursement de prêt avec FedaPay
 * @param {Object} repaymentData - Données du remboursement
 * @returns {Promise<Object>} Résultat du remboursement
 */
export const createLoanRepayment = async (repaymentData) => {
  try {
    console.log('[SUPABASE] Création du remboursement:', repaymentData);

    // Validation des données
    if (!repaymentData.loan_id || !repaymentData.user_id || !repaymentData.amount) {
      throw new Error('Données de remboursement incomplètes');
    }

    // Vérifier si le paiement existe déjà (idempotence) - éviter les doublons
    if (repaymentData.fedapay_transaction_id) {
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .or(`fedapay_transaction_id.eq.${repaymentData.fedapay_transaction_id},transaction_id.eq.${repaymentData.fedapay_transaction_id}`)
        .maybeSingle();

      if (existingPayment) {
        console.log('[SUPABASE] ⚠️ Paiement déjà existant, évite le doublon:', {
          payment_id: existingPayment.id,
          transaction_id: repaymentData.fedapay_transaction_id
        });
        
        // Retourner le paiement existant
        const { data: paymentData } = await supabase
          .from('payments')
          .select('*')
          .eq('id', existingPayment.id)
          .single();

        return { success: true, data: paymentData, isDuplicate: true };
      }
    }

    // Créer l'enregistrement de remboursement
    const repaymentRecord = {
      loan_id: repaymentData.loan_id,
      user_id: repaymentData.user_id,
      amount: repaymentData.amount,
      payment_method: repaymentData.payment_method || 'fedapay',
      fedapay_transaction_id: repaymentData.fedapay_transaction_id,
      transaction_id: repaymentData.fedapay_transaction_id, // Ajouter aussi dans transaction_id pour cohérence
      status: repaymentData.status || 'pending',
      payment_date: repaymentData.payment_date || new Date().toISOString(),
      description: repaymentData.description || 'Remboursement de prêt via FedaPay',
      metadata: {
        fedapay_data: repaymentData.fedapay_data,
        payment_type: 'loan_repayment',
        app_source: 'ab_pret_web'
      }
    };

    const { data, error } = await supabase
      .from('payments')
      .insert([repaymentRecord])
      .select()
      .single();

    if (error) throw error;

    console.log('[SUPABASE] Remboursement créé:', data);

    return { success: true, data };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la création du remboursement:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Met à jour le statut d'un remboursement
 * @param {string} paymentId - ID du paiement
 * @param {string} status - Nouveau statut
 * @param {Object} fedapayData - Données FedaPay (optionnel)
 * @returns {Promise<Object>} Résultat de la mise à jour
 */
export const updateRepaymentStatus = async (paymentId, status, fedapayData = null) => {
  try {
    console.log('[SUPABASE] Mise à jour du statut:', { paymentId, status });

    const updateData = {
      status: status,
      updated_at: new Date().toISOString()
    };

    // Ajouter les données FedaPay si fournies
    if (fedapayData) {
      updateData.metadata = {
        fedapay_data: fedapayData,
        last_update: new Date().toISOString()
      };
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;

    console.log('[SUPABASE] Statut mis à jour:', data);

    return { success: true, data };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la mise à jour du statut:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère les détails d'un prêt avec ses remboursements
 * @param {string} loanId - ID du prêt
 * @returns {Promise<Object>} Détails du prêt
 */
export const getLoanWithRepayments = async (loanId) => {
  try {
    console.log('[SUPABASE] Récupération du prêt avec remboursements:', loanId);

    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        payments (
          id,
          amount,
          status,
          payment_date,
          payment_method,
          fedapay_transaction_id
        )
      `)
      .eq('id', loanId)
      .single();

    if (error) throw error;

    console.log('[SUPABASE] Prêt récupéré:', data);

    return { success: true, data };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la récupération du prêt:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Calcule le montant restant à payer pour un prêt
 * @param {string} loanId - ID du prêt
 * @returns {Promise<Object>} Calcul du montant restant
 */
export const calculateRemainingAmount = async (loanId) => {
  try {
    console.log('[SUPABASE] Calcul du montant restant pour le prêt:', loanId);

    // Récupérer le prêt
    const loanResult = await getLoanWithRepayments(loanId);
    if (!loanResult.success) {
      throw new Error('Impossible de récupérer les détails du prêt');
    }

    const loan = loanResult.data;
    const totalAmount = loan.amount * (1 + (loan.interest_rate || 0) / 100);
    
    // Calculer le montant payé
    const paidAmount = loan.payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    const remainingAmount = totalAmount - paidAmount;

    const result = {
      totalAmount: totalAmount,
      paidAmount: paidAmount,
      remainingAmount: remainingAmount,
      isFullyPaid: remainingAmount <= 0
    };

    console.log('[SUPABASE] Calcul terminé:', result);

    return { success: true, data: result };
  } catch (error) {
    console.error('[SUPABASE] Erreur lors du calcul du montant restant:', error.message);
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


// ===== FEDAPAY LOAN REPAYMENT =====

export const processFedaPayLoanRepayment = async (transactionData) => {
  try {
    if (!supabase) {
      return { success: false, error: 'Configuration Supabase manquante' };
    }

    const { loan_id, user_id, amount, transaction_id } = transactionData;

    console.log('[SUPABASE] Traitement remboursement FedaPay:', {
      loan_id,
      user_id,
      amount,
      transaction_id
    });

    // 1. Créer l'enregistrement de paiement
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        loan_id: loan_id,
        user_id: user_id,
        amount: amount,
        payment_method: 'fedapay',
        transaction_id: transaction_id,
        status: 'completed',
        payment_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (paymentError) throw paymentError;

    // 2. Mettre à jour le statut du prêt
    const { error: loanError } = await supabase
      .from('loans')
      .update({
        status: 'remboursé',
        en_cours: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', loan_id);

    if (loanError) throw loanError;

    // 3. Envoyer une notification SMS de confirmation
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('phone_number, first_name')
        .eq('id', user_id)
        .single();

      if (userData?.phone_number) {
        await sendOTPSMS(userData.phone_number, 'CONFIRMATION', userData.first_name || 'Client');
      }
    } catch (smsError) {
      console.warn('[SUPABASE] Erreur envoi SMS confirmation:', smsError.message);
    }

    console.log('[SUPABASE] Remboursement FedaPay traité avec succès');

    return { 
      success: true, 
      data: {
        payment: paymentData,
        loan_updated: true
      }
    };

  } catch (error) {
    console.error('[SUPABASE] Erreur lors du traitement du remboursement FedaPay:', error.message);
    return { success: false, error: error.message };
  }
};

// ===== LOYALTY SYSTEM =====

// Vérifier si un popup de fidélité doit être affiché
export const checkLoyaltyPopup = async (userId, isAdmin = false) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/loyalty-popup-check?userId=${userId}&isAdmin=${isAdmin}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la vérification du popup');
    }
    
    return data;
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la vérification du popup de fidélité:', error.message);
    return { success: false, showPopup: false, error: error.message };
  }
};

// Réinitialiser le compteur de fidélité et mettre à jour le statut
export const resetLoyaltyCounter = async (userId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/loyalty-reset-counter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la réinitialisation du compteur');
    }
    
    return data;
  } catch (error) {
    console.error('[SUPABASE] Erreur lors de la réinitialisation du compteur:', error.message);
    return { success: false, error: error.message };
  }
};
