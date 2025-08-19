// Test simple de l'API
const testSimple = async () => {
  try {
    console.log('🧪 Test simple de l\'API...');
    
    // Test 1: Endpoint de santé
    const healthResponse = await fetch('http://localhost:5000/api/health');
    console.log('✅ Health check:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   Data:', healthData);
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
};

testSimple(); 