// Test simple pour vérifier la route /api/health
const testHealthEndpoint = async () => {
  console.log('🧪 Test de la route /api/health...\n');

  try {
    // Test direct sur le port 5000
    console.log('1. Test direct sur localhost:5000...');
    const response5000 = await fetch('http://localhost:5000/api/health');
    const data5000 = await response5000.json();
    console.log('✅ Port 5000:', data5000);

    // Test via proxy sur le port 3000
    console.log('\n2. Test via proxy sur localhost:3000...');
    const response3000 = await fetch('http://localhost:3000/api/health');
    const data3000 = await response3000.json();
    console.log('✅ Port 3000 (proxy):', data3000);

    console.log('\n🎉 Tous les tests sont passés !');
    console.log('📝 Note: Le proxy fonctionne correctement pour les requêtes AJAX.');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Solution:');
      console.log('1. Démarrez le serveur API: npm run start:api');
      console.log('2. Démarrez l\'app React: npm start');
      console.log('3. Relancez ce test');
    }
  }
};

// Lancer le test
testHealthEndpoint(); 