// =====================================================
// VÉRIFICATION DES DONNÉES EXISTANTES
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 Vérification des données existantes...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante !');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExistingData() {
  try {
    console.log('🔗 Connexion à Supabase...');
    
    // 1. Vérifier les utilisateurs
    console.log('👥 UTILISATEURS EXISTANTS :');
    console.log('============================');
    
    try {
      const { data: users, error: usersError, count: usersCount } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, phone_number, status, role, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (usersError) {
        console.log(`❌ Erreur: ${usersError.message}`);
      } else {
        console.log(`📊 Total: ${usersCount || 0} utilisateurs`);
        if (users && users.length > 0) {
          users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.first_name} ${user.last_name}`);
            console.log(`   📧 ${user.email || 'Non renseigné'}`);
            console.log(`   📱 ${user.phone_number || 'Non renseigné'}`);
            console.log(`   🏷️ ${user.status} (${user.role})`);
            console.log(`   📅 ${new Date(user.created_at).toLocaleDateString()}`);
            console.log('');
          });
        } else {
          console.log('📭 Aucun utilisateur trouvé');
        }
      }
    } catch (err) {
      console.log(`❌ Erreur: ${err.message}`);
    }
    
    // 2. Vérifier les prêts
    console.log('💰 PRÊTS EXISTANTS :');
    console.log('====================');
    
    try {
      const { data: loans, error: loansError, count: loansCount } = await supabase
        .from('loans')
        .select(`
          id, amount, purpose, status, created_at,
          users!inner(first_name, last_name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (loansError) {
        console.log(`❌ Erreur: ${loansError.message}`);
      } else {
        console.log(`📊 Total: ${loansCount || 0} prêts`);
        if (loans && loans.length > 0) {
          loans.forEach((loan, index) => {
            console.log(`${index + 1}. ${loan.users.first_name} ${loan.users.last_name}`);
            console.log(`   💰 ${loan.amount} FCFA`);
            console.log(`   📝 ${loan.purpose}`);
            console.log(`   🏷️ ${loan.status}`);
            console.log(`   📅 ${new Date(loan.created_at).toLocaleDateString()}`);
            console.log('');
          });
        } else {
          console.log('📭 Aucun prêt trouvé');
        }
      }
    } catch (err) {
      console.log(`❌ Erreur: ${err.message}`);
    }
    
    // 3. Vérifier les paiements
    console.log('💳 PAIEMENTS EXISTANTS :');
    console.log('=========================');
    
    try {
      const { data: payments, error: paymentsError, count: paymentsCount } = await supabase
        .from('payments')
        .select(`
          id, amount, payment_method, status, payment_date, created_at,
          users!inner(first_name, last_name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (paymentsError) {
        console.log(`❌ Erreur: ${paymentsError.message}`);
      } else {
        console.log(`📊 Total: ${paymentsCount || 0} paiements`);
        if (payments && payments.length > 0) {
          payments.forEach((payment, index) => {
            console.log(`${index + 1}. ${payment.users.first_name} ${payment.users.last_name}`);
            console.log(`   💰 ${payment.amount} FCFA`);
            console.log(`   💳 ${payment.payment_method}`);
            console.log(`   🏷️ ${payment.status}`);
            console.log(`   📅 ${new Date(payment.payment_date).toLocaleDateString()}`);
            console.log('');
          });
        } else {
          console.log('📭 Aucun paiement trouvé');
        }
      }
    } catch (err) {
      console.log(`❌ Erreur: ${err.message}`);
    }
    
    // 4. Vérifier les codes OTP
    console.log('🔐 CODES OTP RÉCENTS :');
    console.log('=======================');
    
    try {
      const { data: otps, error: otpsError, count: otpsCount } = await supabase
        .from('otp_codes')
        .select('phone_number, type, used, expires_at, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (otpsError) {
        console.log(`❌ Erreur: ${otpsError.message}`);
      } else {
        console.log(`📊 Total: ${otpsCount || 0} codes OTP`);
        if (otps && otps.length > 0) {
          otps.forEach((otp, index) => {
            console.log(`${index + 1}. ${otp.phone_number}`);
            console.log(`   🏷️ Type: ${otp.type}`);
            console.log(`   ✅ Utilisé: ${otp.used ? 'Oui' : 'Non'}`);
            console.log(`   ⏰ Expire: ${new Date(otp.expires_at).toLocaleString()}`);
            console.log(`   📅 Créé: ${new Date(otp.created_at).toLocaleString()}`);
            console.log('');
          });
        } else {
          console.log('📭 Aucun code OTP trouvé');
        }
      }
    } catch (err) {
      console.log(`❌ Erreur: ${err.message}`);
    }
    
    // 5. Résumé et recommandations
    console.log('📋 RÉSUMÉ ET PROCHAINES ÉTAPES :');
    console.log('==================================');
    
    console.log('✅ Votre base de données contient déjà des données !');
    console.log('📝 Prochaines étapes :');
    console.log('   1. Exécutez le script SQL pour créer les tables d\'épargne manquantes');
    console.log('   2. Testez l\'inscription d\'un nouvel utilisateur');
    console.log('   3. Configurez Twilio pour les vrais SMS');
    console.log('   4. Testez les fonctionnalités complètes');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkExistingData().then(() => {
  console.log('\n✅ Vérification terminée !');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
});
