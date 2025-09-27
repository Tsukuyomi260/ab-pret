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

async function cleanupDuplicateSubscriptions() {
  try {
    console.log('🧹 Nettoyage des abonnements push en double...');
    
    // Récupérer tous les abonnements
    const { data: allSubscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('id, user_id, created_at, subscription')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Erreur récupération abonnements:', fetchError);
      return false;
    }

    if (!allSubscriptions || allSubscriptions.length === 0) {
      console.log('ℹ️ Aucun abonnement trouvé');
      return true;
    }

    console.log(`📊 Total d'abonnements trouvés: ${allSubscriptions.length}`);

    // Grouper par user_id
    const subscriptionsByUser = {};
    allSubscriptions.forEach(sub => {
      if (!subscriptionsByUser[sub.user_id]) {
        subscriptionsByUser[sub.user_id] = [];
      }
      subscriptionsByUser[sub.user_id].push(sub);
    });

    // Identifier les utilisateurs avec des doublons
    const usersWithDuplicates = Object.keys(subscriptionsByUser).filter(
      userId => subscriptionsByUser[userId].length > 1
    );

    console.log(`👥 Utilisateurs avec des doublons: ${usersWithDuplicates.length}`);

    if (usersWithDuplicates.length === 0) {
      console.log('✅ Aucun doublon trouvé !');
      return true;
    }

    let totalDeleted = 0;

    // Pour chaque utilisateur avec des doublons, garder seulement le plus récent
    for (const userId of usersWithDuplicates) {
      const userSubscriptions = subscriptionsByUser[userId];
      console.log(`\n👤 Utilisateur ${userId}:`);
      console.log(`   Abonnements: ${userSubscriptions.length}`);
      
      // Trier par date de création (le plus récent en premier)
      userSubscriptions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // Garder le premier (le plus récent) et supprimer les autres
      const toKeep = userSubscriptions[0];
      const toDelete = userSubscriptions.slice(1);
      
      console.log(`   ✅ À conserver: ${toKeep.id} (créé le ${toKeep.created_at})`);
      
      for (const sub of toDelete) {
        console.log(`   ❌ À supprimer: ${sub.id} (créé le ${sub.created_at})`);
        
        const { error: deleteError } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('id', sub.id);
        
        if (deleteError) {
          console.error(`   ❌ Erreur suppression ${sub.id}:`, deleteError);
        } else {
          totalDeleted++;
          console.log(`   ✅ Supprimé: ${sub.id}`);
        }
      }
    }

    console.log(`\n📊 Résumé du nettoyage:`);
    console.log(`   Utilisateurs traités: ${usersWithDuplicates.length}`);
    console.log(`   Abonnements supprimés: ${totalDeleted}`);
    console.log(`   Abonnements conservés: ${usersWithDuplicates.length}`);

    return true;

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return false;
  }
}

async function showSubscriptionStats() {
  try {
    console.log('📊 Statistiques des abonnements push:');
    
    // Récupérer tous les abonnements
    const { data: allSubscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('id, user_id, created_at');

    if (fetchError) {
      console.error('❌ Erreur récupération abonnements:', fetchError);
      return;
    }

    if (!allSubscriptions || allSubscriptions.length === 0) {
      console.log('ℹ️ Aucun abonnement trouvé');
      return;
    }

    // Grouper par user_id
    const subscriptionsByUser = {};
    allSubscriptions.forEach(sub => {
      if (!subscriptionsByUser[sub.user_id]) {
        subscriptionsByUser[sub.user_id] = [];
      }
      subscriptionsByUser[sub.user_id].push(sub);
    });

    const totalUsers = Object.keys(subscriptionsByUser).length;
    const totalSubscriptions = allSubscriptions.length;
    const usersWithDuplicates = Object.keys(subscriptionsByUser).filter(
      userId => subscriptionsByUser[userId].length > 1
    );

    console.log(`   Total d'abonnements: ${totalSubscriptions}`);
    console.log(`   Utilisateurs uniques: ${totalUsers}`);
    console.log(`   Utilisateurs avec doublons: ${usersWithDuplicates.length}`);
    console.log(`   Moyenne d'abonnements par utilisateur: ${(totalSubscriptions / totalUsers).toFixed(2)}`);

    if (usersWithDuplicates.length > 0) {
      console.log('\n👥 Utilisateurs avec des doublons:');
      usersWithDuplicates.forEach(userId => {
        const count = subscriptionsByUser[userId].length;
        console.log(`   ${userId}: ${count} abonnement(s)`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'affichage des statistiques:', error);
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🧹 Script de nettoyage des abonnements push en double');
    console.log('');
    console.log('Usage:');
    console.log('  node cleanup-duplicate-subscriptions.js stats    # Afficher les statistiques');
    console.log('  node cleanup-duplicate-subscriptions.js clean    # Nettoyer les doublons');
    console.log('');
    return;
  }

  if (args[0] === 'stats') {
    await showSubscriptionStats();
    return;
  }

  if (args[0] === 'clean') {
    const success = await cleanupDuplicateSubscriptions();
    
    if (success) {
      console.log('\n🎉 Nettoyage terminé avec succès !');
      console.log('\n📊 Nouvelles statistiques:');
      await showSubscriptionStats();
    } else {
      console.log('\n❌ Nettoyage échoué');
      process.exit(1);
    }
    return;
  }

  console.log('❌ Commande invalide. Utilisez "stats" ou "clean"');
}

// Exécuter le script
main().catch(console.error);
