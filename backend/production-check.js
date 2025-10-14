#!/usr/bin/env node
// Vérification complète pour la production
require('dotenv').config({ path: '.env.local' });
const chalk = require('chalk');

console.log('\n' + '='.repeat(60));
console.log('  🚀 VÉRIFICATION PRODUCTION - AB CAMPUS FINANCE');
console.log('='.repeat(60) + '\n');

let errors = 0;
let warnings = 0;

// Fonction helper pour afficher les résultats
function checkItem(name, condition, errorMsg = '', warnMsg = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    return true;
  } else if (warnMsg) {
    console.log(`⚠️  ${name} - ${warnMsg}`);
    warnings++;
    return false;
  } else {
    console.log(`❌ ${name} - ${errorMsg}`);
    errors++;
    return false;
  }
}

// 1. VAPID Keys
console.log('\n📬 NOTIFICATIONS PUSH\n');
checkItem(
  'Clé publique VAPID',
  !!process.env.VAPID_PUBLIC_KEY,
  'VAPID_PUBLIC_KEY manquante dans .env.local'
);
checkItem(
  'Clé privée VAPID',
  !!process.env.VAPID_PRIVATE_KEY,
  'VAPID_PRIVATE_KEY manquante dans .env.local'
);

// 2. FedaPay
console.log('\n💳 PAIEMENTS FEDAPAY\n');
const fedapayPublic = process.env.FEDAPAY_PUBLIC_KEY;
const fedapaySecret = process.env.FEDAPAY_SECRET_KEY;
const fedapayUrl = process.env.FEDAPAY_BASE_URL;

checkItem(
  'Clé publique FedaPay',
  !!fedapayPublic,
  'FEDAPAY_PUBLIC_KEY manquante'
);

checkItem(
  'Clé secrète FedaPay',
  !!fedapaySecret,
  'FEDAPAY_SECRET_KEY manquante'
);

checkItem(
  'URL FedaPay',
  !!fedapayUrl,
  'FEDAPAY_BASE_URL manquante'
);

// Vérifier le mode LIVE
if (fedapaySecret) {
  const isLive = fedapaySecret.startsWith('sk_live_');
  const isSandbox = fedapaySecret.startsWith('sk_sandbox_');
  
  if (isLive) {
    console.log(`✅ Mode FedaPay: LIVE (production)`);
  } else if (isSandbox) {
    console.log(`⚠️  Mode FedaPay: SANDBOX (test)`);
    warnings++;
  } else {
    console.log(`❌ Mode FedaPay: INCONNU (clé invalide)`);
    errors++;
  }
}

// Vérifier la cohérence URL/Clés
if (fedapaySecret && fedapayUrl) {
  const isLiveKey = fedapaySecret.startsWith('sk_live_');
  const isLiveUrl = !fedapayUrl.includes('sandbox');
  
  if (isLiveKey === isLiveUrl) {
    console.log(`✅ Cohérence clés/URL FedaPay`);
  } else {
    console.log(`❌ INCOHÉRENCE: Clés ${isLiveKey ? 'LIVE' : 'SANDBOX'} avec URL ${isLiveUrl ? 'LIVE' : 'SANDBOX'}`);
    errors++;
  }
}

// Vérifier l'URL (pas de /ID)
if (fedapayUrl) {
  if (fedapayUrl.endsWith('/ID') || fedapayUrl.includes('/transactions/ID')) {
    console.log(`❌ URL FedaPay incorrecte (contient /ID)`);
    console.log(`   Actuel:  ${fedapayUrl}`);
    console.log(`   Correct: https://api.fedapay.com`);
    errors++;
  }
}

checkItem(
  'Devise FedaPay',
  !!process.env.FEDAPAY_CURRENCY,
  '',
  'FEDAPAY_CURRENCY non définie (utilisera XOF par défaut)'
);

checkItem(
  'Pays FedaPay',
  !!process.env.FEDAPAY_COUNTRY,
  '',
  'FEDAPAY_COUNTRY non définie (utilisera BJ par défaut)'
);

// 3. Supabase
console.log('\n🗄️  BASE DE DONNÉES SUPABASE\n');
const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

checkItem(
  'URL Supabase',
  !!supabaseUrl,
  '',
  'Variable Supabase non trouvée dans .env.local (peut être ailleurs)'
);

checkItem(
  'Clé Supabase',
  !!supabaseKey,
  '',
  'Variable Supabase non trouvée dans .env.local (peut être ailleurs)'
);

// 4. URLs Application
console.log('\n🌐 URLS APPLICATION\n');
checkItem(
  'Backend URL',
  !!process.env.BACKEND_URL,
  '',
  'BACKEND_URL non définie (utilisera la valeur par défaut)'
);

checkItem(
  'Frontend URL',
  !!process.env.FRONTEND_URL,
  '',
  'FRONTEND_URL non définie (utilisera la valeur par défaut)'
);

// Résumé final
console.log('\n' + '='.repeat(60));
console.log('  📊 RÉSUMÉ');
console.log('='.repeat(60) + '\n');

if (errors === 0 && warnings === 0) {
  console.log('🎉 PARFAIT ! Tout est configuré correctement.\n');
  console.log('✅ Votre application est PRÊTE pour la production !\n');
  process.exit(0);
} else if (errors === 0) {
  console.log(`⚠️  ${warnings} avertissement(s) trouvé(s).\n`);
  console.log('💡 L\'application peut fonctionner, mais vérifiez les warnings ci-dessus.\n');
  process.exit(0);
} else {
  console.log(`❌ ${errors} erreur(s) et ${warnings} avertissement(s) trouvé(s).\n`);
  console.log('🔧 Corrigez les erreurs avant de déployer en production.\n');
  console.log('📝 Consultez: PRODUCTION_READY_CHECKLIST.md\n');
  process.exit(1);
}

