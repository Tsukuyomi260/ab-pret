// =====================================================
// SCRIPT D'INSPECTION DE LA BASE DE DONNÉES EXISTANTE
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 Inspection de votre base de données Supabase existante...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante !');
  console.log('📝 Veuillez configurer vos variables d\'environnement :');
  console.log('   REACT_APP_SUPABASE_URL');
  console.log('   REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectDatabase() {
  try {
    console.log('🔗 Connexion à Supabase...');
    
    // Test de connexion
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur de connexion:', testError.message);
      return;
    }
    
    console.log('✅ Connexion réussie !\n');
    
    // 1. Vérifier les tables existantes
    console.log('📊 TABLES EXISTANTES :');
    console.log('========================');
    
    const tables = [
      'users',
      'loans', 
      'payments',
      'savings_accounts',
      'savings_transactions',
      'otp_codes'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: Existe`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }
    
    // 2. Compter les enregistrements
    console.log('\n📈 NOMBRE D\'ENREGISTREMENTS :');
    console.log('==============================');
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${table}: Erreur - ${error.message}`);
        } else {
          console.log(`📊 ${table}: ${count || 0} enregistrements`);
        }
      } catch (err) {
        console.log(`❌ ${table}: Erreur - ${err.message}`);
      }
    }
    
    // 3. Vérifier les utilisateurs existants
    console.log('\n👥 UTILISATEURS EXISTANTS :');
    console.log('============================');
    
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, phone_number, status, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (usersError) {
        console.log(`❌ Erreur: ${usersError.message}`);
      } else if (users && users.length > 0) {
        users.forEach((user, index) => {
          console.log(`${index + 1}. ${user.first_name} ${user.last_name}`);
          console.log(`   📧 ${user.email || 'Non renseigné'}`);
          console.log(`   📱 ${user.phone_number}`);
          console.log(`   🏷️ ${user.status} (${user.role})`);
          console.log(`   📅 ${new Date(user.created_at).toLocaleDateString()}`);
          console.log('');
        });
      } else {
        console.log('📭 Aucun utilisateur trouvé');
      }
    } catch (err) {
      console.log(`❌ Erreur: ${err.message}`);
    }
    
    // 4. Vérifier les prêts existants
    console.log('💰 PRÊTS EXISTANTS :');
    console.log('====================');
    
    try {
      const { data: loans, error: loansError } = await supabase
        .from('loans')
        .select(`
          id, amount, purpose, status, created_at,
          users!inner(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (loansError) {
        console.log(`❌ Erreur: ${loansError.message}`);
      } else if (loans && loans.length > 0) {
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
    } catch (err) {
      console.log(`❌ Erreur: ${err.message}`);
    }
    
    // 5. Vérifier les comptes épargne
    console.log('🏦 COMPTES ÉPARGNE :');
    console.log('====================');
    
    try {
      const { data: savings, error: savingsError } = await supabase
        .from('savings_accounts')
        .select(`
          id, balance, monthly_goal, interest_rate, created_at,
          users!inner(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (savingsError) {
        console.log(`❌ Erreur: ${savingsError.message}`);
      } else if (savings && savings.length > 0) {
        savings.forEach((account, index) => {
          console.log(`${index + 1}. ${account.users.first_name} ${account.users.last_name}`);
          console.log(`   💰 Solde: ${account.balance} FCFA`);
          console.log(`   🎯 Objectif: ${account.monthly_goal} FCFA`);
          console.log(`   📈 Intérêt: ${account.interest_rate}%`);
          console.log(`   📅 ${new Date(account.created_at).toLocaleDateString()}`);
          console.log('');
        });
      } else {
        console.log('📭 Aucun compte épargne trouvé');
      }
    } catch (err) {
      console.log(`❌ Erreur: ${err.message}`);
    }
    
    // 6. Vérifier les codes OTP récents
    console.log('🔐 CODES OTP RÉCENTS :');
    console.log('=======================');
    
    try {
      const { data: otps, error: otpsError } = await supabase
        .from('otp_codes')
        .select('phone_number, type, used, expires_at, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (otpsError) {
        console.log(`❌ Erreur: ${otpsError.message}`);
      } else if (otps && otps.length > 0) {
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
    } catch (err) {
      console.log(`❌ Erreur: ${err.message}`);
    }
    
    // 7. Résumé et recommandations
    console.log('📋 RÉSUMÉ ET RECOMMANDATIONS :');
    console.log('================================');
    
    console.log('✅ Votre base de données Supabase est configurée !');
    console.log('📝 Prochaines étapes :');
    console.log('   1. Vérifiez que toutes les tables nécessaires existent');
    console.log('   2. Testez l\'inscription d\'un nouvel utilisateur');
    console.log('   3. Configurez Twilio pour les vrais SMS');
    console.log('   4. Testez les fonctionnalités de prêts et d\'épargne');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'inspection:', error.message);
  }
}

// Exécuter l'inspection
inspectDatabase().then(() => {
  console.log('\n🎉 Inspection terminée !');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
});
