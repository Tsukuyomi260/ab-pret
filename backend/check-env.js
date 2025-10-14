// Script de vérification des variables d'environnement FedaPay
require('dotenv').config({ path: '.env.local' });

console.log('\n=== 🔍 Vérification Configuration FedaPay ===\n');

const checks = [
  { name: 'FEDAPAY_PUBLIC_KEY', value: process.env.FEDAPAY_PUBLIC_KEY },
  { name: 'FEDAPAY_SECRET_KEY', value: process.env.FEDAPAY_SECRET_KEY },
  { name: 'FEDAPAY_BASE_URL', value: process.env.FEDAPAY_BASE_URL },
  { name: 'FEDAPAY_CURRENCY', value: process.env.FEDAPAY_CURRENCY },
  { name: 'FEDAPAY_COUNTRY', value: process.env.FEDAPAY_COUNTRY }
];

let allGood = true;

checks.forEach(check => {
  if (check.value) {
    // Masquer partiellement les clés sensibles
    let displayValue = check.value;
    if (check.name.includes('KEY')) {
      displayValue = check.value.substring(0, 15) + '***' + check.value.substring(check.value.length - 4);
    }
    console.log(`✅ ${check.name}: ${displayValue}`);
  } else {
    console.log(`❌ ${check.name}: MANQUANT`);
    allGood = false;
  }
});

console.log('\n=== 🎯 Détection du mode ===\n');

if (process.env.FEDAPAY_SECRET_KEY) {
  if (process.env.FEDAPAY_SECRET_KEY.startsWith('sk_live_')) {
    console.log('🔴 Mode: LIVE (PRODUCTION)');
    console.log('URL attendue: https://api.fedapay.com');
    
    if (process.env.FEDAPAY_BASE_URL && !process.env.FEDAPAY_BASE_URL.includes('sandbox')) {
      console.log('✅ URL correcte pour le mode LIVE');
    } else {
      console.log('⚠️  ATTENTION: URL incorrecte pour le mode LIVE !');
      allGood = false;
    }
  } else if (process.env.FEDAPAY_SECRET_KEY.startsWith('sk_sandbox_')) {
    console.log('🟡 Mode: SANDBOX (TEST)');
    console.log('URL attendue: https://sandbox-api.fedapay.com');
    
    if (process.env.FEDAPAY_BASE_URL && process.env.FEDAPAY_BASE_URL.includes('sandbox')) {
      console.log('✅ URL correcte pour le mode SANDBOX');
    } else {
      console.log('⚠️  ATTENTION: URL incorrecte pour le mode SANDBOX !');
      allGood = false;
    }
  } else {
    console.log('❓ Mode inconnu (clé invalide)');
    allGood = false;
  }
}

console.log('\n=== 📊 Résultat ===\n');

if (allGood) {
  console.log('✅ Configuration FedaPay OK ! Vous pouvez lancer le serveur.\n');
  process.exit(0);
} else {
  console.log('❌ Configuration FedaPay INCORRECTE ! Vérifiez votre .env.local\n');
  console.log('📝 Consultez: backend/URGENT_FEDAPAY_FIX.md\n');
  process.exit(1);
}

