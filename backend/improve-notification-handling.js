// Script pour améliorer la gestion des notifications
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

console.log('🔧 Amélioration de la gestion des notifications...\n');

async function improveNotificationHandling() {
  try {
    // 1. Vérifier les utilisateurs et leurs abonnements
    console.log('1. 👥 Analyse des utilisateurs et abonnements...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, role, email, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('   ❌ Erreur récupération utilisateurs:', usersError);
      return;
    }

    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('user_id, created_at')
      .order('created_at', { ascending: false });

    if (subsError) {
      console.error('   ❌ Erreur récupération abonnements:', subsError);
      return;
    }

    // Grouper les abonnements par utilisateur
    const subsByUser = {};
    subscriptions.forEach(sub => {
      if (!subsByUser[sub.user_id]) {
        subsByUser[sub.user_id] = [];
      }
      subsByUser[sub.user_id].push(sub);
    });

    console.log(`   📊 Total utilisateurs: ${users.length}`);
    console.log(`   📱 Total abonnements: ${subscriptions.length}`);
    console.log(`   👥 Utilisateurs avec abonnements: ${Object.keys(subsByUser).length}\n`);

    // 2. Analyser chaque utilisateur
    console.log('2. 📋 Analyse détaillée par utilisateur:');
    
    const usersWithSubs = [];
    const usersWithoutSubs = [];

    for (const user of users) {
      const userSubs = subsByUser[user.id] || [];
      const userInfo = {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        email: user.email,
        subscriptions: userSubs.length,
        lastSubscription: userSubs.length > 0 ? userSubs[0].created_at : null
      };

      if (userSubs.length > 0) {
        usersWithSubs.push(userInfo);
        console.log(`   ✅ ${userInfo.name} (${userInfo.role}): ${userInfo.subscriptions} abonnement(s)`);
      } else {
        usersWithoutSubs.push(userInfo);
        console.log(`   ❌ ${userInfo.name} (${userInfo.role}): Aucun abonnement`);
      }
    }

    console.log(`\n   📊 Résumé:`);
    console.log(`   ✅ Utilisateurs avec abonnements: ${usersWithSubs.length}`);
    console.log(`   ❌ Utilisateurs sans abonnements: ${usersWithoutSubs.length}\n`);

    // 3. Recommandations
    console.log('3. 💡 Recommandations pour améliorer les notifications:\n');

    if (usersWithoutSubs.length > 0) {
      console.log('   📱 Utilisateurs sans abonnements push:');
      usersWithoutSubs.forEach(user => {
        console.log(`   - ${user.name} (${user.role}) - ${user.email}`);
      });
      console.log('');
      console.log('   🔧 Actions recommandées:');
      console.log('   1. Ces utilisateurs doivent accepter les notifications push');
      console.log('   2. Vérifiez que le prompt de notification s\'affiche bien');
      console.log('   3. Assurez-vous que les utilisateurs cliquent sur "Autoriser"');
      console.log('');
    }

    // 4. Vérifier les prêts récents
    console.log('4. 💰 Analyse des prêts récents...');
    
    const { data: recentLoans, error: loansError } = await supabase
      .from('loans')
      .select('id, user_id, amount, status, created_at, approved_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (loansError) {
      console.error('   ❌ Erreur récupération prêts:', loansError);
    } else {
      console.log(`   📊 Prêts récents: ${recentLoans.length}`);
      
      const pendingLoans = recentLoans.filter(loan => loan.status === 'pending');
      const approvedLoans = recentLoans.filter(loan => loan.status === 'active' || loan.status === 'approved');
      
      console.log(`   ⏳ Prêts en attente: ${pendingLoans.length}`);
      console.log(`   ✅ Prêts approuvés: ${approvedLoans.length}\n`);

      if (pendingLoans.length > 0) {
        console.log('   📋 Prêts en attente d\'approbation:');
        for (const loan of pendingLoans) {
          const user = users.find(u => u.id === loan.user_id);
          const userName = user ? `${user.first_name} ${user.last_name}` : 'Utilisateur inconnu';
          const hasSubs = subsByUser[loan.user_id] ? subsByUser[loan.user_id].length > 0 : false;
          console.log(`   - ${userName}: ${loan.amount} FCFA (${hasSubs ? '✅ Notifications' : '❌ Pas de notifications'})`);
        }
        console.log('');
      }
    }

    // 5. Instructions pour les utilisateurs
    console.log('5. 📖 Instructions pour les utilisateurs:\n');
    console.log('   🔔 Pour recevoir les notifications:');
    console.log('   1. Connectez-vous à l\'application web');
    console.log('   2. Acceptez les notifications push quand le prompt apparaît');
    console.log('   3. Autorisez les notifications dans votre navigateur');
    console.log('   4. Les notifications fonctionnent même si l\'application est fermée');
    console.log('');
    console.log('   📱 Types de notifications reçues:');
    console.log('   - Nouvelle demande de prêt (pour les admins)');
    console.log('   - Prêt approuvé (pour les clients)');
    console.log('   - Dépôt d\'épargne confirmé (pour les clients)');
    console.log('   - Rappels de remboursement (pour les clients)');
    console.log('   - Rappels d\'épargne (pour les clients)');
    console.log('');
    console.log('   ⚠️  Important:');
    console.log('   - Les notifications push fonctionnent même si l\'application est fermée');
    console.log('   - Les abonnements expirent naturellement et doivent être renouvelés');
    console.log('   - Si vous ne recevez plus de notifications, réacceptez-les');

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
  }
}

// Exécuter l'analyse
improveNotificationHandling().then(() => {
  console.log('\n✅ Analyse terminée');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
