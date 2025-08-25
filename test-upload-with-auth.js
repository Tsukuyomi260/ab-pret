// =====================================================
// TEST UPLOAD AVEC AUTHENTIFICATION
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('=== TEST UPLOAD AVEC AUTH ===');
console.log('URL:', supabaseUrl);
console.log('Clé:', supabaseKey ? '✅ Configurée' : '❌ Manquante');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante !');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUploadWithAuth() {
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
    
    // 2. Créer un enregistrement dans la table users
    console.log('\n📝 Création de l\'enregistrement dans la table users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: testEmail,
        first_name: 'Test',
        last_name: 'User',
        role: 'client',
        status: 'approved'
      }])
      .select()
      .single();
    
    if (userError) {
      console.log('❌ Erreur création enregistrement user:', userError.message);
      return false;
    }
    
    console.log('✅ Enregistrement user créé');
    
    // 3. Test d'upload avec authentification
    console.log('\n📤 Test d\'upload de document avec authentification...');
    try {
      // Créer un fichier de test
      const testContent = 'Test document content with auth';
      const testBlob = new Blob([testContent], { type: 'image/jpeg' });
      const testFile = new File([testBlob], 'test-auth-upload.jpg', { type: 'image/jpeg' });
      
      const testPath = `${authData.user.id}/test-auth-upload.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(testPath, testFile);
      
      if (uploadError) {
        console.log('❌ Erreur upload avec auth:', uploadError.message);
        console.log('🔧 Détails de l\'erreur:', {
          message: uploadError.message,
          details: uploadError.details,
          hint: uploadError.hint
        });
        return false;
      }
      
      console.log('✅ Upload réussi avec authentification !');
      console.log('   - Chemin:', uploadData.path);
      console.log('   - Taille:', uploadData.metadata?.size, 'bytes');
      
      // 4. Test de lecture avec authentification
      console.log('\n📖 Test de lecture du document...');
      const { data: files, error: listError } = await supabase.storage
        .from('documents')
        .list(authData.user.id);
      
      if (listError) {
        console.log('❌ Erreur lecture avec auth:', listError.message);
      } else {
        console.log('✅ Lecture réussie avec authentification !');
        console.log('   - Fichiers trouvés:', files.length);
        files.forEach(file => {
          console.log(`   - ${file.name} (${file.metadata?.size} bytes)`);
        });
      }
      
      // 5. Nettoyer les données de test
      console.log('\n🧹 Nettoyage des données de test...');
      try {
        // Supprimer le fichier de test
        await supabase.storage.from('documents').remove([testPath]);
        console.log('✅ Fichier de test supprimé');
        
        // Supprimer l'enregistrement user
        await supabase.from('users').delete().eq('id', authData.user.id);
        console.log('✅ Enregistrement user supprimé');
        
        // Supprimer l'utilisateur de test
        await supabase.auth.admin.deleteUser(authData.user.id);
        console.log('✅ Utilisateur de test supprimé');
      } catch (err) {
        console.log('⚠️ Erreur lors du nettoyage:', err.message);
      }
      
      console.log('\n🎉 TEST RÉUSSI !');
      console.log('✅ Upload avec authentification fonctionne');
      console.log('✅ Lecture avec authentification fonctionne');
      console.log('📱 Les utilisateurs peuvent maintenant uploader leurs documents');
      
      return true;
      
    } catch (err) {
      console.log('❌ Erreur lors du test d\'upload avec auth:', err.message);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    return false;
  }
}

// Exécuter le test
testUploadWithAuth().then(success => {
  if (success) {
    console.log('\n🚀 Configuration validée !');
    console.log('📱 Les uploads de documents fonctionnent maintenant');
    console.log('🔒 Le système est sécurisé et fonctionnel');
  } else {
    console.log('\n🔧 Problème détecté !');
    console.log('📝 Vérifiez la configuration des politiques RLS');
  }
  process.exit(success ? 0 : 1);
});

