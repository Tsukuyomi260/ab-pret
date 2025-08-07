import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { 
  signUpWithEmail, 
  signInWithEmail, 
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
    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Récupérer les données utilisateur complètes
          const result = await getCurrentUser();
          if (result.success) {
            setUser(result.user);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Vérifier l'utilisateur actuel au chargement
    const checkUser = async () => {
      try {
        const result = await getCurrentUser();
        if (result.success) {
          setUser(result.user);
        }
      } catch (error) {
        console.error('[AUTH] Erreur lors de la vérification utilisateur:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials) => {
    try {
      const result = await signInWithEmail(credentials.email, credentials.password);
      
      if (result.success) {
        // L'utilisateur sera automatiquement mis à jour via onAuthStateChange
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
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
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('[AUTH] Erreur lors de la déconnexion:', error);
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