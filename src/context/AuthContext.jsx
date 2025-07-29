// ===== src/context/AuthContext.jsx =====
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Données simulées pour le développement
const mockUsers = [
  {
    id: 1,
    firstName: 'Client',
    lastName: 'Test',
    email: 'client@test.com',
    role: 'client',
    phone: '+229 90 00 00 00'
  },
  {
    id: 2,
    firstName: 'Abel',
    lastName: 'Viakinnou',
    email: 'admin@test.com',
    role: 'admin',
    phone: '+229 90 00 00 01'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('ab_pret_token'));

  useEffect(() => {
    const validateToken = async () => {
      try {
        // Simulation de validation de token
        const storedUser = localStorage.getItem('ab_pret_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          logout();
        }
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      // Vérifier la validité du token
      validateToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      // Simulation de validation de token
      const storedUser = localStorage.getItem('ab_pret_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        logout();
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vérifier les credentials
      const mockUser = mockUsers.find(u => 
        u.email === credentials.email && 
        (credentials.password === 'password123' || credentials.password === 'admin123')
      );
      
      if (mockUser) {
        const token = `mock_token_${mockUser.id}`;
        const user = mockUser;
        
        localStorage.setItem('ab_pret_token', token);
        localStorage.setItem('ab_pret_user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        
        return { success: true, user };
      } else {
        return { 
          success: false, 
          error: 'Email ou mot de passe incorrect' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Erreur de connexion' 
      };
    }
  };

  const register = async (userData) => {
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vérifier si l'email existe déjà
      const existingUser = mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        return { 
          success: false, 
          error: 'Cet email est déjà utilisé' 
        };
      }
      
      // Créer un nouvel utilisateur
      const newUser = {
        id: mockUsers.length + 1,
        ...userData,
        role: 'client'
      };
      
      const token = `mock_token_${newUser.id}`;
      
      localStorage.setItem('ab_pret_token', token);
      localStorage.setItem('ab_pret_user', JSON.stringify(newUser));
      setToken(token);
      setUser(newUser);
      
      return { success: true, user: newUser };
    } catch (error) {
      return { 
        success: false, 
        error: 'Erreur d\'inscription' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('ab_pret_token');
    localStorage.removeItem('ab_pret_user');
    setToken(null);
    setUser(null);
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