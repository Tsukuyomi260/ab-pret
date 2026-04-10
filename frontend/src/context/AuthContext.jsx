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
        JSON.parse(cached);
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

    const CACHE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes pour afficher la page tout de suite
    const DB_TIMEOUT_MS = 2000;

    const initializeAuth = async () => {
      try {
        // 1. Vérifier d'abord la session actuelle
        console.log('[AUTH] Vérification de la session actuelle...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('[AUTH] Session trouvée:', session.user.email);
          
          const roleFromJwt = session.user?.user_metadata?.role || session.user?.app_metadata?.role || 'client';
          const cacheTime = localStorage.getItem('ab_user_cache_time');
          const cached = localStorage.getItem('ab_user_cache');
          const cacheRecent = cacheTime && cached && (Date.now() - parseInt(cacheTime, 10)) < CACHE_MAX_AGE_MS;
          let userSetFromCache = false;

          // Si cache récent : afficher la page immédiatement, puis rafraîchir en arrière-plan
          if (cacheRecent) {
            try {
              const cachedUser = JSON.parse(cached);
              if (cachedUser?.id === session.user.id) {
                userSetFromCache = true;
                const userData = {
                  ...session.user,
                  role: cachedUser.role || roleFromJwt,
                  firstName: cachedUser.first_name,
                  lastName: cachedUser.last_name
                };
                setUser(userData);
                setLoading(false);
                // Rafraîchir le rôle en arrière-plan (sans bloquer l'affichage)
                (async () => {
                  try {
                    const { data: dbUser } = await supabase
                      .from('users')
                      .select('role, first_name, last_name')
                      .eq('id', session.user.id)
                      .single();
                    if (dbUser) {
                      setUser(prev => ({
                        ...prev,
                        ...session.user,
                        role: dbUser.role || roleFromJwt,
                        firstName: dbUser.first_name,
                        lastName: dbUser.last_name
                      }));
                      localStorage.setItem('ab_user_cache', JSON.stringify({
                        id: session.user.id,
                        email: session.user.email,
                        role: dbUser.role || roleFromJwt,
                        first_name: dbUser.first_name || '',
                        last_name: dbUser.last_name || ''
                      }));
                      localStorage.setItem('ab_user_cache_time', Date.now().toString());
                    }
                  } catch (_) {}
                })();
                // Ne pas return : on continue pour configurer l'écouteur ci-dessous
              }
            } catch (e) {
              console.warn('[AUTH] Cache invalide, fallback DB');
            }
          }

          // Pas de cache récent ou cache non utilisé : attendre la réponse DB (timeout court)
          if (!userSetFromCache) {
            try {
            const dbQueryPromise = supabase
              .from('users')
              .select('role, first_name, last_name')
              .eq('id', session.user.id)
              .single();
            
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), DB_TIMEOUT_MS)
            );
            
            const result = await Promise.race([dbQueryPromise, timeoutPromise]);
            
            if (!result.error && result.data) {
              const dbUser = result.data;
              const roleFromJwtFinal = dbUser.role || roleFromJwt;
              const userData = { 
                ...session.user, 
                role: roleFromJwtFinal,
                firstName: dbUser.first_name || session.user.user_metadata?.first_name,
                lastName: dbUser.last_name || session.user.user_metadata?.last_name
              };
              setUser(userData);
              localStorage.setItem('ab_user_cache', JSON.stringify({
                id: userData.id,
                email: userData.email,
                role: roleFromJwtFinal,
                first_name: dbUser.first_name || '',
                last_name: dbUser.last_name || ''
              }));
              localStorage.setItem('ab_user_cache_time', Date.now().toString());
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
              localStorage.setItem('ab_user_cache_time', Date.now().toString());
            }
          } catch (dbError) {
            console.warn('[AUTH] Erreur/timeout récupération rôle DB:', dbError.message);
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
          }
        } else {
          console.log('[AUTH] Aucune session active — nettoyage du cache');
          localStorage.removeItem('ab_user_cache');
          localStorage.removeItem('ab_user_cache_time');
          setUser(null);
        }

        // 2. Configurer l'écouteur d'événements
        console.log('[AUTH] Configuration de l\'écouteur d\'événements...');
        const res = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('[AUTH] Événement auth:', event, session?.user?.email);
            
            if (event === 'SIGNED_IN' && session) {
              // Récupérer le rôle depuis la DB avec timeout
              let roleFromJwt = session.user?.user_metadata?.role || session.user?.app_metadata?.role || 'client';
              
              try {
                // Ajouter un timeout pour éviter le blocage
                const dbQueryPromise = supabase
                  .from('users')
                  .select('role, first_name, last_name')
                  .eq('id', session.user.id)
                  .single();
                
                const timeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Timeout')), 3000)
                );
                
                const result = await Promise.race([dbQueryPromise, timeoutPromise]);
                
                if (!result.error && result.data) {
                  const dbUser = result.data;
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
                  // Erreur ou pas de données, utiliser les métadonnées
                  console.warn('[AUTH] Utilisation des métadonnées auth (RLS peut bloquer)');
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
                // Timeout ou autre erreur - utiliser les métadonnées auth
                console.warn('[AUTH] Erreur/timeout récupération rôle DB (SIGNED_IN):', dbError.message);
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
    forceRefreshRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};