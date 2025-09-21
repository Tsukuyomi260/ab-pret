import React, { useState, useEffect } from 'react';

const TestHealth = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Test de la route /api/health...');
      
      const response = await fetch('/api/health');
      console.log('📡 Réponse reçue:', response.status, response.statusText);
      
      // Vérifier si la réponse est OK
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Vérifier le type de contenu
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Type de contenu invalide: ${contentType}`);
      }
      
      // Lire le texte brut d'abord pour debug
      const text = await response.text();
      console.log('📄 Contenu brut:', text);
      
      if (!text || text.trim() === '') {
        throw new Error('Réponse vide du serveur');
      }
      
      // Parser le JSON
      const data = JSON.parse(text);
      console.log('✅ JSON parsé:', data);
      
      setHealthStatus(data);
      
    } catch (err) {
      console.error('❌ Erreur lors du test:', err);
      
      // Messages d'erreur plus spécifiques
      let errorMessage = err.message;
      
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Impossible de se connecter au serveur API. Vérifiez que le serveur est démarré (npm run start:api)';
      } else if (err.message.includes('Unexpected end of JSON input')) {
        errorMessage = 'Réponse invalide du serveur. Le serveur API pourrait ne pas être démarré.';
      } else if (err.message.includes('HTTP')) {
        errorMessage = `Erreur HTTP: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Test API Health</h1>
        
        {loading && (
          <div className="mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Test en cours...</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-semibold">❌ Erreur:</p>
            <p className="text-red-600 text-sm">{error}</p>
            <div className="mt-3 text-xs text-red-500">
              <p>💡 Solutions possibles:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Démarrer le serveur API: <code>npm run start:api</code></li>
                <li>Vérifier que le port 5000 est libre</li>
                <li>Redémarrer l'application React</li>
              </ul>
            </div>
          </div>
        )}

        {healthStatus && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-semibold">✅ API fonctionnelle</p>
            <pre className="text-sm text-green-600 mt-2">
              {JSON.stringify(healthStatus, null, 2)}
            </pre>
          </div>
        )}

        <button
          onClick={testHealth}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Test en cours...' : 'Tester à nouveau'}
        </button>

        <div className="mt-6 text-sm text-gray-500">
          <p>Cette page teste la route <code>/api/health</code></p>
          <p>via le proxy de développement.</p>
          <p className="mt-2 text-xs">
            Serveur API: localhost:5000<br/>
            Frontend: localhost:3001
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestHealth; 