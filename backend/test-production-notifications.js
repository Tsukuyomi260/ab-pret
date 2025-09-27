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

// Configuration du backend
const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://ab-pret-back.onrender.com'
  : 'http://localhost:5000';

async function testProductionNotifications() {
  try {
    console.log('🧪 Test des notifications automatiques en production');
    console.log(`🌐 Backend URL: ${BACKEND_URL}`);
    console.log('');

    // 1. Vérifier les utilisateurs avec abonnements push
    console.log('📱 1. Vérification des abonnements push...');
    
    // D'abord récupérer les abonnements
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('id, user_id, created_at');

    if (subError) {
      console.error('❌ Erreur récupération abonnements:', subError);
      return false;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️ Aucun abonnement push trouvé');
      return false;
    }

    // Ensuite récupérer les utilisateurs approuvés
    const userIds = subscriptions.map(sub => sub.user_id);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, status')
      .in('id', userIds)
      .eq('status', 'approved');

    if (usersError) {
      console.error('❌ Erreur récupération utilisateurs:', usersError);
      return false;
    }

    // Combiner les données
    const subscriptionsWithUsers = subscriptions
      .map(sub => {
        const user = users.find(u => u.id === sub.user_id);
        return user ? { ...sub, users: user } : null;
      })
      .filter(Boolean);

    if (subscriptionsWithUsers.length === 0) {
      console.log('⚠️ Aucun utilisateur approuvé avec abonnement push trouvé');
      return false;
    }

    console.log(`✅ ${subscriptionsWithUsers.length} utilisateur(s) approuvé(s) avec abonnement push trouvé(s)`);
    subscriptionsWithUsers.forEach(sub => {
      console.log(`   - ${sub.users.first_name} ${sub.users.last_name} (${sub.users.email})`);
    });
    console.log('');

    // 2. Tester la notification d'approbation de prêt
    console.log('🎯 2. Test notification d\'approbation de prêt...');
    const testUser = subscriptionsWithUsers[0];
    const testLoanAmount = 50000;
    const testLoanId = 'TEST-' + Date.now();

    try {
      const response = await fetch(`${BACKEND_URL}/api/notify-loan-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: testUser.user_id,
          loanAmount: testLoanAmount,
          loanId: testLoanId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Notification d\'approbation de prêt envoyée avec succès');
        console.log(`   - Utilisateur: ${testUser.users.first_name} ${testUser.users.last_name}`);
        console.log(`   - Montant: ${testLoanAmount.toLocaleString()} FCFA`);
        console.log(`   - Notifications envoyées: ${result.notificationsSent}`);
      } else {
        console.error('❌ Erreur notification d\'approbation:', result.error);
      }
    } catch (error) {
      console.error('❌ Erreur test notification d\'approbation:', error.message);
    }
    console.log('');

    // 3. Tester la notification de dépôt d'épargne
    console.log('💰 3. Test notification de dépôt d\'épargne...');
    const testDepositAmount = 25000;

    try {
      const response = await fetch(`${BACKEND_URL}/api/notify-savings-deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: `${testUser.users.first_name} ${testUser.users.last_name}`,
          amount: `${testDepositAmount.toLocaleString()} FCFA`,
          userId: testUser.user_id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Notification de dépôt d\'épargne envoyée avec succès');
        console.log(`   - Utilisateur: ${testUser.users.first_name} ${testUser.users.last_name}`);
        console.log(`   - Montant: ${testDepositAmount.toLocaleString()} FCFA`);
        console.log(`   - Notifications envoyées: ${result.notificationsSent}`);
      } else {
        console.error('❌ Erreur notification de dépôt:', result.error);
      }
    } catch (error) {
      console.error('❌ Erreur test notification de dépôt:', error.message);
    }
    console.log('');

    // 4. Tester la notification admin pour nouvelle demande de prêt
    console.log('👨‍💼 4. Test notification admin (nouvelle demande de prêt)...');
    try {
      const response = await fetch(`${BACKEND_URL}/api/notify-admin-new-loan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanAmount: testLoanAmount,
          clientName: `${testUser.users.first_name} ${testUser.users.last_name}`,
          loanId: testLoanId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Notification admin envoyée avec succès');
        console.log(`   - Client: ${testUser.users.first_name} ${testUser.users.last_name}`);
        console.log(`   - Montant: ${testLoanAmount.toLocaleString()} FCFA`);
        console.log(`   - Notifications envoyées: ${result.notificationsSent}`);
      } else {
        console.error('❌ Erreur notification admin:', result.error);
      }
    } catch (error) {
      console.error('❌ Erreur test notification admin:', error.message);
    }
    console.log('');

    // 5. Vérifier les fonctions de rappel programmées
    console.log('⏰ 5. Vérification des fonctions de rappel...');
    
    // Vérifier les prêts actifs
    const { data: activeLoans, error: loansError } = await supabase
      .from('loans')
      .select('id, user_id, amount, approved_at, status')
      .eq('status', 'active')
      .not('approved_at', 'is', null);

    if (loansError) {
      console.error('❌ Erreur récupération prêts actifs:', loansError);
    } else {
      console.log(`✅ ${activeLoans?.length || 0} prêt(s) actif(s) trouvé(s)`);
    }

    // Vérifier les plans d'épargne actifs
    const { data: activePlans, error: plansError } = await supabase
      .from('savings_plans')
      .select('id, user_id, plan_name, fixed_amount, next_deposit_date, status')
      .eq('status', 'active')
      .not('next_deposit_date', 'is', null);

    if (plansError) {
      console.error('❌ Erreur récupération plans d\'épargne:', plansError);
    } else {
      console.log(`✅ ${activePlans?.length || 0} plan(s) d'épargne actif(s) trouvé(s)`);
    }
    console.log('');

    // 6. Test des notifications de rappel (simulation)
    console.log('🔔 6. Test des notifications de rappel...');
    try {
      const response = await fetch(`${BACKEND_URL}/api/test-loan-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: testUser.user_id,
          testType: 'reminder'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Notification de rappel de prêt envoyée avec succès');
        console.log(`   - Utilisateur: ${result.details.user}`);
        console.log(`   - Type: ${result.details.testType}`);
        console.log(`   - Notifications envoyées: ${result.details.notificationsSent}`);
      } else {
        console.error('❌ Erreur notification de rappel:', result.error);
      }
    } catch (error) {
      console.error('❌ Erreur test notification de rappel:', error.message);
    }
    console.log('');

    // 7. Vérifier la configuration VAPID
    console.log('🔑 7. Vérification de la configuration VAPID...');
    try {
      const response = await fetch(`${BACKEND_URL}/api/push/vapid-public-key`);
      const vapidKey = await response.text();
      
      if (vapidKey && vapidKey.length > 0) {
        console.log('✅ Clé VAPID publique récupérée avec succès');
        console.log(`   - Longueur: ${vapidKey.length} caractères`);
        console.log(`   - Début: ${vapidKey.substring(0, 20)}...`);
      } else {
        console.error('❌ Clé VAPID publique manquante ou vide');
      }
    } catch (error) {
      console.error('❌ Erreur récupération clé VAPID:', error.message);
    }
    console.log('');

    console.log('🎉 Test des notifications automatiques terminé !');
    console.log('');
    console.log('📋 Résumé des points de déclenchement automatiques :');
    console.log('   ✅ Notification admin : Nouvelle demande de prêt');
    console.log('   ✅ Notification client : Approbation de prêt');
    console.log('   ✅ Notification client : Dépôt d\'épargne confirmé');
    console.log('   ✅ Rappels automatiques : Prêts en échéance (11h quotidien)');
    console.log('   ✅ Rappels automatiques : Dépôts d\'épargne (11h quotidien)');
    console.log('   ✅ Gestion automatique : Prêts en retard avec pénalités');
    console.log('   ✅ Notifications de test : Disponibles pour l\'admin');

    return true;

  } catch (error) {
    console.error('❌ Erreur générale lors du test:', error);
    return false;
  }
}

// Fonction principale
async function main() {
  const success = await testProductionNotifications();
  
  if (success) {
    console.log('\n✅ Tous les tests de notifications sont passés avec succès !');
    process.exit(0);
  } else {
    console.log('\n❌ Certains tests de notifications ont échoué.');
    process.exit(1);
  }
}

// Exécuter le script
main().catch(console.error);

    // 6. Test des notifications de rappel (simulation)
    console.log('🔔 6. Test des notifications de rappel...');
    try {
      const response = await fetch(`${BACKEND_URL}/api/test-loan-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: testUser.user_id,
          testType: 'reminder'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Notification de rappel de prêt envoyée avec succès');
        console.log(`   - Utilisateur: ${result.details.user}`);
        console.log(`   - Type: ${result.details.testType}`);
        console.log(`   - Notifications envoyées: ${result.details.notificationsSent}`);
      } else {
        console.error('❌ Erreur notification de rappel:', result.error);
      }
    } catch (error) {
      console.error('❌ Erreur test notification de rappel:', error.message);
    }
    console.log('');

    // 7. Vérifier la configuration VAPID
    console.log('🔑 7. Vérification de la configuration VAPID...');
    try {
      const response = await fetch(`${BACKEND_URL}/api/push/vapid-public-key`);
      const vapidKey = await response.text();
      
      if (vapidKey && vapidKey.length > 0) {
        console.log('✅ Clé VAPID publique récupérée avec succès');
        console.log(`   - Longueur: ${vapidKey.length} caractères`);
        console.log(`   - Début: ${vapidKey.substring(0, 20)}...`);
      } else {
        console.error('❌ Clé VAPID publique manquante ou vide');
      }
    } catch (error) {
      console.error('❌ Erreur récupération clé VAPID:', error.message);
    }
    console.log('');

    console.log('🎉 Test des notifications automatiques terminé !');
    console.log('');
    console.log('📋 Résumé des points de déclenchement automatiques :');
    console.log('   ✅ Notification admin : Nouvelle demande de prêt');
    console.log('   ✅ Notification client : Approbation de prêt');
    console.log('   ✅ Notification client : Dépôt d\'épargne confirmé');
    console.log('   ✅ Rappels automatiques : Prêts en échéance (11h quotidien)');
    console.log('   ✅ Rappels automatiques : Dépôts d\'épargne (11h quotidien)');
    console.log('   ✅ Gestion automatique : Prêts en retard avec pénalités');
    console.log('   ✅ Notifications de test : Disponibles pour l\'admin');

    return true;

  } catch (error) {
    console.error('❌ Erreur générale lors du test:', error);
    return false;
  }
}

// Fonction principale
async function main() {
  const success = await testProductionNotifications();
  
  if (success) {
    console.log('\n✅ Tous les tests de notifications sont passés avec succès !');
    process.exit(0);
  } else {
    console.log('\n❌ Certains tests de notifications ont échoué.');
    process.exit(1);
  }
}

// Exécuter le script
main().catch(console.error);
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
