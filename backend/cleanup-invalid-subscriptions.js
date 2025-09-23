// Script pour nettoyer les abonnements push invalides
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

console.log('🧹 Nettoyage des abonnements push invalides...\n');

async function cleanupInvalidSubscriptions() {
  try {
    // 1. Récupérer tous les abonnements
    console.log('1. 📱 Récupération des abonnements...');
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('id, user_id, subscription, created_at')
      .order('created_at', { ascending: false });

    if (subsError) {
      console.error('   ❌ Erreur récupération abonnements:', subsError);
      return;
    }

    console.log(`   📊 Total abonnements: ${subscriptions.length}\n`);

    // 2. Tester chaque abonnement
    console.log('2. 🧪 Test des abonnements...');
    const invalidSubscriptions = [];
    const validSubscriptions = [];

    for (const sub of subscriptions) {
      try {
        // Envoyer une notification de test
        await webPush.sendNotification(sub.subscription, JSON.stringify({
          title: 'Test de validité',
          body: 'Test de l\'abonnement push',
          data: { test: true }
        }));
        
        validSubscriptions.push(sub);
        console.log(`   ✅ Abonnement ${sub.id} valide`);
      } catch (error) {
        console.log(`   ❌ Abonnement ${sub.id} invalide: ${error.message}`);
        invalidSubscriptions.push(sub);
      }
    }

    console.log(`\n   📊 Résultats:`);
    console.log(`   ✅ Abonnements valides: ${validSubscriptions.length}`);
    console.log(`   ❌ Abonnements invalides: ${invalidSubscriptions.length}\n`);

    // 3. Supprimer les abonnements invalides
    if (invalidSubscriptions.length > 0) {
      console.log('3. 🗑️ Suppression des abonnements invalides...');
      
      const invalidIds = invalidSubscriptions.map(sub => sub.id);
      
      const { error: deleteError } = await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', invalidIds);

      if (deleteError) {
        console.error('   ❌ Erreur suppression:', deleteError);
      } else {
        console.log(`   ✅ ${invalidSubscriptions.length} abonnements invalides supprimés\n`);
      }
    } else {
      console.log('3. ✅ Aucun abonnement invalide à supprimer\n');
    }

    // 4. Afficher les abonnements restants par utilisateur
    console.log('4. 📋 Abonnements valides restants:');
    const { data: remainingSubs } = await supabase
      .from('push_subscriptions')
      .select('user_id, created_at')
      .order('created_at', { ascending: false });

    const subsByUser = {};
    remainingSubs.forEach(sub => {
      if (!subsByUser[sub.user_id]) {
        subsByUser[sub.user_id] = 0;
      }
      subsByUser[sub.user_id]++;
    });

    for (const [userId, count] of Object.entries(subsByUser)) {
      const { data: user } = await supabase
        .from('users')
        .select('first_name, last_name, role')
        .eq('id', userId)
        .single();
      
      const userName = user ? `${user.first_name} ${user.last_name}` : 'Utilisateur inconnu';
      const userRole = user ? user.role : 'inconnu';
      console.log(`   📱 ${userName} (${userRole}): ${count} abonnement(s)`);
    }

    console.log('\n✅ Nettoyage terminé !');
    console.log('\n💡 Recommandations:');
    console.log('   - Les abonnements push expirent naturellement');
    console.log('   - Les utilisateurs doivent réaccepter les notifications périodiquement');
    console.log('   - Ce script peut être exécuté régulièrement pour maintenir la base propre');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

// Exécuter le nettoyage
cleanupInvalidSubscriptions().then(() => {
  console.log('\n✅ Script terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
