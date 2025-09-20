// =====================================================
// SCRIPT DE TEST DE CONNEXION SUPABASE
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 Test de connexion Supabase...');
console.log('URL:', supabaseUrl ? '✅ Configurée' : '❌ Manquante');
console.log('Clé:', supabaseKey ? '✅ Configurée' : '❌ Manquante');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante !');
  console.log('📝 Veuillez configurer vos variables d\'environnement :');
  console.log('   REACT_APP_SUPABASE_URL');
  console.log('   REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🔗 Test de connexion...');
    
    // Test 1: Connexion de base
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      return false;
    }
    
    console.log('✅ Connexion Supabase réussie !');
    
    // Test 2: Vérifier les tables
    console.log('\n📊 Vérification des tables...');
    
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
        const { error: tableError } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (tableError) {
          console.log(`❌ Table ${table}: ${tableError.message}`);
        } else {
          console.log(`✅ Table ${table}: Accessible`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }
    
    // Test 3: Vérifier les politiques RLS
    console.log('\n🔒 Vérification des politiques RLS...');
    
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .limit(5);
      
      if (usersError) {
        console.log(`❌ Politique RLS users: ${usersError.message}`);
      } else {
        console.log(`✅ Politique RLS users: ${users?.length || 0} utilisateurs trouvés`);
      }
    } catch (err) {
      console.log(`❌ Erreur RLS: ${err.message}`);
    }
    
    // Test 4: Vérifier les variables d'environnement
    console.log('\n⚙️ Vérification des variables d\'environnement...');
    
    const envVars = {
      'REACT_APP_SUPABASE_URL': process.env.REACT_APP_SUPABASE_URL,
      'REACT_APP_SUPABASE_ANON_KEY': process.env.REACT_APP_SUPABASE_ANON_KEY,
      'REACT_APP_TWILIO_ACCOUNT_SID': process.env.REACT_APP_TWILIO_ACCOUNT_SID,
      'REACT_APP_TWILIO_AUTH_TOKEN': process.env.REACT_APP_TWILIO_AUTH_TOKEN,
      'REACT_APP_TWILIO_PHONE_NUMBER': process.env.REACT_APP_TWILIO_PHONE_NUMBER,
      'REACT_APP_BACKEND_URL': process.env.REACT_APP_BACKEND_URL,
      'SMS_MODE': process.env.SMS_MODE
    };
    
    Object.entries(envVars).forEach(([key, value]) => {
      if (value) {
        console.log(`✅ ${key}: Configurée`);
      } else {
        console.log(`❌ ${key}: Manquante`);
      }
    });
    
    console.log('\n🎉 Test de connexion terminé !');
    console.log('\n📋 Résumé :');
    console.log('   - Supabase: ✅ Connecté');
    console.log('   - Tables: Vérifiées');
    console.log('   - RLS: Vérifié');
    console.log('   - Variables: Vérifiées');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    return false;
  }
}

// Exécuter le test
testConnection().then(success => {
  if (success) {
    console.log('\n🚀 Prêt pour l\'inscription des utilisateurs !');
  } else {
    console.log('\n⚠️ Des problèmes ont été détectés. Veuillez les corriger.');
  }
  process.exit(success ? 0 : 1);
});
