// Script de test complet pour vérifier toutes les notifications en production
const { createClient } = require('@supabase/supabase-js');
const webPush = require('./config/push');

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

// Configuration
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://ab-pret-back.onrender.com' 
  : 'http://localhost:5000';

console.log('🧪 Test des notifications en production...\n');
console.log('🔧 Configuration:');
console.log(`   Backend URL: ${BACKEND_URL}`);
console.log(`   Supabase URL: ${supabaseUrl}`);
console.log(`   VAPID Public Key: ${process.env.VAPID_PUBLIC_KEY ? '✅ Configuré' : '❌ Manquant'}`);
console.log(`   VAPID Private Key: ${process.env.VAPID_PRIVATE_KEY ? '✅ Configuré' : '❌ Manquant'}\n`);

async function testNotifications() {
  try {
    // 1. Vérifier la configuration VAPID
    console.log('1. 🔑 Vérification de la configuration VAPID...');
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.log('   ❌ Clés VAPID manquantes - les notifications push ne fonctionneront pas');
      return;
    }
    console.log('   ✅ Clés VAPID configurées\n');

    // 2. Récupérer un utilisateur test et un admin
    console.log('2. 👥 Récupération des utilisateurs...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, role, email')
      .limit(5);

    if (usersError) {
      console.error('   ❌ Erreur récupération utilisateurs:', usersError);
      return;
    }

    const testUser = users.find(u => u.role !== 'admin') || users[0];
    const adminUser = users.find(u => u.role === 'admin') || users[0];

    console.log(`   ✅ Utilisateur test: ${testUser.first_name} ${testUser.last_name} (${testUser.role})`);
    console.log(`   ✅ Admin: ${adminUser.first_name} ${adminUser.last_name} (${adminUser.role})\n`);

    // 3. Vérifier les abonnements push
    console.log('3. 📱 Vérification des abonnements push...');
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('user_id, subscription')
      .in('user_id', [testUser.id, adminUser.id]);

    if (subsError) {
      console.error('   ❌ Erreur récupération abonnements:', subsError);
      return;
    }

    const userSubscriptions = subscriptions.filter(s => s.user_id === testUser.id);
    const adminSubscriptions = subscriptions.filter(s => s.user_id === adminUser.id);

    console.log(`   📱 Abonnements utilisateur: ${userSubscriptions.length}`);
    console.log(`   📱 Abonnements admin: ${adminSubscriptions.length}\n`);

    if (userSubscriptions.length === 0 && adminSubscriptions.length === 0) {
      console.log('   ⚠️  Aucun abonnement trouvé - les notifications push ne fonctionneront pas');
      console.log('   💡 Les utilisateurs doivent s\'abonner aux notifications depuis l\'application\n');
    }

    // 4. Tester les notifications via l'API backend
    console.log('4. 🚀 Test des notifications via API backend...\n');

    const testCases = [
      {
        name: 'Notification admin - Nouvelle demande de prêt',
        endpoint: '/api/notify-admin-new-loan',
        payload: {
          loanAmount: 25000,
          clientName: `${testUser.first_name} ${testUser.last_name}`,
          loanId: 'test-loan-' + Date.now()
        },
        expectedTitle: "AB Campus Finance - Nouvelle demande de prêt",
        expectedBody: `Hello ${adminUser.first_name}, vous avez reçu une nouvelle demande de prêt de 25,000 FCFA de ${testUser.first_name} ${testUser.last_name}. Cliquer ici pour l'afficher.`
      },
      {
        name: 'Notification client - Prêt approuvé',
        endpoint: '/api/notify-loan-approval',
        payload: {
          userId: testUser.id,
          loanAmount: 25000,
          loanId: 'test-loan-' + Date.now()
        },
        expectedTitle: "AB Campus Finance - Prêt approuvé",
        expectedBody: `Félicitations ${testUser.first_name} ! Votre demande de prêt de 25,000 FCFA a été approuvée.`
      },
      {
        name: 'Notification client - Dépôt d\'épargne',
        endpoint: '/api/notify-savings-deposit',
        payload: {
          clientName: `${testUser.first_name} ${testUser.last_name}`,
          amount: '5,000 FCFA',
          userId: testUser.id
        },
        expectedTitle: "AB Campus Finance - Dépôt d'épargne confirmé",
        expectedBody: `Bonjour ${testUser.first_name} ${testUser.last_name}, votre compte épargne a été crédité de 5,000 FCFA. Keep Going !`
      }
    ];

    let successCount = 0;
    let totalTests = testCases.length;

    for (const testCase of testCases) {
      console.log(`   🧪 Test: ${testCase.name}`);
      console.log(`   📡 Endpoint: ${testCase.endpoint}`);
      
      try {
        const response = await fetch(`${BACKEND_URL}${testCase.endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testCase.payload)
        });

        const result = await response.json();
        
        if (response.ok && result.success) {
          console.log(`   ✅ Succès: ${result.message || 'Notification envoyée'}`);
          if (result.notificationsSent) {
            console.log(`   📱 Notifications envoyées: ${result.notificationsSent}`);
          }
          if (result.errors) {
            console.log(`   ⚠️  Erreurs: ${result.errors}`);
          }
          successCount++;
        } else {
          console.log(`   ❌ Échec: ${result.error || 'Erreur inconnue'}`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur réseau: ${error.message}`);
      }
      
      console.log(''); // Ligne vide
    }

    // 5. Résumé des tests
    console.log('5. 📊 Résumé des tests:');
    console.log(`   Tests réussis: ${successCount}/${totalTests}`);
    console.log(`   Taux de réussite: ${Math.round((successCount / totalTests) * 100)}%\n`);

    // 6. Recommandations
    console.log('6. 💡 Recommandations:');
    
    if (successCount === totalTests) {
      console.log('   🎉 Toutes les notifications fonctionnent correctement !');
    } else {
      console.log('   ⚠️  Certaines notifications ont échoué. Vérifiez:');
      console.log('   - Les clés VAPID sont correctement configurées');
      console.log('   - Les utilisateurs sont abonnés aux notifications');
      console.log('   - Le backend est accessible depuis l\'URL de production');
      console.log('   - Les variables d\'environnement sont correctes');
    }

    if (userSubscriptions.length === 0 || adminSubscriptions.length === 0) {
      console.log('   📱 Pour tester les notifications push:');
      console.log('   1. Connectez-vous à l\'application');
      console.log('   2. Acceptez les notifications push');
      console.log('   3. Relancez ce test');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter les tests
testNotifications().then(() => {
  console.log('\n✅ Test terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
