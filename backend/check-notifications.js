// Script de vérification du système de notifications push
require('dotenv').config({ path: '.env.local' });

console.log('\n=== 🔔 Vérification Système de Notifications Push ===\n');

// 1. Vérifier les clés VAPID
console.log('1️⃣ Clés VAPID:');
const vapidPublic = process.env.VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

if (vapidPublic && vapidPrivate) {
  console.log(`   ✅ VAPID_PUBLIC_KEY: ${vapidPublic.substring(0, 20)}...`);
  console.log(`   ✅ VAPID_PRIVATE_KEY: ${vapidPrivate.substring(0, 20)}...`);
} else {
  console.log('   ❌ Clés VAPID manquantes !');
  console.log('   💡 Générez-les avec: node generate-vapid-keys.js');
}

// 2. Vérifier les clés FedaPay
console.log('\n2️⃣ Clés FedaPay:');
const fedapayPublic = process.env.FEDAPAY_PUBLIC_KEY;
const fedapaySecret = process.env.FEDAPAY_SECRET_KEY;
const fedapayUrl = process.env.FEDAPAY_BASE_URL;

if (fedapayPublic && fedapaySecret) {
  console.log(`   ✅ FEDAPAY_PUBLIC_KEY: ${fedapayPublic.substring(0, 15)}...`);
  console.log(`   ✅ FEDAPAY_SECRET_KEY: ${fedapaySecret.substring(0, 15)}...`);
} else {
  console.log('   ❌ Clés FedaPay manquantes !');
}

if (fedapayUrl) {
  console.log(`   ✅ FEDAPAY_BASE_URL: ${fedapayUrl}`);
  
  // Vérifier la cohérence
  if (fedapaySecret) {
    if (fedapaySecret.startsWith('sk_live_') && !fedapayUrl.includes('sandbox')) {
      console.log('   ✅ Mode LIVE correctement configuré');
    } else if (fedapaySecret.startsWith('sk_sandbox_') && fedapayUrl.includes('sandbox')) {
      console.log('   ✅ Mode SANDBOX correctement configuré');
    } else {
      console.log('   ⚠️  ATTENTION: Incohérence entre les clés et l\'URL !');
    }
  }
} else {
  console.log('   ❌ FEDAPAY_BASE_URL manquante !');
}

// 3. Vérifier Supabase
console.log('\n3️⃣ Configuration Supabase:');
const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  console.log(`   ✅ SUPABASE_URL: ${supabaseUrl.substring(0, 30)}...`);
  console.log(`   ✅ SUPABASE_KEY: ${supabaseKey.substring(0, 20)}...`);
} else {
  console.log('   ⚠️  Variables Supabase non trouvées dans .env.local');
  console.log('   💡 Cela peut être normal si elles sont ailleurs');
}

// 4. Vérifier les URLs
console.log('\n4️⃣ URLs de l\'application:');
const backendUrl = process.env.BACKEND_URL;
const frontendUrl = process.env.FRONTEND_URL;

if (backendUrl) {
  console.log(`   ✅ BACKEND_URL: ${backendUrl}`);
} else {
  console.log('   ⚠️  BACKEND_URL non définie (utilisera la valeur par défaut)');
}

if (frontendUrl) {
  console.log(`   ✅ FRONTEND_URL: ${frontendUrl}`);
} else {
  console.log('   ⚠️  FRONTEND_URL non définie (utilisera la valeur par défaut)');
}

// 5. Résumé pour la production
console.log('\n=== 📋 Résumé Production ===\n');

const checks = {
  vapid: !!(vapidPublic && vapidPrivate),
  fedapay: !!(fedapayPublic && fedapaySecret && fedapayUrl),
  fedapayMode: fedapaySecret && fedapaySecret.startsWith('sk_live_') && fedapayUrl && !fedapayUrl.includes('sandbox')
};

console.log('Notifications Push:', checks.vapid ? '✅ OK' : '❌ NON CONFIGURÉ');
console.log('Paiements FedaPay:', checks.fedapay ? '✅ OK' : '❌ NON CONFIGURÉ');
console.log('Mode Production FedaPay:', checks.fedapayMode ? '✅ LIVE' : '⚠️  SANDBOX ou incorrecte');

if (checks.vapid && checks.fedapay) {
  console.log('\n✅ Système prêt pour la production !\n');
  process.exit(0);
} else {
  console.log('\n❌ Configuration incomplète. Voir les détails ci-dessus.\n');
  
  if (!checks.vapid) {
    console.log('📝 Pour générer les clés VAPID:');
    console.log('   cd backend && node generate-vapid-keys.js\n');
  }
  
  if (!checks.fedapay) {
    console.log('📝 Consultez: backend/URGENT_FEDAPAY_FIX.md\n');
  }
  
  process.exit(1);
}

