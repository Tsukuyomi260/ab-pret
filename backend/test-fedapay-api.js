// Test de l'API FedaPay
const testFedaPayAPI = async () => {
  try {
    console.log('🧪 Test de l\'API FedaPay...');
    
    const response = await fetch('http://localhost:5000/api/fedapay/create-transaction', {
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

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Transaction créée avec succès:');
      console.log('   URL:', result.url);
      console.log('   Transaction ID:', result.transaction_id);
    } else {
      console.log('❌ Erreur:', result.error);
      console.log('   Détails:', result.details);
    }
    
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
  }
};

testFedaPayAPI(); 