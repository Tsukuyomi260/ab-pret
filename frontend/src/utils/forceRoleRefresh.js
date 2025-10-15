// Utilitaire pour forcer le rafraîchissement du rôle utilisateur
import { supabase } from './supabaseClient';

export const forceRoleRefresh = async (userId) => {
  try {
    console.log('[FORCE_ROLE_REFRESH] 🔄 Début du rafraîchissement forcé du rôle...');
    
    // 1. Nettoyer complètement le cache
    console.log('[FORCE_ROLE_REFRESH] 🧹 Nettoyage du cache...');
    localStorage.removeItem('ab_user_cache');
    localStorage.removeItem('ab_user_cache_time');
    sessionStorage.clear();
    
    // 2. Récupérer la session actuelle
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[FORCE_ROLE_REFRESH] ❌ Erreur session:', sessionError);
      return { success: false, error: sessionError.message };
    }
    
    if (!session?.user) {
      console.log('[FORCE_ROLE_REFRESH] ⚠️ Aucune session active');
      return { success: false, error: 'Aucune session active' };
    }
    
    console.log('[FORCE_ROLE_REFRESH] 👤 Session trouvée:', session.user.email);
    
    // 3. Récupérer le rôle depuis la DB
    console.log('[FORCE_ROLE_REFRESH] 🗄️ Récupération du rôle depuis la DB...');
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('role, first_name, last_name, email')
      .eq('id', session.user.id)
      .single();
    
    if (dbError) {
      console.error('[FORCE_ROLE_REFRESH] ❌ Erreur DB:', dbError);
      return { success: false, error: dbError.message };
    }
    
    if (!dbUser) {
      console.error('[FORCE_ROLE_REFRESH] ❌ Utilisateur non trouvé en DB');
      return { success: false, error: 'Utilisateur non trouvé' };
    }
    
    console.log('[FORCE_ROLE_REFRESH] ✅ Rôle récupéré:', dbUser.role);
    
    // 4. Mettre à jour le cache avec les bonnes données
    const userData = {
      id: session.user.id,
      email: session.user.email,
      role: dbUser.role,
      first_name: dbUser.first_name || '',
      last_name: dbUser.last_name || '',
      firstName: dbUser.first_name,
      lastName: dbUser.last_name
    };
    
    localStorage.setItem('ab_user_cache', JSON.stringify(userData));
    localStorage.setItem('ab_user_cache_time', Date.now().toString());
    
    console.log('[FORCE_ROLE_REFRESH] ✅ Cache mis à jour avec le rôle:', dbUser.role);
    
    // 5. Forcer un rechargement de la page pour appliquer les changements
    console.log('[FORCE_ROLE_REFRESH] 🔄 Rechargement de la page...');
    window.location.reload();
    
    return { 
      success: true, 
      role: dbUser.role,
      user: userData 
    };
    
  } catch (error) {
    console.error('[FORCE_ROLE_REFRESH] ❌ Erreur générale:', error);
    return { success: false, error: error.message };
  }
};

// Fonction pour vérifier si le rôle est correct
export const checkRoleConsistency = async () => {
  try {
    const cached = localStorage.getItem('ab_user_cache');
    if (!cached) {
      return { consistent: false, reason: 'Aucun cache trouvé' };
    }
    
    const cachedUser = JSON.parse(cached);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { consistent: false, reason: 'Aucune session active' };
    }
    
    // Récupérer le rôle depuis la DB
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (dbError || !dbUser) {
      return { consistent: false, reason: 'Impossible de récupérer le rôle depuis la DB' };
    }
    
    const isConsistent = cachedUser.role === dbUser.role;
    
    return {
      consistent: isConsistent,
      cachedRole: cachedUser.role,
      dbRole: dbUser.role,
      reason: isConsistent ? 'Rôles cohérents' : 'Rôles incohérents'
    };
    
  } catch (error) {
    console.error('[CHECK_ROLE_CONSISTENCY] ❌ Erreur:', error);
    return { consistent: false, reason: error.message };
  }
};
