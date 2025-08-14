import React, { useState } from 'react';
import axios from 'axios';

const TestOTP = () => {
  const [phoneNumber, setPhoneNumber] = useState('+22912345678');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testOTP = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🧪 Test OTP pour:', phoneNumber);
      
      const response = await axios.post('/api/sms/send-otp', {
        phoneNumber,
        otp: '123456',
        userName: 'Test User'
      });
      
      console.log('📤 Réponse:', response.data);
      setResult({
        success: true,
        data: response.data
      });
    } catch (error) {
      console.error('❌ Erreur:', error);
      setResult({
        success: false,
        error: error.response?.data?.error || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Test OTP</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Numéro de téléphone:</label>
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="+22912345678"
        />
      </div>
      
      <button
        onClick={testOTP}
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Test en cours...' : 'Tester OTP'}
      </button>
      
      {result && (
        <div className="mt-4 p-3 rounded">
          {result.success ? (
            <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded">
              <h3 className="font-bold">✅ Succès</h3>
              <pre className="text-sm mt-2">{JSON.stringify(result.data, null, 2)}</pre>
            </div>
          ) : (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
              <h3 className="font-bold">❌ Erreur</h3>
              <p>{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestOTP;

