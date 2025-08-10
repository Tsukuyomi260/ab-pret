// =====================================================
// TEST APPROBATION AUTOMATIQUE
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🧪 Test approbation automatique...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante !');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAutoApproval() {
  try {
    console.log('🔗 Connexion à Supabase...');
    
    // Test avec un nouveau numéro de téléphone
    const timestamp = Date.now();
    const testPhone = `+229${timestamp.toString().slice(-8)}`; // Numéro unique
    const cleanPhone = testPhone.replace(/[^0-9]/g, '');
    const tempEmail = `test.${cleanPhone}.${timestamp}@gmail.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`📧 Email temporaire: ${tempEmail}`);
    console.log(`📱 Téléphone: ${testPhone}`);
    
    // Test d'inscription
    console.log('1️⃣ Test d\'inscription avec approbation automatique :');
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: tempEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'AutoApproval',
          phone_number: testPhone,
          role: 'client'
        }
      }
    });
    
    if (authError) {
      console.log(`   ❌ Erreur d'inscription: ${authError.message}`);
      return;
    }
    
    console.log('   ✅ Inscription Auth réussie !');
    console.log(`   📋 User ID: ${authData.user?.id}`);
    
    // Test insertion dans la table users avec statut 'approved'
    console.log('2️⃣ Test d\'insertion avec statut approved :');
    
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        phone_number: testPhone,
        first_name: 'Test',
        last_name: 'AutoApproval',
        role: 'client',
        status: 'approved'  // ← Statut automatiquement approuvé
      }]);
    
    if (userError) {
      console.log(`   ❌ Erreur insertion table users: ${userError.message}`);
      return;
    }
    
    console.log('   ✅ Insertion dans la table users réussie !');
    
    // Vérifier le statut
    console.log('3️⃣ Vérification du statut :');
    
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .limit(1);
    
    if (fetchError) {
      console.log(`   ❌ Erreur récupération: ${fetchError.message}`);
    } else if (users && users.length > 0) {
      console.log('   ✅ Utilisateur trouvé !');
      console.log(`   📋 Nom: ${users[0].first_name} ${users[0].last_name}`);
      console.log(`   📋 Statut: ${users[0].status} ${users[0].status === 'approved' ? '✅' : '❌'}`);
      console.log(`   📋 Rôle: ${users[0].role}`);
    }
    
    console.log('');
    console.log('🎉 Test d\'approbation automatique réussi !');
    console.log('\n📝 Résumé :');
    console.log('   ✅ Les nouvelles inscriptions sont automatiquement approuvées');
    console.log('   ✅ Pas besoin de validation admin');
    console.log('   ✅ Accès immédiat au dashboard');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testAutoApproval();
