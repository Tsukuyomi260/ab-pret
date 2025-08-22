// =====================================================
// TEST DES DONNÉES MOMO
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('=== TEST DONNÉES MOMO ===');
console.log('URL:', supabaseUrl);
console.log('Clé:', supabaseKey ? '✅ Configurée' : '❌ Manquante');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante !');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMomoData() {
  try {
    console.log('\n🔍 TEST 1: Vérification de la structure de la table loans');
    console.log('=' .repeat(60));
    
    // Test 1: Vérifier la structure de la table loans
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'loans')
      .eq('table_schema', 'public')
      .like('column_name', '%momo%');
    
    if (columnsError) {
      console.log('❌ Erreur lors de la vérification des colonnes:', columnsError.message);
    } else {
      console.log('📋 Colonnes Momo trouvées:');
      if (columns && columns.length > 0) {
        columns.forEach(col => {
          console.log(`   - ${col.column_name} (${col.data_type})`);
        });
      } else {
        console.log('   ❌ Aucune colonne Momo trouvée !');
      }
    }
    
    console.log('\n🔍 TEST 2: Vérification des données Momo existantes');
    console.log('=' .repeat(60));
    
    // Test 2: Vérifier les données Momo existantes
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select(`
        id,
        user_id,
        momo_number,
        momo_network,
        momo_name,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (loansError) {
      console.log('❌ Erreur lors de la récupération des prêts:', loansError.message);
    } else {
      console.log('📋 Prêts trouvés:', loans?.length || 0);
      if (loans && loans.length > 0) {
        loans.forEach((loan, index) => {
          console.log(`\n   Prêt ${index + 1}:`);
          console.log(`   - ID: ${loan.id}`);
          console.log(`   - User ID: ${loan.user_id}`);
          console.log(`   - Momo Number: ${loan.momo_number || 'NULL'}`);
          console.log(`   - Momo Network: ${loan.momo_network || 'NULL'}`);
          console.log(`   - Momo Name: ${loan.momo_name || 'NULL'}`);
          console.log(`   - Date: ${loan.created_at}`);
        });
      } else {
        console.log('   ❌ Aucun prêt trouvé !');
      }
    }
    
    console.log('\n🔍 TEST 3: Test de la fonction getLoans');
    console.log('=' .repeat(60));
    
    // Test 3: Tester la fonction getLoans
    const { getLoans } = require('./src/utils/supabaseAPI');
    const loansResult = await getLoans();
    
    if (loansResult.success) {
      console.log('✅ getLoans fonctionne');
      console.log('📋 Prêts récupérés:', loansResult.data?.length || 0);
      
      if (loansResult.data && loansResult.data.length > 0) {
        const firstLoan = loansResult.data[0];
        console.log('\n   Premier prêt:');
        console.log(`   - ID: ${firstLoan.id}`);
        console.log(`   - Momo Number: ${firstLoan.momo_number || 'NULL'}`);
        console.log(`   - Momo Network: ${firstLoan.momo_network || 'NULL'}`);
        console.log(`   - Momo Name: ${firstLoan.momo_name || 'NULL'}`);
        console.log(`   - User: ${firstLoan.users?.first_name || 'NULL'} ${firstLoan.users?.last_name || 'NULL'}`);
      }
    } else {
      console.log('❌ Erreur getLoans:', loansResult.error);
    }
    
    console.log('\n📋 RÉSUMÉ');
    console.log('=' .repeat(60));
    
    const momoColumnsExist = columns && columns.length > 0;
    const momoDataExists = loans && loans.some(loan => loan.momo_number || loan.momo_network || loan.momo_name);
    const getLoansWorks = loansResult.success;
    
    console.log(`Colonnes Momo: ${momoColumnsExist ? '✅ Existent' : '❌ Manquantes'}`);
    console.log(`Données Momo: ${momoDataExists ? '✅ Présentes' : '❌ Absentes'}`);
    console.log(`getLoans: ${getLoansWorks ? '✅ Fonctionne' : '❌ Erreur'}`);
    
    if (!momoColumnsExist) {
      console.log('\n🔧 SOLUTION: Ajouter les colonnes Momo à la table loans');
      console.log('Exécutez ce script SQL:');
      console.log(`
ALTER TABLE public.loans 
ADD COLUMN IF NOT EXISTS momo_number TEXT,
ADD COLUMN IF NOT EXISTS momo_network TEXT,
ADD COLUMN IF NOT EXISTS momo_name TEXT;
      `);
    }
    
    if (!momoDataExists && momoColumnsExist) {
      console.log('\n🔧 SOLUTION: Les colonnes existent mais pas de données');
      console.log('Cela signifie que les prêts existants n\'ont pas de données Momo');
      console.log('Les nouveaux prêts devraient avoir ces données');
    }
    
    return momoColumnsExist && getLoansWorks;
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    return false;
  }
}

// Exécuter le test
testMomoData().then(success => {
  if (success) {
    console.log('\n🎉 Configuration Momo validée !');
    console.log('📱 Les données Momo devraient s\'afficher dans le dashboard admin');
  } else {
    console.log('\n🔧 Problème détecté !');
    console.log('📝 Vérifiez la configuration de la base de données');
  }
  process.exit(success ? 0 : 1);
});
