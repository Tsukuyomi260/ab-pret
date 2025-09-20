// =====================================================
// TEST SUPABASE AVEC EMAIL VALIDE
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🧪 Test Supabase avec email valide...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante !');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseEmail() {
  try {
    console.log('🔗 Connexion à Supabase...');
    
    // Test 1: Test d'inscription avec email valide
    console.log('1️⃣ Test d\'inscription avec email valide :');
    
    const timestamp = Date.now();
    const validEmail = `test.user.${timestamp}@gmail.com`;
    const testPassword = 'TestPassword123!';
    const testPhone = '+22953489846';
    
    console.log(`   📧 Email: ${validEmail}`);
    console.log(`   📱 Téléphone: ${testPhone}`);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          phone_number: testPhone,
          role: 'client'
        }
      }
    });
    
    if (authError) {
      console.log(`   ❌ Erreur d'inscription: ${authError.message}`);
      console.log(`   📋 Code d'erreur: ${authError.status}`);
      
      // Vérifier si c'est un problème de confirmation d'email
      if (authError.message.includes('confirm')) {
        console.log('   💡 L\'email doit être confirmé. Vérifiez votre boîte mail.');
      }
      return;
    }
    
    console.log('   ✅ Inscription réussie !');
    console.log(`   📋 User ID: ${authData.user?.id}`);
    console.log(`   📋 Email: ${authData.user?.email}`);
    console.log(`   📋 Confirmation requise: ${authData.user?.email_confirmed_at ? 'Non' : 'Oui'}`);
    console.log('');
    
    // Test 2: Insertion dans la table users
    console.log('2️⃣ Test d\'insertion dans la table users :');
    
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        phone_number: testPhone,
        first_name: 'Test',
        last_name: 'User',
        role: 'client',
        status: 'pending'
      }]);
    
    if (userError) {
      console.log(`   ❌ Erreur insertion table users: ${userError.message}`);
      console.log(`   📋 Code d'erreur: ${userError.code}`);
      return;
    }
    
    console.log('   ✅ Insertion dans la table users réussie !');
    console.log('');
    
    console.log('🎉 Test réussi !');
    console.log('\n📝 Prochaines étapes :');
    console.log('   1. Vérifiez votre email pour la confirmation');
    console.log('   2. Configurez Supabase pour désactiver la confirmation email');
    console.log('   3. Ou utilisez un email temporaire valide');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testSupabaseEmail();
