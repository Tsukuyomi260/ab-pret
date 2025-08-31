const fetch = require('node-fetch');

// Simuler différents formats de webhook FedaPay
const testWebhooks = [
  // Format 1: Standard
  {
    name: 'Format Standard',
    data: {
      transaction: {
        id: 'test_transaction_123',
        status: 'approved',
        amount: 50000,
        metadata: {
          loan_id: 1,
          user_id: 1,
          type: 'loan_repayment'
        },
        payment_method: {
          brand: 'MTN',
          type: 'mobile_money'
        },
        paid_at: new Date().toISOString()
      }
    }
  },
  
  // Format 2: Direct
  {
    name: 'Format Direct',
    data: {
      id: 'test_transaction_456',
      status: 'approved',
      amount: 50000,
      metadata: {
        loan_id: 1,
        user_id: 1,
        type: 'loan_repayment'
      },
      payment_method: {
        brand: 'MTN',
        type: 'mobile_money'
      },
      paid_at: new Date().toISOString()
    }
  },
  
  // Format 3: Avec data
  {
    name: 'Format avec data',
    data: {
      data: {
        id: 'test_transaction_789',
        status: 'approved',
        amount: 50000,
        metadata: {
          loan_id: 1,
          user_id: 1,
          type: 'loan_repayment'
        },
        payment_method: {
          brand: 'MTN',
          type: 'mobile_money'
        },
        paid_at: new Date().toISOString()
      }
    }
  }
];

async function testWebhook(format) {
  console.log(`\n🧪 Test du webhook: ${format.name}`);
  console.log('Données envoyées:', JSON.stringify(format.data, null, 2));
  
  try {
    const response = await fetch('http://localhost:5000/api/fedapay/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FedaPay-Webhook/1.0'
      },
      body: JSON.stringify(format.data)
    });
    
    const result = await response.json();
    
    console.log('📊 Réponse du serveur:');
    console.log('- Status:', response.status);
    console.log('- Body:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Test réussi !');
    } else {
      console.log('❌ Test échoué !');
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Démarrage des tests de webhook...');
  console.log('Assurez-vous que le serveur tourne sur http://localhost:5000');
  
  for (const format of testWebhooks) {
    await testWebhook(format);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pause entre les tests
  }
  
  console.log('\n🎯 Tests terminés !');
}

// Exécuter les tests
runAllTests(); 