import React, { useState, useEffect } from 'react';

const TestHealth = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
    } catch (err) {
      setError(err.message);
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
            <p className="text-red-700 font-semibold">Erreur:</p>
            <p className="text-red-600">{error}</p>
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
        </div>
      </div>
    </div>
  );
};

export default TestHealth; 