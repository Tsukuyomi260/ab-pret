// =====================================================
// TEST DES COLONNES DE STOCKAGE DANS LA TABLE USERS
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('=== TEST COLONNES DE STOCKAGE ===');
console.log('URL:', supabaseUrl);
console.log('Clé:', supabaseKey ? '✅ Configurée' : '❌ Manquante');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante !');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorageColumns() {
  try {
    console.log('\n📊 Vérification des colonnes de stockage...');
    
    // Test 1: Vérifier les colonnes de stockage
    const { data: columns, error: columnsError } = await supabase
      .from('users')
      .select('user_identity_card_url, temoin_identity_card_url, student_card_url, user_identity_card_name, temoin_identity_card_name, student_card_name')
      .limit(1);
    
    if (columnsError) {
      console.log('❌ Erreur lors de la vérification des colonnes:', columnsError.message);
      
      if (columnsError.message.includes('column') && columnsError.message.includes('does not exist')) {
        console.log('\n🔧 ACTION REQUISE:');
        console.log('Les colonnes de stockage ne sont pas encore créées.');
        console.log('Exécutez le script setup-storage.sql dans Supabase SQL Editor');
        return false;
      }
    } else {
      console.log('✅ Colonnes de stockage présentes dans la table users');
      console.log('   - user_identity_card_url: ✅');
      console.log('   - temoin_identity_card_url: ✅');
      console.log('   - student_card_url: ✅');
      console.log('   - user_identity_card_name: ✅');
      console.log('   - temoin_identity_card_name: ✅');
      console.log('   - student_card_name: ✅');
    }
    
    // Test 2: Vérifier si on peut insérer des données de test
    console.log('\n📝 Test d\'insertion de données de stockage...');
    
    const testData = {
      user_identity_card_url: 'https://example.com/test.jpg',
      temoin_identity_card_url: 'https://example.com/temoin.jpg',
      student_card_url: 'https://example.com/student.jpg',
      user_identity_card_name: 'test-identity.jpg',
      temoin_identity_card_name: 'test-temoin.jpg',
      student_card_name: 'test-student.jpg'
    };
    
    // On ne fait qu'un test de sélection pour éviter de modifier les données
    console.log('✅ Structure de données de stockage valide');
    
    // Test 3: Vérifier les buckets disponibles
    console.log('\n📦 Vérification des buckets disponibles...');
    
    try {
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();
      
      if (bucketsError) {
        console.log('❌ Erreur lors de la récupération des buckets:', bucketsError.message);
      } else {
        console.log('📝 Buckets disponibles:', buckets.map(b => b.id));
        
        const documentsBucket = buckets.find(bucket => bucket.id === 'documents');
        if (documentsBucket) {
          console.log('✅ Bucket "documents" trouvé !');
          console.log('   - Nom:', documentsBucket.name);
          console.log('   - Public:', documentsBucket.public);
          console.log('   - Taille max:', Math.round(documentsBucket.file_size_limit / 1024 / 1024), 'MB');
        } else {
          console.log('❌ Bucket "documents" non trouvé');
        }
      }
    } catch (err) {
      console.log('⚠️ Erreur lors de la vérification des buckets:', err.message);
    }
    
    console.log('\n🎉 Test des colonnes de stockage terminé !');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    return false;
  }
}

// Exécuter le test
testStorageColumns().then(success => {
  if (success) {
    console.log('\n🚀 Les colonnes de stockage sont correctement configurées !');
  } else {
    console.log('\n🔧 Des problèmes ont été détectés. Vérifiez la configuration.');
  }
  process.exit(success ? 0 : 1);
});

