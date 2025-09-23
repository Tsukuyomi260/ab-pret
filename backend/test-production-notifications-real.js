// Test des notifications en production réelle
const { createClient } = require('@supabase/supabase-js');

// Load env from .env.local first, then .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration PRODUCTION
const PRODUCTION_BACKEND_URL = 'https://ab-pret-back.onrender.com';

console.log('🧪 Test des notifications en PRODUCTION...\n');
console.log('🔧 Configuration:');
console.log(`   Backend URL: ${PRODUCTION_BACKEND_URL}`);
console.log(`   Supabase URL: ${supabaseUrl}`);
console.log(`   VAPID Public Key: ${process.env.VAPID_PUBLIC_KEY ? '✅ Configuré' : '❌ Manquant'}`);
console.log(`   VAPID Private Key: ${process.env.VAPID_PRIVATE_KEY ? '✅ Configuré' : '❌ Manquant'}\n`);

async function testProductionNotifications() {
  try {
    // 1. Vérifier que le backend en production répond
    console.log('1. 🌐 Vérification du backend en production...');
    try {
      const healthResponse = await fetch(`${PRODUCTION_BACKEND_URL}/api/health`);
      const healthData = await healthResponse.json();
      console.log(`   ✅ Backend accessible: ${JSON.stringify(healthData)}`);
    } catch (error) {
      console.log(`   ❌ Backend inaccessible: ${error.message}`);
      return;
    }

    // 2. Vérifier la clé publique VAPID en production
    console.log('\n2. 🔑 Vérification de la clé VAPID en production...');
    try {
      const vapidResponse = await fetch(`${PRODUCTION_BACKEND_URL}/api/push/vapid-public-key`);
      const vapidData = await vapidResponse.json();
      console.log(`   ✅ Clé VAPID publique: ${vapidData.publicKey}`);
      
      if (vapidData.publicKey === 'your_vapid_public_key_here') {
        console.log('   ⚠️  Clé VAPID par défaut détectée - les notifications ne fonctionneront pas');
      }
    } catch (error) {
      console.log(`   ❌ Erreur récupération clé VAPID: ${error.message}`);
    }

    // 3. Récupérer les utilisateurs et leurs abonnements
    console.log('\n3. 👥 Vérification des abonnements push...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, role, email')
      .limit(10);

    if (usersError) {
      console.error('   ❌ Erreur récupération utilisateurs:', usersError);
      return;
    }

    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('user_id, subscription, created_at')
      .order('created_at', { ascending: false });

    if (subsError) {
      console.error('   ❌ Erreur récupération abonnements:', subsError);
      return;
    }

    console.log(`   📱 Total abonnements: ${subscriptions.length}`);
    
    // Grouper par utilisateur
    const subscriptionsByUser = {};
    subscriptions.forEach(sub => {
      if (!subscriptionsByUser[sub.user_id]) {
        subscriptionsByUser[sub.user_id] = [];
      }
      subscriptionsByUser[sub.user_id].push(sub);
    });

    console.log(`   👥 Utilisateurs avec abonnements: ${Object.keys(subscriptionsByUser).length}`);
    
    // Afficher les détails
    for (const [userId, userSubs] of Object.entries(subscriptionsByUser)) {
      const user = users.find(u => u.id === userId);
      const userName = user ? `${user.first_name} ${user.last_name}` : 'Utilisateur inconnu';
      const userRole = user ? user.role : 'inconnu';
      console.log(`   📱 ${userName} (${userRole}): ${userSubs.length} abonnement(s)`);
    }

    // 4. Tester les notifications en production
    console.log('\n4. 🚀 Test des notifications en production...\n');

    const testUser = users.find(u => u.role === 'client' && subscriptionsByUser[u.id]) || users[0];
    const adminUser = users.find(u => u.role === 'admin' && subscriptionsByUser[u.id]) || users.find(u => u.role === 'admin');

    if (!testUser) {
      console.log('   ❌ Aucun utilisateur test trouvé');
      return;
    }

    console.log(`   👤 Utilisateur test: ${testUser.first_name} ${testUser.last_name}`);
    console.log(`   👨‍💼 Admin: ${adminUser ? `${adminUser.first_name} ${adminUser.last_name}` : 'Non trouvé'}\n`);

    const testCases = [
      {
        name: 'Notification admin - Nouvelle demande de prêt',
        endpoint: '/api/notify-admin-new-loan',
        payload: {
          loanAmount: 30000,
          clientName: `${testUser.first_name} ${testUser.last_name}`,
          loanId: 'test-production-' + Date.now()
        }
      },
      {
        name: 'Notification client - Prêt approuvé',
        endpoint: '/api/notify-loan-approval',
        payload: {
          userId: testUser.id,
          loanAmount: 30000,
          loanId: 'test-production-' + Date.now()
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`   🧪 Test: ${testCase.name}`);
      console.log(`   📡 Endpoint: ${PRODUCTION_BACKEND_URL}${testCase.endpoint}`);
      
      try {
        const startTime = Date.now();
        const response = await fetch(`${PRODUCTION_BACKEND_URL}${testCase.endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testCase.payload)
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        const result = await response.json();
        
        console.log(`   ⏱️  Temps de réponse: ${responseTime}ms`);
        console.log(`   📊 Status: ${response.status}`);
        
        if (response.ok && result.success) {
          console.log(`   ✅ Succès: ${result.message || 'Notification envoyée'}`);
          if (result.notificationsSent) {
            console.log(`   📱 Notifications push envoyées: ${result.notificationsSent}`);
          }
          if (result.errors) {
            console.log(`   ⚠️  Erreurs: ${result.errors}`);
          }
        } else {
          console.log(`   ❌ Échec: ${result.error || 'Erreur inconnue'}`);
          console.log(`   📄 Réponse complète:`, JSON.stringify(result, null, 2));
        }
      } catch (error) {
        console.log(`   ❌ Erreur réseau: ${error.message}`);
      }
      
      console.log(''); // Ligne vide
    }

    // 5. Vérifier les logs du backend en production
    console.log('5. 📋 Recommandations pour le debugging:');
    console.log('   🔍 Vérifiez les logs du backend Render:');
    console.log('   1. Allez sur https://dashboard.render.com');
    console.log('   2. Sélectionnez votre service backend');
    console.log('   3. Allez dans l\'onglet "Logs"');
    console.log('   4. Cherchez les messages [ADMIN_NOTIFICATION] ou [LOAN_APPROVAL]');
    console.log('');
    console.log('   🔧 Vérifications à faire:');
    console.log('   - Les clés VAPID sont-elles configurées en production ?');
    console.log('   - Les variables d\'environnement sont-elles correctes ?');
    console.log('   - Les abonnements push sont-ils valides ?');
    console.log('   - Le service web-push fonctionne-t-il ?');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter les tests
testProductionNotifications().then(() => {
  console.log('\n✅ Test terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
