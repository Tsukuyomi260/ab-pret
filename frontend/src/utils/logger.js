// Utilitaire pour les logs sécurisés
// NE JAMAIS logger de données sensibles (mots de passe, tokens, données personnelles)

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  // Logs d'information généraux
  info: (message, data = null) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, data ? '[DATA_MASKED]' : '');
    }
  },

  // Logs d'erreur sécurisés
  error: (context, error) => {
    if (isDevelopment) {
      // Ne jamais logger l'objet error complet, seulement le message
      const errorMessage = error?.message || error?.toString() || 'Erreur inconnue';
      console.error(`[ERROR][${context}] ${errorMessage}`);
    }
  },

  // Logs de debug (uniquement en développement)
  debug: (message, data = null) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, data ? '[DATA_MASKED]' : '');
    }
  },

  // Logs de sécurité
  security: (event, details = null) => {
    if (isDevelopment) {
      console.log(`[SECURITY] ${event}`, details ? '[DETAILS_MASKED]' : '');
    }
  },

  // Logs d'API
  api: (endpoint, method, status = null) => {
    if (isDevelopment) {
      console.log(`[API] ${method} ${endpoint}`, status ? `- ${status}` : '');
    }
  }
};

// Règles de sécurité pour les logs :
// 1. Ne jamais logger de mots de passe
// 2. Ne jamais logger de tokens d'authentification
// 3. Ne jamais logger d'informations personnelles (email, téléphone, etc.)
// 4. Ne jamais logger de données financières
// 5. Utiliser des préfixes pour identifier le contexte
// 6. En production, désactiver tous les logs de debug
// 7. Logger seulement les messages d'erreur essentiels
