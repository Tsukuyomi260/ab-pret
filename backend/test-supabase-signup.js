// =====================================================
// TEST D'INSCRIPTION SUPABASE DIRECT
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🧪 Test d\'inscription Supabase direct...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante !');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseSignup() {
  try {
    console.log('🔗 Connexion à Supabase...');
    
    // Test 1: Vérifier la configuration
    console.log('1️⃣ Vérification de la configuration :');
    console.log(`   URL: ${supabaseUrl ? '✅ Configurée' : '❌ Manquante'}`);
    console.log(`   Clé: ${supabaseKey ? '✅ Configurée' : '❌ Manquante'}`);
    console.log('');
    
    // Test 2: Test de connexion
    console.log('2️⃣ Test de connexion :');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log(`   ❌ Erreur de connexion: ${testError.message}`);
      return;
    }
    console.log('   ✅ Connexion réussie');
    console.log('');
    
    // Test 3: Test d'inscription avec email temporaire
    console.log('3️⃣ Test d\'inscription avec email temporaire :');
    
    const testPhone = '+22953489846';
    const cleanPhone = testPhone.replace(/[^0-9]/g, '');
    const timestamp = Date.now();
    const tempEmail = `test_${cleanPhone}_${timestamp}@campusfinance.bj`;
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
    
    // Test 4: Insertion dans la table users
    console.log('4️⃣ Test d\'insertion dans la table users :');
    
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
    
    // Test 5: Vérifier que l'utilisateur existe
    console.log('5️⃣ Vérification de l\'utilisateur créé :');
    
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .limit(1);
    
    if (fetchError) {
      console.log(`   ❌ Erreur récupération: ${fetchError.message}`);
    } else if (users && users.length > 0) {
      console.log('   ✅ Utilisateur trouvé dans la base !');
      console.log(`   📋 Nom: ${users[0].first_name} ${users[0].last_name}`);
      console.log(`   📋 Statut: ${users[0].status}`);
      console.log(`   📋 Rôle: ${users[0].role}`);
    } else {
      console.log('   ❌ Utilisateur non trouvé dans la base');
    }
    console.log('');
    
    console.log('🎉 Test d\'inscription Supabase réussi !');
    console.log('\n📝 Prochaines étapes :');
    console.log('   1. Testez l\'inscription dans l\'application web');
    console.log('   2. Vérifiez les politiques RLS');
    console.log('   3. Testez la connexion avec le nouvel utilisateur');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testSupabaseSignup();
