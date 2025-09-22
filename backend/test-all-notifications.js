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
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

async function testAllNotifications() {
  console.log('🧪 Test complet de TOUTES les notifications configurées...\n');

  try {
    // 1. Vérifier les abonnements push
    console.log('1. 📊 Vérification des abonnements push...');
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .limit(10);
    
    if (subError) {
      console.error('❌ Erreur récupération abonnements:', subError);
      return;
    }
    
    console.log(`✅ ${subscriptions?.length || 0} abonnement(s) push trouvé(s)`);
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️  Aucun abonnement trouvé - les tests de notification seront ignorés');
      return;
    }

    // 2. Récupérer un utilisateur de test
    const testUser = subscriptions[0];
    console.log(`\n2. 👤 Utilisateur de test: ${testUser.user_id}`);

    // 3. Récupérer les données de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', testUser.user_id)
      .single();

    if (userError || !userData) {
      console.error('❌ Impossible de récupérer les données utilisateur:', userError);
      return;
    }

    const clientName = `${userData.first_name} ${userData.last_name}`;
    console.log(`   Nom: ${clientName}`);
    console.log(`   Email: ${userData.email}`);

    // 4. Test de toutes les notifications configurées
    console.log('\n3. 🔔 Test de toutes les notifications configurées...\n');

    const notifications = [
      {
        name: 'Dépôt d\'épargne confirmé',
        endpoint: '/api/notify-savings-deposit',
        payload: {
          clientName: clientName,
          amount: '5,000 FCFA',
          userId: testUser.user_id
        },
        expectedTitle: "AB Campus Finance - Dépôt d'épargne confirmé",
        expectedBody: `Bonjour ${clientName}, votre compte épargne a été crédité de 5,000 FCFA. Keep Going !`
      },
      {
        name: 'Approbation de prêt',
        endpoint: '/api/notify-loan-approval',
        payload: {
          userId: testUser.user_id,
          loanAmount: '50,000 FCFA',
          loanId: 'test-loan-123'
        },
        expectedTitle: "AB Campus Finance - Prêt approuvé",
        expectedBody: `Félicitations ${clientName} ! Votre demande de prêt de 50,000 FCFA a été approuvée.`
      },
      {
        name: 'Notification personnalisée',
        endpoint: '/api/send-notification',
        payload: {
          title: 'Test de notification personnalisée',
          body: `Bonjour ${clientName}, ceci est un test de notification personnalisée.`,
          userId: testUser.user_id
        },
        expectedTitle: 'Test de notification personnalisée',
        expectedBody: `Bonjour ${clientName}, ceci est un test de notification personnalisée.`
      }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const notification of notifications) {
      console.log(`📱 Test: ${notification.name}`);
      console.log(`   Endpoint: ${notification.endpoint}`);
      console.log(`   Titre attendu: "${notification.expectedTitle}"`);
      console.log(`   Message attendu: "${notification.expectedBody}"`);
      
      try {
        const response = await fetch(`${backendUrl}${notification.endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification.payload)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`   ✅ Succès: ${result.message || 'Notification envoyée'}`);
          successCount++;
        } else {
          const errorText = await response.text();
          console.log(`   ❌ Erreur: ${response.status} - ${errorText}`);
          errorCount++;
        }
      } catch (error) {
        console.log(`   ❌ Erreur réseau: ${error.message}`);
        errorCount++;
      }
      
      console.log(''); // Ligne vide pour la lisibilité
    }

    // 5. Test des notifications automatiques (rappels)
    console.log('4. ⏰ Test des notifications automatiques (rappels)...\n');
    
    const automaticNotifications = [
      {
        name: 'Rappels de dépôt d\'épargne',
        endpoint: '/api/trigger-savings-reminders',
        description: 'Vérifie les dépôts d\'épargne en échéance'
      },
      {
        name: 'Rappels de prêt',
        endpoint: '/api/trigger-loan-reminders',
        description: 'Vérifie les prêts en échéance'
      }
    ];

    for (const autoNotification of automaticNotifications) {
      console.log(`⏰ Test: ${autoNotification.name}`);
      console.log(`   Description: ${autoNotification.description}`);
      
      try {
        const response = await fetch(`${backendUrl}${autoNotification.endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`   ✅ Succès: ${result.message}`);
        } else {
          const errorText = await response.text();
          console.log(`   ❌ Erreur: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur réseau: ${error.message}`);
      }
      
      console.log(''); // Ligne vide pour la lisibilité
    }

    // 6. Résumé des tests
    console.log('📋 Résumé des tests:');
    console.log(`   ✅ Notifications réussies: ${successCount}`);
    console.log(`   ❌ Notifications échouées: ${errorCount}`);
    console.log(`   📊 Taux de réussite: ${Math.round((successCount / (successCount + errorCount)) * 100)}%`);

    // 7. Recommandations
    console.log('\n💡 Recommandations:');
    if (successCount === notifications.length) {
      console.log('   🎉 Toutes les notifications fonctionnent parfaitement !');
    } else if (successCount > 0) {
      console.log('   ⚠️  Certaines notifications fonctionnent, vérifiez les erreurs ci-dessus');
    } else {
      console.log('   🚨 Aucune notification ne fonctionne, vérifiez la configuration');
    }

    console.log('\n🔧 Notifications configurées dans le système:');
    console.log('   1. 📥 Dépôt d\'épargne confirmé (automatique via webhook FedaPay)');
    console.log('   2. ✅ Approbation de prêt (déclenchée par l\'admin)');
    console.log('   3. 📢 Notification personnalisée (pour tous les utilisateurs)');
    console.log('   4. ⏰ Rappels de dépôt d\'épargne (automatique quotidien à 11h)');
    console.log('   5. ⏰ Rappels de prêt (automatique quotidien à 11h)');
    console.log('   6. 🔔 Notification admin nouvelle demande (automatique)');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testAllNotifications().then(() => {
  console.log('\n🏁 Test complet terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
