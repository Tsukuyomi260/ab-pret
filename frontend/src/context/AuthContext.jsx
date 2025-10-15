import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { 
  signUpWithEmail, 
  signInWithEmail, 
  signInWithPhone,
  signOut, 
  getCurrentUser 
} from '../utils/supabaseAPI';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AUTH] Initialisation du contexte d\'authentification...');
    
    // Nettoyer le cache obsolète au démarrage
    try {
      const cached = localStorage.getItem('ab_user_cache');
      if (cached) {
        const cachedUser = JSON.parse(cached);
        // Vérifier si le cache est récent (moins de 24h)
        const cacheTime = localStorage.getItem('ab_user_cache_time');
        if (cacheTime) {
          const timeDiff = Date.now() - parseInt(cacheTime);
          if (timeDiff > 24 * 60 * 60 * 1000) { // 24h
            console.log('[AUTH] Cache obsolète détecté, nettoyage...');
            localStorage.removeItem('ab_user_cache');
            localStorage.removeItem('ab_user_cache_time');
          }
        }
      }
    } catch (cacheError) {
      console.warn('[AUTH] Erreur vérification cache:', cacheError);
      localStorage.removeItem('ab_user_cache');
      localStorage.removeItem('ab_user_cache_time');
    }
    
    // Sécurité: timeout anti-blocage du loader
    const safetyTimeout = setTimeout(() => {
      console.log('[AUTH] ⚠️ Timeout de sécurité - arrêt du loader');
      setLoading(false);
    }, 3000);

    // Si Supabase n'est pas initialisé, ne pas bloquer l'app
    if (!supabase) {
      console.warn('[AUTH] Supabase non initialisé - skip auth subscription');
      setLoading(false);
      return;
    }

    let subscription;
    let isInitialized = false;

    const initializeAuth = async () => {
      try {
        // 1. Vérifier d'abord la session actuelle
        console.log('[AUTH] Vérification de la session actuelle...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('[AUTH] Session trouvée:', session.user.email);
          
          // Récupérer le rôle depuis la DB pour être sûr
          let roleFromJwt = session.user?.user_metadata?.role || session.user?.app_metadata?.role || 'client';
          
          try {
            const { data: dbUser, error: dbError } = await supabase
              .from('users')
              .select('role, first_name, last_name')
              .eq('id', session.user.id)
              .single();
            
            if (!dbError && dbUser) {
              console.log('[AUTH] Rôle récupéré depuis la DB:', dbUser.role);
              roleFromJwt = dbUser.role || roleFromJwt;
              
              // Mettre à jour les métadonnées locales
              const userData = { 
                ...session.user, 
                role: roleFromJwt,
                firstName: dbUser.first_name || session.user.user_metadata?.first_name,
                lastName: dbUser.last_name || session.user.user_metadata?.last_name
              };
              
              setUser(userData);
              
              // Mettre en cache avec le bon rôle et timestamp
              localStorage.setItem('ab_user_cache', JSON.stringify({
                id: userData.id,
                email: userData.email,
                role: roleFromJwt,
                first_name: dbUser.first_name || '',
                last_name: dbUser.last_name || ''
              }));
              localStorage.setItem('ab_user_cache_time', Date.now().toString());
            } else {
              console.warn('[AUTH] Impossible de récupérer le rôle depuis la DB, utilisation JWT');
              const userData = { ...session.user, role: roleFromJwt };
              setUser(userData);
              
              localStorage.setItem('ab_user_cache', JSON.stringify({
                id: userData.id,
                email: userData.email,
                role: roleFromJwt,
                first_name: userData.user_metadata?.first_name || '',
                last_name: userData.user_metadata?.last_name || ''
              }));
              localStorage.setItem('ab_user_cache_time', Date.now().toString());
            }
          } catch (dbError) {
            console.error('[AUTH] Erreur récupération rôle DB:', dbError);
            const userData = { ...session.user, role: roleFromJwt };
            setUser(userData);
            
            localStorage.setItem('ab_user_cache', JSON.stringify({
              id: userData.id,
              email: userData.email,
              role: roleFromJwt,
              first_name: userData.user_metadata?.first_name || '',
              last_name: userData.user_metadata?.last_name || ''
            }));
            localStorage.setItem('ab_user_cache_time', Date.now().toString());
          }
        } else {
          console.log('[AUTH] Aucune session active');
          // Essayer de récupérer depuis le cache
          try {
            const cached = localStorage.getItem('ab_user_cache');
            if (cached) {
              const cachedUser = JSON.parse(cached);
              if (cachedUser && cachedUser.id) {
                console.log('[AUTH] Utilisateur récupéré depuis le cache');
                setUser(cachedUser);
              }
            }
          } catch (cacheError) {
            console.warn('[AUTH] Erreur lecture cache:', cacheError);
          }
        }

        // 2. Configurer l'écouteur d'événements
        console.log('[AUTH] Configuration de l\'écouteur d\'événements...');
        const res = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('[AUTH] Événement auth:', event, session?.user?.email);
            
            if (event === 'SIGNED_IN' && session) {
              // Récupérer le rôle depuis la DB
              let roleFromJwt = session.user?.user_metadata?.role || session.user?.app_metadata?.role || 'client';
              
              try {
                const { data: dbUser, error: dbError } = await supabase
                  .from('users')
                  .select('role, first_name, last_name')
                  .eq('id', session.user.id)
                  .single();
                
                if (!dbError && dbUser) {
                  console.log('[AUTH] SIGNED_IN - Rôle DB:', dbUser.role);
                  roleFromJwt = dbUser.role || roleFromJwt;
                  
                  const userData = { 
                    ...session.user, 
                    role: roleFromJwt,
                    firstName: dbUser.first_name || session.user.user_metadata?.first_name,
                    lastName: dbUser.last_name || session.user.user_metadata?.last_name
                  };
                  
                  setUser(userData);
                  
                  localStorage.setItem('ab_user_cache', JSON.stringify({
                    id: userData.id,
                    email: userData.email,
                    role: roleFromJwt,
                    first_name: dbUser.first_name || '',
                    last_name: dbUser.last_name || ''
                  }));
                } else {
                  const userData = { ...session.user, role: roleFromJwt };
                  setUser(userData);
                  
                  localStorage.setItem('ab_user_cache', JSON.stringify({
                    id: userData.id,
                    email: userData.email,
                    role: roleFromJwt,
                    first_name: userData.user_metadata?.first_name || '',
                    last_name: userData.user_metadata?.last_name || ''
                  }));
                }
              } catch (dbError) {
                console.error('[AUTH] Erreur récupération rôle DB (SIGNED_IN):', dbError);
                const userData = { ...session.user, role: roleFromJwt };
                setUser(userData);
                
                localStorage.setItem('ab_user_cache', JSON.stringify({
                  id: userData.id,
                  email: userData.email,
                  role: roleFromJwt,
                  first_name: userData.user_metadata?.first_name || '',
                  last_name: userData.user_metadata?.last_name || ''
                }));
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('[AUTH] Utilisateur déconnecté');
              setUser(null);
              try {
                localStorage.removeItem('ab_user_cache');
              } catch (cacheError) {
                console.warn('[AUTH] Erreur suppression cache:', cacheError);
              }
            } else if (event === 'TOKEN_REFRESHED' && session) {
              console.log('[AUTH] Token rafraîchi');
              // Récupérer le rôle depuis la DB aussi lors du refresh
              let roleFromJwt = session.user?.user_metadata?.role || session.user?.app_metadata?.role || 'client';
              
              try {
                const { data: dbUser, error: dbError } = await supabase
                  .from('users')
                  .select('role, first_name, last_name')
                  .eq('id', session.user.id)
                  .single();
                
                if (!dbError && dbUser) {
                  roleFromJwt = dbUser.role || roleFromJwt;
                  
                  const userData = { 
                    ...session.user, 
                    role: roleFromJwt,
                    firstName: dbUser.first_name || session.user.user_metadata?.first_name,
                    lastName: dbUser.last_name || session.user.user_metadata?.last_name
                  };
                  
                  setUser(userData);
                } else {
                  const userData = { ...session.user, role: roleFromJwt };
                  setUser(userData);
                }
              } catch (dbError) {
                console.error('[AUTH] Erreur récupération rôle DB (TOKEN_REFRESHED):', dbError);
                const userData = { ...session.user, role: roleFromJwt };
                setUser(userData);
              }
            }
          }
        );

        subscription = res.data.subscription;
        isInitialized = true;
        console.log('[AUTH] ✅ Contexte d\'authentification initialisé');
        
      } catch (error) {
        console.error('[AUTH] ❌ Erreur lors de l\'initialisation:', error.message);
      } finally {
        clearTimeout(safetyTimeout);
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      clearTimeout(safetyTimeout);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Fonctions d'authentification avec gestion d'erreur
  const signUp = async (email, password, userData) => {
    if (!supabase) {
      console.error('[AUTH] Supabase non configuré - impossible de s\'inscrire');
      return { success: false, error: 'Configuration Supabase manquante. Vérifiez vos variables d\'environnement.' };
    }
    
    try {
      const result = await signUpWithEmail(email, password, userData);
      return result;
    } catch (error) {
      console.error('[AUTH] Erreur lors de l\'inscription:', error.message);
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    if (!supabase) {
      console.error('[AUTH] Supabase non configuré - impossible de se connecter');
      return { success: false, error: 'Configuration Supabase manquante. Vérifiez vos variables d\'environnement.' };
    }
    
    try {
      console.log('[AUTH] Tentative de connexion avec Supabase...');
      const result = await signInWithEmail(email, password);
      console.log('[AUTH] Résultat Supabase:', result);
      return result;
    } catch (error) {
      console.error('[AUTH] Erreur lors de la connexion:', error.message);
      return { success: false, error: error.message };
    }
  };

  const signInWithPhoneNumber = async (phoneNumber, password) => {
    if (!supabase) {
      return { success: false, error: 'Supabase non configuré' };
    }
    
    try {
      const result = await signInWithPhone(phoneNumber, password);
      return result;
    } catch (error) {
      console.error('[AUTH] Erreur lors de la connexion par téléphone:', error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    if (!supabase) {
      setUser(null);
      try {
        localStorage.removeItem('ab_user_cache');
      } catch (error) {
        console.warn('[AUTH] Erreur lors de la suppression du cache:', error);
      }
      return { success: true };
    }
    
    try {
      const result = await signOut();
      if (result.success) {
        setUser(null);
        try {
          localStorage.removeItem('ab_user_cache');
        } catch (error) {
          console.warn('[AUTH] Erreur lors de la suppression du cache:', error);
        }
      }
      return result;
    } catch (error) {
      console.error('[AUTH] Erreur lors de la déconnexion:', error.message);
      return { success: false, error: error.message };
    }
  };

  const refreshUser = async () => {
    if (!supabase) {
      return { success: false, error: 'Supabase non configuré' };
    }
    
    try {
      const result = await getCurrentUser();
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error('[AUTH] Erreur lors du rafraîchissement:', error.message);
      return { success: false, error: error.message };
    }
  };

  const forceRefreshRole = async () => {
    if (!supabase || !user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }
    
    try {
      console.log('[AUTH] 🔄 Forçage de la récupération du rôle depuis la DB...');
      
      // Récupérer le rôle depuis la DB
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('role, first_name, last_name')
        .eq('id', user.id)
        .single();
      
      if (dbError || !dbUser) {
        console.error('[AUTH] Erreur récupération rôle DB:', dbError);
        return { success: false, error: 'Impossible de récupérer le rôle' };
      }
      
      console.log('[AUTH] ✅ Rôle récupéré depuis la DB:', dbUser.role);
      
      // Mettre à jour l'utilisateur avec le bon rôle
      const updatedUser = {
        ...user,
        role: dbUser.role,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name
      };
      
      setUser(updatedUser);
      
      // Mettre à jour le cache
      localStorage.setItem('ab_user_cache', JSON.stringify({
        id: updatedUser.id,
        email: updatedUser.email,
        role: dbUser.role,
        first_name: dbUser.first_name || '',
        last_name: dbUser.last_name || ''
      }));
      localStorage.setItem('ab_user_cache_time', Date.now().toString());
      
      console.log('[AUTH] ✅ Rôle mis à jour:', dbUser.role);
      return { success: true, role: dbUser.role };
      
    } catch (error) {
      console.error('[AUTH] Erreur lors du forçage du rôle:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signInWithPhoneNumber,
    logout,
    refreshUser,
    forceRefreshRole,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};