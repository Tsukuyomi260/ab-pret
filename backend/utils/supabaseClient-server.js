const { createClient } = require('@supabase/supabase-js');

// Configuration sécurisée via variables d'environnement
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Vérification de sécurité
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[SUPABASE_SERVER] Configuration manquante:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    environment: process.env.NODE_ENV
  });
}

// Créer le client Supabase
// Utiliser la clé de service pour les opérations côté serveur (webhook)
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabaseUrl && supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Fonction de test de connexion Supabase
const testSupabaseConnection = async () => {
  if (!supabase) {
    console.error('[SUPABASE_SERVER] Client non initialisé - configuration manquante');
    return { success: false, error: 'Configuration Supabase manquante' };
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('[SUPABASE_SERVER] Erreur de connexion:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('[SUPABASE_SERVER] Connexion réussie');
    return { success: true };
  } catch (error) {
    console.error('[SUPABASE_SERVER] Erreur de connexion:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  supabase,
  testSupabaseConnection
}; 