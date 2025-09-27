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

// Configuration VAPID
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  console.error('❌ Clés VAPID manquantes');
  process.exit(1);
}

webPush.setVapidDetails(
  'mailto:test@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

async function testNotificationSystem() {
  try {
    console.log('🧪 Test du système de notifications...\n');

    // 1. Vérifier les abonnements existants
    console.log('1. 📱 Vérification des abonnements...');
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('id, user_id, subscription, created_at');

    if (subsError) {
      console.error('   ❌ Erreur récupération abonnements:', subsError);
      return false;
    }

    console.log(`   📊 Total abonnements: ${subscriptions.length}`);

    if (subscriptions.length === 0) {
      console.log('   ℹ️ Aucun abonnement trouvé - test terminé');
      return true;
    }

    // 2. Tester chaque abonnement
    console.log('\n2. 🧪 Test des abonnements...');
    let validCount = 0;
    let invalidCount = 0;

    for (const sub of subscriptions) {
      try {
        console.log(`   🔍 Test abonnement ${sub.id} (utilisateur ${sub.user_id})...`);
        
        const payload = JSON.stringify({
          title: 'Test du système de notifications',
          body: 'Ceci est un test pour vérifier que les notifications fonctionnent correctement',
          data: {
            test: true,
            timestamp: new Date().toISOString(),
            url: '/',
            icon: '/logo192.png',
            badge: '/logo192.png'
          }
        });

        await webPush.sendNotification(sub.subscription, payload);
        console.log(`   ✅ Abonnement ${sub.id} valide - notification envoyée`);
        validCount++;
      } catch (error) {
        console.log(`   ❌ Abonnement ${sub.id} invalide: ${error.message}`);
        invalidCount++;
      }
    }

    // 3. Résumé
    console.log('\n📊 Résumé du test:');
    console.log(`   ✅ Abonnements valides: ${validCount}`);
    console.log(`   ❌ Abonnements invalides: ${invalidCount}`);
    console.log(`   📱 Total testé: ${subscriptions.length}`);

    if (invalidCount > 0) {
      console.log('\n⚠️ Certains abonnements sont invalides. Vous pouvez les nettoyer avec:');
      console.log('   node cleanup-invalid-subscriptions.js');
    }

    return true;

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return false;
  }
}

async function testSubscriptionEndpoint() {
  try {
    console.log('\n🌐 Test de l\'endpoint de sauvegarde d\'abonnement...');
    
    // Créer un abonnement de test
    const testSubscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
      keys: {
        p256dh: 'test-p256dh-key',
        auth: 'test-auth-key'
      }
    };

    const testUserId = 'test-user-' + Date.now();

    const response = await fetch('http://localhost:3001/api/save-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: testSubscription,
        userId: testUserId
      })
    });

    if (response.ok) {
      console.log('   ✅ Endpoint de sauvegarde fonctionne');
      
      // Nettoyer l'abonnement de test
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', testUserId);
      
      console.log('   🧹 Abonnement de test nettoyé');
    } else {
      console.log('   ❌ Endpoint de sauvegarde ne fonctionne pas:', response.status);
    }

  } catch (error) {
    console.log('   ❌ Erreur test endpoint:', error.message);
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🧪 Script de test du système de notifications');
    console.log('');
    console.log('Usage:');
    console.log('  node test-notification-system.js notifications    # Tester les notifications');
    console.log('  node test-notification-system.js endpoint        # Tester l\'endpoint');
    console.log('  node test-notification-system.js all             # Tester tout');
    console.log('');
    return;
  }

  if (args[0] === 'notifications' || args[0] === 'all') {
    await testNotificationSystem();
  }

  if (args[0] === 'endpoint' || args[0] === 'all') {
    await testSubscriptionEndpoint();
  }

  if (args[0] === 'all') {
    console.log('\n🎉 Tests terminés !');
  }
}

// Exécuter le script
main().catch(console.error);
