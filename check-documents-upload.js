// =====================================================
// VÉRIFICATION DES UPLOADS DE DOCUMENTS
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('=== VÉRIFICATION UPLOADS DOCUMENTS ===');
console.log('URL:', supabaseUrl);
console.log('Clé:', supabaseKey ? '✅ Configurée' : '❌ Manquante');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante !');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDocumentsUpload() {
  try {
    console.log('\n🔍 TEST 1: Vérification du bucket documents');
    console.log('=' .repeat(60));
    
    // Test 1: Vérifier le contenu du bucket documents
    const { data: files, error: filesError } = await supabase.storage
      .from('documents')
      .list('', { limit: 100 });
    
    if (filesError) {
      console.log('❌ Erreur lors de la vérification du bucket:', filesError.message);
    } else {
      console.log('📋 Fichiers dans le bucket documents:', files?.length || 0);
      if (files && files.length > 0) {
        files.forEach((file, index) => {
          console.log(`   ${index + 1}. ${file.name} (${file.metadata?.size || 0} bytes)`);
        });
      } else {
        console.log('   ❌ Aucun fichier trouvé dans le bucket !');
      }
    }
    
    console.log('\n🔍 TEST 2: Vérification des utilisateurs récents');
    console.log('=' .repeat(60));
    
    // Test 2: Vérifier les utilisateurs récents
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        user_identity_card_name,
        temoin_identity_card_name,
        student_card_name,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (usersError) {
      console.log('❌ Erreur lors de la récupération des utilisateurs:', usersError.message);
    } else {
      console.log('📋 Utilisateurs récents:', users?.length || 0);
      if (users && users.length > 0) {
        users.forEach((user, index) => {
          console.log(`\n   Utilisateur ${index + 1}:`);
          console.log(`   - Nom: ${user.first_name} ${user.last_name}`);
          console.log(`   - Email: ${user.email}`);
          console.log(`   - Carte d'identité: ${user.user_identity_card_name || 'Non spécifié'}`);
          console.log(`   - Carte témoin: ${user.temoin_identity_card_name || 'Non spécifié'}`);
          console.log(`   - Carte étudiant: ${user.student_card_name || 'Non spécifié'}`);
          console.log(`   - Date création: ${user.created_at}`);
        });
      } else {
        console.log('   ❌ Aucun utilisateur trouvé !');
      }
    }
    
    console.log('\n🔍 TEST 3: Test d\'upload de document');
    console.log('=' .repeat(60));
    
    // Test 3: Tester l'upload d'un document
    console.log('📤 Test d\'upload d\'un document de test...');
    try {
      // Créer un fichier de test
      const testContent = 'Test document content';
      const testBlob = new Blob([testContent], { type: 'image/jpeg' });
      const testFile = new File([testBlob], 'test-upload.jpg', { type: 'image/jpeg' });
      
      const testPath = `test/test-upload-${Date.now()}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(testPath, testFile);
      
      if (uploadError) {
        console.log('❌ Erreur upload:', uploadError.message);
        console.log('🔧 Problème possible:');
        console.log('   - Politiques RLS mal configurées');
        console.log('   - Bucket non accessible');
        console.log('   - Permissions insuffisantes');
      } else {
        console.log('✅ Upload réussi !');
        console.log('   - Chemin:', uploadData.path);
        console.log('   - Taille:', uploadData.metadata?.size, 'bytes');
        
        // Nettoyer le fichier de test
        await supabase.storage.from('documents').remove([testPath]);
        console.log('   - Fichier de test supprimé');
      }
    } catch (err) {
      console.log('❌ Erreur lors du test d\'upload:', err.message);
    }
    
    console.log('\n🔍 TEST 4: Vérification des politiques RLS');
    console.log('=' .repeat(60));
    
    // Test 4: Vérifier les politiques RLS
    console.log('🔒 Vérification des politiques RLS...');
    try {
      // Tentative d'upload sans authentification
      const testContent = 'Test RLS';
      const testBlob = new Blob([testContent], { type: 'image/jpeg' });
      const testFile = new File([testBlob], 'test-rls.jpg', { type: 'image/jpeg' });
      
      const { data: rlsData, error: rlsError } = await supabase.storage
        .from('documents')
        .upload(`test-rls-${Date.now()}.jpg`, testFile);
      
      if (rlsError) {
        if (rlsError.message.includes('policy') || rlsError.message.includes('row-level security')) {
          console.log('✅ Politiques RLS actives: Upload bloqué sans authentification');
        } else {
          console.log('⚠️ Erreur différente:', rlsError.message);
        }
      } else {
        console.log('❌ ATTENTION: Upload réussi sans authentification !');
        console.log('   Les politiques RLS ne sont pas correctement configurées');
        
        // Nettoyer
        await supabase.storage.from('documents').remove([rlsData.path]);
      }
    } catch (err) {
      console.log('✅ Politiques RLS actives: Upload bloqué');
    }
    
    console.log('\n📋 RÉSUMÉ');
    console.log('=' .repeat(60));
    
    const bucketHasFiles = files && files.length > 0;
    const usersHaveDocuments = users && users.some(user => 
      user.user_identity_card_name || user.temoin_identity_card_name || user.student_card_name
    );
    
    console.log(`Bucket documents: ${bucketHasFiles ? '✅ Contient des fichiers' : '❌ Vide'}`);
    console.log(`Utilisateurs avec documents: ${usersHaveDocuments ? '✅ Ont des documents' : '❌ Pas de documents'}`);
    
    if (!bucketHasFiles && usersHaveDocuments) {
      console.log('\n🔧 PROBLÈME DÉTECTÉ !');
      console.log('Les utilisateurs ont des noms de documents mais le bucket est vide');
      console.log('Cela peut indiquer:');
      console.log('   - Problème lors de l\'upload');
      console.log('   - Documents supprimés');
      console.log('   - Problème de configuration RLS');
    }
    
    if (!bucketHasFiles && !usersHaveDocuments) {
      console.log('\n🔧 PROBLÈME DÉTECTÉ !');
      console.log('Aucun document uploadé');
      console.log('Cela peut indiquer:');
      console.log('   - Problème dans le formulaire d\'inscription');
      console.log('   - Problème de configuration RLS');
      console.log('   - Problème de permissions');
    }
    
    return bucketHasFiles || usersHaveDocuments;
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    return false;
  }
}

// Exécuter la vérification
checkDocumentsUpload().then(success => {
  if (success) {
    console.log('\n🎉 Documents trouvés !');
  } else {
    console.log('\n🔧 Problème détecté !');
    console.log('📝 Vérifiez la configuration des uploads');
  }
  process.exit(success ? 0 : 1);
});


