const { createClient } = require('@supabase/supabase-js');
const webPush = require('web-push');

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

// Configuration web-push
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  console.error('❌ Clés VAPID manquantes');
  process.exit(1);
}

webPush.setVapidDetails(
  'mailto:admin@abcampusfinance.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

async function testLoanNotification(userId, testType = 'approval') {
  try {
    console.log(`🧪 Test de notification de prêt pour l'utilisateur: ${userId}`);
    console.log(`📋 Type de test: ${testType}`);
    
    // Récupérer les informations de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('❌ Utilisateur non trouvé:', userError);
      return false;
    }

    console.log(`👤 Utilisateur trouvé: ${userData.first_name} ${userData.last_name} (${userData.email})`);

    // Récupérer les abonnements push de l'utilisateur
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId);

    if (subError) {
      console.error('❌ Erreur récupération abonnements:', subError);
      return false;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️ Aucun abonnement push trouvé pour cet utilisateur');
      return false;
    }

    console.log(`📱 ${subscriptions.length} abonnement(s) trouvé(s)`);

    // Données de test
    const testData = {
      approval: {
        title: "🎉 AB Campus Finance - Prêt approuvé !",
        body: `Félicitations ${userData.first_name} ! Votre prêt de 50,000 FCFA a été approuvé. Vous pouvez maintenant procéder au remboursement.`,
        amount: 50000,
        loanId: 'TEST-' + Date.now()
      },
      reminder: {
        title: "⏰ AB Campus Finance - Rappel de remboursement",
        body: `Bonjour ${userData.first_name}, n'oubliez pas que votre prêt de 25,000 FCFA arrive à échéance dans 3 jours.`,
        amount: 25000,
        loanId: 'TEST-REMINDER-' + Date.now()
      },
      overdue: {
        title: "⚠️ AB Campus Finance - Prêt en retard",
        body: `Attention ${userData.first_name}, votre prêt de 30,000 FCFA est en retard. Des pénalités s'appliquent.`,
        amount: 30000,
        loanId: 'TEST-OVERDUE-' + Date.now()
      }
    };

    const notificationData = testData[testType] || testData.approval;

    console.log(`📨 Contenu de la notification:`);
    console.log(`   Titre: ${notificationData.title}`);
    console.log(`   Message: ${notificationData.body}`);

    // Envoyer la notification à tous les abonnements de l'utilisateur
    let successCount = 0;
    let errorCount = 0;

    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(sub.subscription, JSON.stringify({
          title: notificationData.title,
          body: notificationData.body,
          data: {
            url: '/dashboard',
            icon: '/logo192.png',
            badge: '/logo192.png',
            type: 'loan_' + testType,
            loanId: notificationData.loanId,
            amount: notificationData.amount,
            timestamp: new Date().toISOString()
          },
          vibrate: [200, 100, 200],
          requireInteraction: true,
          actions: [
            {
              action: 'view',
              title: 'Voir le prêt',
              icon: '/logo192.png'
            },
            {
              action: 'dismiss',
              title: 'Fermer'
            }
          ]
        }));
        
        successCount++;
        console.log('✅ Notification envoyée avec succès');
      } catch (pushError) {
        errorCount++;
        console.error('❌ Erreur envoi notification:', pushError.message);
      }
    }

    // Sauvegarder la notification de test dans la base de données
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: notificationData.title,
        message: notificationData.body,
        type: 'loan_' + testType,
        data: {
          loanId: notificationData.loanId,
          amount: notificationData.amount,
          isTest: true,
          testType: testType
        },
        created_at: new Date().toISOString()
      });

    if (notifError) {
      console.error('❌ Erreur sauvegarde notification:', notifError);
    } else {
      console.log('💾 Notification sauvegardée dans la base de données');
    }

    console.log(`\n📊 Résumé du test:`);
    console.log(`   Utilisateur: ${userData.first_name} ${userData.last_name}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Type: ${testType}`);
    console.log(`   Abonnements trouvés: ${subscriptions.length}`);
    console.log(`   Notifications envoyées: ${successCount}`);
    console.log(`   Erreurs: ${errorCount}`);

    return successCount > 0;

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return false;
  }
}

async function listUsersWithSubscriptions() {
  try {
    console.log('👥 Liste des utilisateurs avec abonnements push:');
    
    // Récupérer d'abord les utilisateurs approuvés
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, status')
      .eq('status', 'approved');

    if (usersError) {
      console.error('❌ Erreur récupération utilisateurs:', usersError);
      return [];
    }

    if (!users || users.length === 0) {
      console.log('⚠️ Aucun utilisateur approuvé trouvé');
      return [];
    }

    // Récupérer les abonnements push
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('user_id');

    if (subError) {
      console.error('❌ Erreur récupération abonnements:', subError);
      return [];
    }

    // Filtrer les utilisateurs qui ont des abonnements
    const userIdsWithSubscriptions = new Set(subscriptions.map(sub => sub.user_id));
    const usersWithSubscriptions = users.filter(user => userIdsWithSubscriptions.has(user.id));

    if (!usersWithSubscriptions || usersWithSubscriptions.length === 0) {
      console.log('⚠️ Aucun utilisateur avec abonnement trouvé');
      return [];
    }

    usersWithSubscriptions.forEach((user, index) => {
      console.log(`${index + 1}. ${user.first_name} ${user.last_name} (${user.email}) - ID: ${user.id}`);
    });

    return usersWithSubscriptions;
  } catch (error) {
    console.error('❌ Erreur:', error);
    return [];
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🧪 Script de test des notifications de prêt');
    console.log('');
    console.log('Usage:');
    console.log('  node test-loan-notification.js list                    # Lister les utilisateurs avec abonnements');
    console.log('  node test-loan-notification.js <userId> [testType]     # Tester une notification');
    console.log('');
    console.log('Types de test disponibles:');
    console.log('  approval  - Notification de prêt approuvé (défaut)');
    console.log('  reminder  - Notification de rappel de remboursement');
    console.log('  overdue   - Notification de prêt en retard');
    console.log('');
    console.log('Exemples:');
    console.log('  node test-loan-notification.js list');
    console.log('  node test-loan-notification.js 123e4567-e89b-12d3-a456-426614174000');
    console.log('  node test-loan-notification.js 123e4567-e89b-12d3-a456-426614174000 reminder');
    return;
  }

  if (args[0] === 'list') {
    await listUsersWithSubscriptions();
    return;
  }

  const userId = args[0];
  const testType = args[1] || 'approval';

  if (!['approval', 'reminder', 'overdue'].includes(testType)) {
    console.error('❌ Type de test invalide. Types disponibles: approval, reminder, overdue');
    return;
  }

  const success = await testLoanNotification(userId, testType);
  
  if (success) {
    console.log('\n🎉 Test terminé avec succès !');
  } else {
    console.log('\n❌ Test échoué');
    process.exit(1);
  }
}

// Exécuter le script
main().catch(console.error);
