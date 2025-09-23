// Test du système d'abonnements permanents
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

// Configuration
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://ab-pret-back.onrender.com' 
  : 'http://localhost:5000';

console.log('🧪 Test du système d\'abonnements permanents...\n');
console.log('🔧 Configuration:');
console.log(`   Backend URL: ${BACKEND_URL}`);
console.log(`   Supabase URL: ${supabaseUrl}\n`);

async function testPermanentSubscriptions() {
  try {
    // 1. Vérifier l'état actuel des abonnements
    console.log('1. 📊 État actuel des abonnements...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, role, email')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('   ❌ Erreur récupération utilisateurs:', usersError);
      return;
    }

    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('id, user_id, subscription, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (subsError) {
      console.error('   ❌ Erreur récupération abonnements:', subsError);
      return;
    }

    console.log(`   👥 Total utilisateurs: ${users.length}`);
    console.log(`   📱 Total abonnements: ${subscriptions.length}\n`);

    // Grouper par utilisateur
    const subsByUser = {};
    subscriptions.forEach(sub => {
      if (!subsByUser[sub.user_id]) {
        subsByUser[sub.user_id] = [];
      }
      subsByUser[sub.user_id].push(sub);
    });

    // Afficher le statut de chaque utilisateur
    console.log('   📋 Statut des abonnements par utilisateur:');
    for (const user of users) {
      const userSubs = subsByUser[user.id] || [];
      const status = userSubs.length > 0 ? '✅ Abonné' : '❌ Non abonné';
      const lastUpdate = userSubs.length > 0 ? new Date(userSubs[0].updated_at).toLocaleString() : 'N/A';
      console.log(`   - ${user.first_name} ${user.last_name} (${user.role}): ${status} - Dernière mise à jour: ${lastUpdate}`);
    }

    // 2. Tester la validation des abonnements
    console.log('\n2. 🧪 Test de validation des abonnements...');
    
    for (const sub of subscriptions) {
      const user = users.find(u => u.id === sub.user_id);
      const userName = user ? `${user.first_name} ${user.last_name}` : 'Utilisateur inconnu';
      
      console.log(`   🔍 Test de l'abonnement pour ${userName}...`);
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/test-subscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: sub.subscription,
            userId: sub.user_id
          })
        });

        const result = await response.json();
        
        if (result.success) {
          console.log(`   ✅ ${userName}: Abonnement valide`);
        } else {
          console.log(`   ❌ ${userName}: Abonnement invalide - ${result.message}`);
        }
      } catch (error) {
        console.log(`   ❌ ${userName}: Erreur test - ${error.message}`);
      }
    }

    // 3. Tester les notifications
    console.log('\n3. 🚀 Test des notifications...');
    
    const testUser = users.find(u => u.role === 'client' && subsByUser[u.id]) || users[0];
    const adminUser = users.find(u => u.role === 'admin' && subsByUser[u.id]) || users.find(u => u.role === 'admin');

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
          loanId: 'test-permanent-' + Date.now()
        }
      },
      {
        name: 'Notification client - Prêt approuvé',
        endpoint: '/api/notify-loan-approval',
        payload: {
          userId: testUser.id,
          loanAmount: 30000,
          loanId: 'test-permanent-' + Date.now()
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`   🧪 Test: ${testCase.name}`);
      
      try {
        const startTime = Date.now();
        const response = await fetch(`${BACKEND_URL}${testCase.endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
        }
      } catch (error) {
        console.log(`   ❌ Erreur réseau: ${error.message}`);
      }
      
      console.log(''); // Ligne vide
    }

    // 4. Recommandations
    console.log('4. 💡 Recommandations pour les abonnements permanents:\n');
    console.log('   🔄 Renouvellement automatique:');
    console.log('   - Les abonnements sont vérifiés automatiquement au chargement de l\'app');
    console.log('   - Renouvellement automatique si l\'abonnement est expiré');
    console.log('   - Vérification périodique toutes les 24h');
    console.log('');
    console.log('   🛡️ Gestion des erreurs:');
    console.log('   - Suppression automatique des abonnements invalides');
    console.log('   - Création d\'un nouvel abonnement si nécessaire');
    console.log('   - Sauvegarde permanente dans la base de données');
    console.log('');
    console.log('   📱 Expérience utilisateur:');
    console.log('   - L\'utilisateur n\'a besoin de s\'abonner qu\'une seule fois');
    console.log('   - Les notifications continuent de fonctionner même après expiration');
    console.log('   - Renouvellement transparent sans intervention utilisateur');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter les tests
testPermanentSubscriptions().then(() => {
  console.log('\n✅ Test terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
