// =====================================================
// TEST NOUVEAU FORMAT D'EMAIL
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🧪 Test nouveau format d\'email...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante !');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewSignup() {
  try {
    console.log('🔗 Connexion à Supabase...');
    
    // Test avec le nouveau format d'email
    console.log('1️⃣ Test d\'inscription avec nouveau format :');
    
    const testPhone = '+22953489846';
    const cleanPhone = testPhone.replace(/[^0-9]/g, '');
    const timestamp = Date.now();
    const tempEmail = `user.${cleanPhone}.${timestamp}@gmail.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`   📧 Email temporaire: ${tempEmail}`);
    console.log(`   📱 Téléphone: ${testPhone}`);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: tempEmail,
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
      return;
    }
    
    console.log('   ✅ Inscription réussie !');
    console.log(`   📋 User ID: ${authData.user?.id}`);
    console.log(`   📋 Email: ${authData.user?.email}`);
    console.log('');
    
    // Test insertion dans la table users
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
      return;
    }
    
    console.log('   ✅ Insertion dans la table users réussie !');
    console.log('');
    
    console.log('🎉 Test réussi avec le nouveau format !');
    console.log('\n📝 Maintenant vous pouvez :');
    console.log('   1. Tester l\'inscription dans l\'application web');
    console.log('   2. L\'utilisateur sera créé même si le SMS échoue');
    console.log('   3. L\'email temporaire sera valide');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testNewSignup();
