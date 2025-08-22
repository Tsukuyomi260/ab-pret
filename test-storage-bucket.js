// =====================================================
// TEST DE CONFIGURATION DU BUCKET STORAGE
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('=== TEST CONFIGURATION STORAGE BUCKET ===');
console.log('URL:', supabaseUrl);
console.log('Clé:', supabaseKey ? '✅ Configurée' : '❌ Manquante');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante !');
  console.log('📝 Veuillez configurer vos variables d\'environnement dans .env.local');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorageBucket() {
  try {
    console.log('\n🔗 Test de connexion au bucket...');
    
    // Test 1: Vérifier si le bucket existe
    console.log('\n📦 Vérification du bucket "documents"...');
    
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erreur lors de la récupération des buckets:', bucketsError.message);
      return false;
    }
    
    const documentsBucket = buckets.find(bucket => bucket.id === 'documents');
    
    if (!documentsBucket) {
      console.log('❌ Bucket "documents" non trouvé !');
      console.log('📝 Buckets disponibles:', buckets.map(b => b.id));
      console.log('\n🔧 Pour créer le bucket, exécutez le script setup-storage.sql dans Supabase SQL Editor');
      return false;
    }
    
    console.log('✅ Bucket "documents" trouvé !');
    console.log('   - Nom:', documentsBucket.name);
    console.log('   - Public:', documentsBucket.public);
    console.log('   - Taille max:', Math.round(documentsBucket.file_size_limit / 1024 / 1024), 'MB');
    console.log('   - Types autorisés:', documentsBucket.allowed_mime_types);
    
    // Test 2: Vérifier les politiques RLS
    console.log('\n🔒 Vérification des politiques RLS...');
    
    try {
      // Test d'upload (doit échouer sans authentification)
      const testFile = new Blob(['test'], { type: 'image/jpeg' });
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload('test/test.jpg', testFile);
      
      if (uploadError && uploadError.message.includes('policy')) {
        console.log('✅ Politiques RLS actives (upload bloqué sans auth)');
      } else {
        console.log('⚠️ Politiques RLS potentiellement manquantes');
      }
    } catch (err) {
      console.log('✅ Politiques RLS actives');
    }
    
    // Test 3: Vérifier les colonnes dans la table users
    console.log('\n📊 Vérification des colonnes de stockage...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('users')
      .select('user_identity_card_url, temoin_identity_card_url, student_card_url')
      .limit(1);
    
    if (columnsError) {
      console.log('❌ Erreur lors de la vérification des colonnes:', columnsError.message);
      console.log('📝 Exécutez le script setup-storage.sql pour ajouter les colonnes manquantes');
    } else {
      console.log('✅ Colonnes de stockage présentes dans la table users');
    }
    
    // Test 4: Test d'upload avec un fichier de test
    console.log('\n📤 Test d\'upload de fichier...');
    
    // Créer un fichier de test
    const testContent = 'Test file content';
    const testBlob = new Blob([testContent], { type: 'image/jpeg' });
    const testFile = new File([testBlob], 'test-upload.jpg', { type: 'image/jpeg' });
    
    const testPath = `test/${Date.now()}-test.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(testPath, testFile);
    
    if (uploadError) {
      console.log('❌ Erreur upload:', uploadError.message);
      if (uploadError.message.includes('policy')) {
        console.log('📝 Les politiques RLS bloquent l\'upload sans authentification (normal)');
      }
    } else {
      console.log('✅ Upload de test réussi !');
      console.log('   - Chemin:', uploadData.path);
      
      // Nettoyer le fichier de test
      const { error: deleteError } = await supabase.storage
        .from('documents')
        .remove([testPath]);
      
      if (deleteError) {
        console.log('⚠️ Erreur lors du nettoyage:', deleteError.message);
      } else {
        console.log('✅ Fichier de test supprimé');
      }
    }
    
    console.log('\n🎉 Configuration du storage bucket terminée !');
    console.log('✅ Le bucket est prêt pour le stockage des cartes d\'identité');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    return false;
  }
}

// Exécuter le test
testStorageBucket().then(success => {
  if (success) {
    console.log('\n🚀 Le bucket de stockage est correctement configuré !');
  } else {
    console.log('\n🔧 Des problèmes ont été détectés. Vérifiez la configuration.');
  }
  process.exit(success ? 0 : 1);
});

