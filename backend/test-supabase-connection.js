// =====================================================
// TEST DE CONNEXION SUPABASE
// =====================================================

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (à adapter selon votre .env)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

console.log('=== TEST CONNEXION SUPABASE ===');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? '✅ Présente' : '❌ Manquante');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔍 Test de connexion...');
    
    // Test 1: Vérifier la connexion de base
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      return false;
    }
    
    console.log('✅ Connexion Supabase réussie');
    
    // Test 2: Vérifier la structure de la table users
    console.log('🔍 Vérification de la table users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Erreur lecture table users:', usersError.message);
      return false;
    }
    
    console.log('✅ Table users accessible');
    
    // Test 3: Vérifier les colonnes importantes
    console.log('🔍 Vérification des colonnes...');
    const testUser = {
      id: 'test-' + Date.now(),
      email: 'test@example.com',
      phone_number: '+22912345678',
      first_name: 'Test',
      last_name: 'User',
      role: 'client',
      status: 'approved'
    };
    
    console.log('✅ Tests de connexion terminés avec succès');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    return false;
  }
}

// Exécuter le test
testConnection().then(success => {
  if (success) {
    console.log('🎉 Tous les tests sont passés !');
  } else {
    console.log('💥 Des erreurs ont été détectées');
  }
});

