// Configuration du backend selon l'environnement
const getBackendUrl = () => {
  // En production, utiliser l'URL Render
  if (process.env.NODE_ENV === 'production') {
    return 'https://ab-pret-back.onrender.com';
  }
  
  // En développement, utiliser l'URL locale ou celle définie dans .env
  return process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
};

const BACKEND_URL = getBackendUrl();

// Log pour debug
console.log('[CONFIG] Backend URL:', BACKEND_URL);
console.log('[CONFIG] Environment:', process.env.NODE_ENV);

// Export nommé et par défaut
export { BACKEND_URL };
export default BACKEND_URL;
