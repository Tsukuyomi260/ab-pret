// =====================================================
// VÉRIFICATION DES TABLES EXISTANTES
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 Vérification des tables existantes...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante !');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExistingTables() {
  try {
    console.log('🔗 Connexion à Supabase...');
    
    // Liste des tables à vérifier
    const tablesToCheck = [
      'users',
      'loans', 
      'payments',
      'savings_accounts',
      'savings_transactions',
      'otp_codes'
    ];
    
    console.log('📊 TABLES EXISTANTES :');
    console.log('========================');
    
    const existingTables = [];
    const missingTables = [];
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
          missingTables.push(table);
        } else {
          console.log(`✅ ${table}: Existe`);
          existingTables.push(table);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
        missingTables.push(table);
      }
    }
    
    console.log('\n📋 RÉSUMÉ :');
    console.log('============');
    console.log(`✅ Tables existantes (${existingTables.length}): ${existingTables.join(', ')}`);
    console.log(`❌ Tables manquantes (${missingTables.length}): ${missingTables.join(', ')}`);
    
    if (missingTables.length > 0) {
      console.log('\n🔧 ACTIONS NÉCESSAIRES :');
      console.log('==========================');
      console.log('1. Exécutez le script SQL complet pour créer les tables manquantes');
      console.log('2. Ou créez manuellement les tables manquantes dans Supabase');
      console.log('\n📝 Script SQL disponible dans : supabase_schema.sql');
    } else {
      console.log('\n🎉 Toutes les tables nécessaires existent !');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkExistingTables().then(() => {
  console.log('\n✅ Vérification terminée !');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
});
