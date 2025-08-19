// Test du serveur avec démarrage automatique
const { spawn } = require('child_process');
const fetch = require('node-fetch');

let serverProcess = null;

const startServer = () => {
  return new Promise((resolve, reject) => {
    console.log('🚀 Démarrage du serveur...');
    
    serverProcess = spawn('node', ['server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    
    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log('📡 Serveur:', data.toString().trim());
      
      // Si on voit le message de démarrage, le serveur est prêt
      if (output.includes('API server listening on port 5000')) {
        setTimeout(() => resolve(), 1000); // Attendre 1 seconde
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('❌ Erreur serveur:', data.toString());
    });

    serverProcess.on('error', (error) => {
      console.error('❌ Erreur démarrage serveur:', error);
      reject(error);
    });

    // Timeout après 10 secondes
    setTimeout(() => {
      if (!output.includes('API server listening on port 5000')) {
        reject(new Error('Timeout - serveur non démarré'));
      }
    }, 10000);
  });
};

const testAPI = async () => {
  try {
    console.log('🧪 Test de l\'API...');
    
    // Test 1: Health check
    const healthResponse = await fetch('http://localhost:5000/api/health');
    console.log('✅ Health check:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   Data:', healthData);
      
      // Test 2: FedaPay transaction
      console.log('🧪 Test FedaPay...');
      const fedapayResponse = await fetch('http://localhost:5000/api/fedapay/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: 5000,
          loanId: 1,
          userId: 1,
          description: "Test remboursement",
          customerEmail: "test@example.com",
          customerName: "Test User",
          customerPhone: "+22990123456"
        })
      });

      const fedapayData = await fedapayResponse.json();
      
      if (fedapayResponse.ok) {
        console.log('✅ Transaction créée:', fedapayData);
      } else {
        console.log('❌ Erreur FedaPay:', fedapayData);
      }
    }
    
  } catch (error) {
    console.log('❌ Erreur test:', error.message);
  }
};

const stopServer = () => {
  if (serverProcess) {
    console.log('🛑 Arrêt du serveur...');
    serverProcess.kill();
  }
};

// Exécution principale
const main = async () => {
  try {
    await startServer();
    await testAPI();
  } catch (error) {
    console.error('❌ Erreur principale:', error.message);
  } finally {
    stopServer();
  }
};

main(); 