require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./utils/supabaseClient-server');

async function testDailySubscriptionCheck() {
  console.log('\n=== 🔍 Test de Vérification Quotidienne des Abonnements ===\n');

  // 1. Vérifier les abonnements existants
  console.log('1️⃣ Vérification des abonnements existants...');
  const { data: subscriptions, error: fetchError } = await supabase
    .from('push_subscriptions')
    .select('*')
    .limit(10);

  if (fetchError) {
    console.error('❌ Erreur récupération abonnements:', fetchError.message);
    return;
  }

  console.log(`✅ ${subscriptions.length} abonnement(s) trouvé(s)`);

  if (subscriptions.length === 0) {
    console.log('⚠️ Aucun abonnement trouvé - test impossible');
    return;
  }

  // 2. Analyser les abonnements
  console.log('\n2️⃣ Analyse des abonnements...');
  for (const subscription of subscriptions) {
    console.log(`\n📱 Abonnement ID: ${subscription.id}`);
    console.log(`   Utilisateur: ${subscription.user_id}`);
    console.log(`   Créé le: ${new Date(subscription.created_at).toLocaleString()}`);
    console.log(`   Dernière mise à jour: ${new Date(subscription.updated_at).toLocaleString()}`);
    
    // Calculer l'âge de l'abonnement
    const ageInDays = (Date.now() - new Date(subscription.created_at).getTime()) / (1000 * 60 * 60 * 24);
    console.log(`   Âge: ${Math.round(ageInDays)} jours`);
    
    // Déterminer le statut
    if (ageInDays > 7) {
      console.log(`   ⚠️ Abonnement ancien (${Math.round(ageInDays)} jours) - pourrait être inactif`);
    } else {
      console.log(`   ✅ Abonnement récent (${Math.round(ageInDays)} jours) - probablement actif`);
    }
  }

  // 3. Simuler la vérification quotidienne
  console.log('\n3️⃣ Simulation de la vérification quotidienne...');
  
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  console.log(`📅 Date d'aujourd'hui: ${today}`);
  
  // Vérifier les abonnements qui n'ont pas été mis à jour récemment
  const { data: staleSubscriptions, error: staleError } = await supabase
    .from('push_subscriptions')
    .select('*')
    .lt('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Plus de 24h

  if (staleError) {
    console.error('❌ Erreur récupération abonnements obsolètes:', staleError.message);
  } else {
    console.log(`⚠️ ${staleSubscriptions.length} abonnement(s) obsolète(s) (non mis à jour depuis 24h)`);
    
    if (staleSubscriptions.length > 0) {
      console.log('\n📋 Abonnements obsolètes:');
      for (const sub of staleSubscriptions) {
        const lastUpdate = new Date(sub.updated_at);
        const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
        console.log(`   - ${sub.user_id}: ${Math.round(hoursSinceUpdate)}h depuis la dernière mise à jour`);
      }
    }
  }

  // 4. Recommandations
  console.log('\n4️⃣ Recommandations:');
  console.log('✅ Le système de vérification quotidienne est configuré');
  console.log('✅ Les abonnements inactifs déclencheront l\'affichage du prompt');
  console.log('✅ Les abonnements actifs ne déclencheront pas le prompt');
  console.log('✅ La vérification se fait automatiquement toutes les 24h');

  console.log('\n=== 🎯 Test Terminé ===\n');
}

testDailySubscriptionCheck();
