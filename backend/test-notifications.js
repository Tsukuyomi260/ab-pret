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

async function testNotifications() {
  console.log('🧪 Test du système de notifications...\n');

  try {
    // 1. Vérifier les abonnements push
    console.log('1. Vérification des abonnements push...');
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .limit(5);
    
    if (subError) {
      console.error('❌ Erreur récupération abonnements:', subError);
    } else {
      console.log('✅ Abonnements push récupérés');
      console.log(`   - Nombre d'abonnements: ${subscriptions?.length || 0}`);
      if (subscriptions && subscriptions.length > 0) {
        subscriptions.forEach((sub, index) => {
          console.log(`   Abonnement ${index + 1}:`, {
            id: sub.id,
            user_id: sub.user_id,
            created_at: sub.created_at
          });
        });
      }
    }

    // 2. Vérifier les utilisateurs récents
    console.log('\n2. Vérification des utilisateurs récents...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (usersError) {
      console.error('❌ Erreur récupération utilisateurs:', usersError);
    } else {
      console.log('✅ Utilisateurs récents récupérés');
      users?.forEach((user, index) => {
        console.log(`   Utilisateur ${index + 1}:`, {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          created_at: user.created_at
        });
      });
    }

    // 3. Vérifier les plans d'épargne récents
    console.log('\n3. Vérification des plans d\'épargne récents...');
    const { data: plans, error: plansError } = await supabase
      .from('savings_plans')
      .select('id, user_id, plan_name, current_balance, total_deposited, status, updated_at')
      .order('updated_at', { ascending: false })
      .limit(3);
    
    if (plansError) {
      console.error('❌ Erreur récupération plans:', plansError);
    } else {
      console.log('✅ Plans d\'épargne récents récupérés');
      plans?.forEach((plan, index) => {
        console.log(`   Plan ${index + 1}:`, {
          id: plan.id,
          user_id: plan.user_id,
          plan_name: plan.plan_name,
          current_balance: plan.current_balance,
          total_deposited: plan.total_deposited,
          status: plan.status,
          updated_at: plan.updated_at
        });
      });
    }

    // 4. Test d'envoi de notification (si des abonnements existent)
    if (subscriptions && subscriptions.length > 0) {
      console.log('\n4. Test d\'envoi de notification...');
      const testUser = subscriptions[0];
      
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/notify-savings-deposit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientName: 'Test User',
            amount: '1,000 FCFA',
            userId: testUser.user_id
          })
        });
        
        if (response.ok) {
          console.log('✅ Notification de test envoyée avec succès');
        } else {
          console.error('❌ Erreur envoi notification de test:', await response.text());
        }
      } catch (error) {
        console.error('❌ Erreur lors du test de notification:', error);
      }
    } else {
      console.log('\n4. Aucun abonnement trouvé - test de notification ignoré');
    }

    // 5. Recommandations
    console.log('\n📋 Recommandations:');
    if (!subscriptions || subscriptions.length === 0) {
      console.log('   - Aucun utilisateur n\'est abonné aux notifications push');
      console.log('   - Vérifiez que le prompt de notifications s\'affiche correctement');
      console.log('   - Testez l\'abonnement depuis l\'interface utilisateur');
    } else {
      console.log(`   - ${subscriptions.length} utilisateur(s) abonné(s) aux notifications`);
      console.log('   - Les notifications de dépôt devraient fonctionner');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testNotifications().then(() => {
  console.log('\n🏁 Test terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
