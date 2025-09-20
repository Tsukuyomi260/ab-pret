// Script pour vérifier la configuration FedaPay
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Vérification de la configuration FedaPay...\n');

const requiredVars = [
  'FEDAPAY_SECRET_KEY',
  'FEDAPAY_PUBLIC_KEY',
  'FEDAPAY_ENVIRONMENT'
];

let allConfigured = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: NON CONFIGURÉE`);
    allConfigured = false;
  }
});

console.log('\n📋 Configuration actuelle:');
console.log(`- Environment: ${process.env.FEDAPAY_ENVIRONMENT || 'NON CONFIGURÉ'}`);
console.log(`- Base URL: ${process.env.FEDAPAY_BASE_URL || 'https://api.fedapay.com/v1'}`);
console.log(`- Currency: ${process.env.FEDAPAY_CURRENCY || 'XOF'}`);
console.log(`- Country: ${process.env.FEDAPAY_COUNTRY || 'BJ'}`);

if (allConfigured) {
  console.log('\n🎉 Configuration FedaPay complète !');
  console.log('✅ Vous pouvez maintenant utiliser FedaPay en mode sandbox');
} else {
  console.log('\n⚠️ Configuration FedaPay incomplète !');
  console.log('📝 Veuillez ajouter les variables manquantes dans .env.local');
  console.log('\nExemple de configuration:');
  console.log('FEDAPAY_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  console.log('FEDAPAY_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  console.log('FEDAPAY_ENVIRONMENT=sandbox');
} 