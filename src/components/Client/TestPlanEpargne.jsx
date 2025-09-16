import React from 'react';
import { useParams } from 'react-router-dom';

const TestPlanEpargne = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test Plan Épargne - ID: {id}
        </h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Plan d'épargne créé avec succès !
          </h2>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                ✅ Le plan d'épargne a été créé avec l'ID: <strong>{id}</strong>
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                🎉 La redirection fonctionne correctement !
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                📝 Cette page de test confirme que le flux complet fonctionne :
                <br />1. Paiement FedaPay ✅
                <br />2. Redirection vers RetourEpargne ✅
                <br />3. Polling du backend ✅
                <br />4. Redirection vers PlanEpargne ✅
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPlanEpargne;
