// Script pour diagnostiquer et corriger le problème de connexion d'un client
require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./utils/supabaseClient-server');

const CLIENT_EMAIL = 'abpret51@gmail.com'; // Changez avec l'email du client

async function checkClientLogin() {
  console.log('\n=== 🔍 Diagnostic Connexion Client ===\n');
  console.log(`📧 Email: ${CLIENT_EMAIL}\n`);

  try {
    // 1. Vérifier l'utilisateur dans users
    console.log('1️⃣ Vérification dans la table users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', CLIENT_EMAIL)
      .single();

    if (userError || !userData) {
      console.error('❌ Utilisateur non trouvé dans users:', userError?.message);
      return;
    }

    console.log('✅ Utilisateur trouvé:');
    console.log('   ID:', userData.id);
    console.log('   Nom:', userData.first_name, userData.last_name);
    console.log('   Rôle:', userData.role);
    console.log('   Status:', userData.status);

    // 2. Vérifier dans auth.users
    console.log('\n2️⃣ Vérification dans auth.users...');
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userData.id);
      
      if (authError || !authUser) {
        console.error('❌ Utilisateur non trouvé dans auth.users:', authError?.message);
      } else {
        console.log('✅ Utilisateur trouvé dans auth.users:');
        console.log('   Email:', authUser.user.email);
        console.log('   Email confirmé:', authUser.user.email_confirmed_at ? 'Oui' : 'Non');
        console.log('   Métadonnées:', authUser.user.user_metadata);
      }
    } catch (adminError) {
      console.log('⚠️  Impossible d\'accéder à auth.users (nécessite service role key)');
    }

    // 3. Vérifier les prêts de l'utilisateur
    console.log('\n3️⃣ Vérification des prêts...');
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', userData.id);

    if (loansError) {
      console.error('❌ Erreur récupération prêts:', loansError.message);
    } else {
      console.log(`✅ ${loans?.length || 0} prêt(s) trouvé(s)`);
    }

    // 4. Vérifier les plans d'épargne
    console.log('\n4️⃣ Vérification des plans d\'épargne...');
    const { data: savings, error: savingsError } = await supabase
      .from('savings_plans')
      .select('*')
      .eq('user_id', userData.id);

    if (savingsError) {
      console.error('❌ Erreur récupération épargne:', savingsError.message);
    } else {
      console.log(`✅ ${savings?.length || 0} plan(s) d'épargne trouvé(s)`);
    }

    // 5. Recommandations
    console.log('\n=== 💡 RECOMMANDATIONS ===\n');
    
    if (userData.status !== 'approved') {
      console.log('⚠️  Le statut de l\'utilisateur n\'est pas "approved"');
      console.log('   → Solution: Mettre à jour le status à "approved"');
      console.log(`   → Commande SQL: UPDATE users SET status = 'approved' WHERE id = '${userData.id}';`);
    }

    if (!userData.role || userData.role === 'client') {
      console.log('ℹ️  Rôle actuel: client (normal pour un client)');
    }

    console.log('\n=== ✅ Diagnostic terminé ===\n');

  } catch (error) {
    console.error('\n❌ Erreur générale:', error.message);
    console.error('Stack:', error.stack);
  }
}

checkClientLogin().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Erreur fatale:', error);
  process.exit(1);
});
