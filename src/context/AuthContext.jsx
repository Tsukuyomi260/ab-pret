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
          const roleFromJwt = session.user?.user_metadata?.role || session.user?.app_metadata?.role || 'client';
          const userData = { ...session.user, role: roleFromJwt };
          
          setUser(userData);
          
          // Mettre en cache
          try {
            localStorage.setItem('ab_user_cache', JSON.stringify({
              id: userData.id,
              email: userData.email,
              role: roleFromJwt,
              first_name: userData.user_metadata?.first_name || '',
              last_name: userData.user_metadata?.last_name || ''
            }));
          } catch (cacheError) {
            console.warn('[AUTH] Erreur cache:', cacheError);
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
              const roleFromJwt = session.user?.user_metadata?.role || session.user?.app_metadata?.role || 'client';
              const userData = { ...session.user, role: roleFromJwt };
              setUser(userData);
              
              try {
                localStorage.setItem('ab_user_cache', JSON.stringify({
                  id: userData.id,
                  email: userData.email,
                  role: roleFromJwt,
                  first_name: userData.user_metadata?.first_name || '',
                  last_name: userData.user_metadata?.last_name || ''
                }));
              } catch (cacheError) {
                console.warn('[AUTH] Erreur cache:', cacheError);
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
              const roleFromJwt = session.user?.user_metadata?.role || session.user?.app_metadata?.role || 'client';
              const userData = { ...session.user, role: roleFromJwt };
              setUser(userData);
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

  const signInWithPhoneNumber = async (phoneNumber) => {
    if (!supabase) {
      return { success: false, error: 'Supabase non configuré' };
    }
    
    try {
      const result = await signInWithPhone(phoneNumber);
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

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signInWithPhoneNumber,
    logout,
    refreshUser,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};