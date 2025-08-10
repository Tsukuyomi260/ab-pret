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
              } catch (_) {}
            } else if (event === 'SIGNED_OUT') {
              console.log('[AUTH] Utilisateur déconnecté');
              setUser(null);
              try { localStorage.removeItem('ab_user_cache'); } catch (_) {}
            }
            
            if (!isInitialized) {
              isInitialized = true;
              setLoading(false);
            }
          }
        );
        
        subscription = res?.data?.subscription;
        
        // Si on a une session, on peut arrêter le loader
        if (session?.user && !isInitialized) {
          isInitialized = true;
          setLoading(false);
        }
        
      } catch (error) {
        console.error('[AUTH] Erreur lors de l\'initialisation:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      try { subscription && subscription.unsubscribe(); } catch (_) {}
      clearTimeout(safetyTimeout);
    };
  }, []);

  const login = async (credentials) => {
    try {
      const rawInput = (credentials.identifier ?? credentials.email ?? '').trim();
      console.log('[AUTH] Tentative de connexion avec:', rawInput);
      
      // Détecter si c'est un téléphone ou un email
      const normalizedInput = rawInput.replace(/\s|\-/g, '');
      const isPhone = rawInput && /^(\+?\d{8,15})$/.test(normalizedInput);
      
      console.log('[AUTH] Type détecté:', isPhone ? 'téléphone' : 'email');

      let result;
      if (isPhone) {
        // Connexion par téléphone
        result = await signInWithPhone(normalizedInput, credentials.password);
      } else {
        // Connexion par email
        result = await signInWithEmail(rawInput, credentials.password);
      }

      if (!result.success) {
        console.error('[AUTH] Échec de connexion:', result.error);
        return { success: false, error: result.error };
      }

      const roleFromJwt = result.user?.user_metadata?.role || result.user?.app_metadata?.role || 'client';
      const merged = { ...result.user, role: roleFromJwt };

      console.log('[AUTH] ✅ Connexion réussie pour:', merged.email || merged.phone_number);
      
      // Mettre à jour immédiatement le contexte pour éviter les boucles de redirection
      setUser(merged);

      return { success: true, user: merged };
    } catch (error) {
      console.error('[AUTH] Erreur lors de la connexion:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  const register = async (userData) => {
    try {
      const result = await signUpWithEmail(userData.email, userData.password, userData);
      
      if (result.success) {
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('[AUTH] Erreur lors de l\'inscription:', error);
      return { success: false, error: 'Erreur d\'inscription' };
    }
  };

  const logout = async () => {
    try {
      console.log('[AUTH] Déconnexion en cours...');
      
      // Nettoyer immédiatement le state local et le cache
      setUser(null);
      try {
        localStorage.removeItem('ab_user_cache');
        console.log('[AUTH] Cache local nettoyé');
      } catch (cacheError) {
        console.warn('[AUTH] Erreur lors du nettoyage du cache:', cacheError);
      }
      
      // Appeler la fonction de déconnexion Supabase
      const result = await signOut();
      
      if (result.success) {
        console.log('[AUTH] ✅ Déconnexion Supabase réussie');
        return { success: true };
      } else {
        console.warn('[AUTH] ⚠️ Échec de la déconnexion Supabase, mais déconnexion locale effectuée:', result.error);
        // On retourne quand même success car la déconnexion locale est faite
        return { success: true, warning: result.error };
      }
    } catch (error) {
      console.error('[AUTH] ❌ Erreur lors de la déconnexion:', error);
      // On retourne quand même success car la déconnexion locale est faite
      return { success: true, warning: error.message };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};