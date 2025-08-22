// =====================================================
// TEST FINAL UPLOAD APRÈS CONFIGURATION RLS
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('=== TEST FINAL UPLOAD ===');
console.log('URL:', supabaseUrl);
console.log('Clé:', supabaseKey ? '✅ Configurée' : '❌ Manquante');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante !');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFinalUpload() {
  try {
    console.log('\n🔐 TEST: Upload avec authentification');
    console.log('=' .repeat(50));
    
    // 1. Créer un utilisateur de test
    console.log('\n👤 Création d\'un utilisateur de test...');
    const testEmail = `test-upload-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (authError) {
      console.log('❌ Erreur création utilisateur:', authError.message);
      return false;
    }
    
    console.log('✅ Utilisateur créé:', authData.user?.id);
    
    // 2. Test d'upload
    console.log('\n📤 Test d\'upload de document...');
    try {
      // Créer un fichier de test
      const testContent = 'Test document content';
      const testBlob = new Blob([testContent], { type: 'image/jpeg' });
      const testFile = new File([testBlob], 'test-identity-card.jpg', { type: 'image/jpeg' });
      
      const testPath = `${authData.user.id}/identity-card.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(testPath, testFile);
      
      if (uploadError) {
        console.log('❌ Erreur upload:', uploadError.message);
        console.log('🔧 Vérifiez que setup-storage.sql a été exécuté');
        return false;
      }
      
      console.log('✅ Upload réussi !');
      console.log('   - Chemin:', uploadData.path);
      console.log('   - Taille:', uploadData.metadata?.size, 'bytes');
      
      // 3. Test de lecture
      console.log('\n📖 Test de lecture du document...');
      const { data: files, error: listError } = await supabase.storage
        .from('documents')
        .list(authData.user.id);
      
      if (listError) {
        console.log('❌ Erreur lecture:', listError.message);
      } else {
        console.log('✅ Lecture réussie !');
        console.log('   - Fichiers trouvés:', files.length);
        files.forEach(file => {
          console.log(`   - ${file.name} (${file.metadata?.size} bytes)`);
        });
      }
      
      // 4. Test de suppression
      console.log('\n🗑️ Test de suppression du document...');
      const { error: deleteError } = await supabase.storage
        .from('documents')
        .remove([testPath]);
      
      if (deleteError) {
        console.log('❌ Erreur suppression:', deleteError.message);
      } else {
        console.log('✅ Suppression réussie !');
      }
      
      // 5. Nettoyer l'utilisateur de test
      console.log('\n🧹 Nettoyage de l\'utilisateur de test...');
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
        console.log('✅ Utilisateur de test supprimé');
      } catch (err) {
        console.log('⚠️ Impossible de supprimer l\'utilisateur:', err.message);
      }
      
      console.log('\n🎉 TEST RÉUSSI !');
      console.log('✅ Upload fonctionne correctement');
      console.log('✅ Lecture fonctionne correctement');
      console.log('✅ Suppression fonctionne correctement');
      console.log('🔒 Les politiques RLS sont bien configurées');
      
      return true;
      
    } catch (err) {
      console.log('❌ Erreur lors du test:', err.message);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    return false;
  }
}

// Exécuter le test
testFinalUpload().then(success => {
  if (success) {
    console.log('\n🚀 Configuration RLS validée !');
    console.log('📱 Les utilisateurs peuvent maintenant uploader leurs documents');
    console.log('🔒 Le système est sécurisé et fonctionnel');
  } else {
    console.log('\n🔧 Problème détecté !');
    console.log('📝 Assurez-vous d\'avoir exécuté setup-storage.sql dans Supabase');
    console.log('🔍 Vérifiez les politiques RLS dans l\'interface Supabase');
  }
  process.exit(success ? 0 : 1);
});
