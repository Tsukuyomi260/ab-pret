const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLoginSimple() {
  console.log('🧪 Test de connexion simple...\n');

  try {
    // 1. Lister les utilisateurs
    console.log('1️⃣ Récupération des utilisateurs...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, phone_number, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (usersError) {
      console.error('❌ Erreur:', usersError.message);
      return;
    }

    console.log('📋 Utilisateurs trouvés:', users.length);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.first_name} ${user.last_name} (${user.phone_number})`);
    });

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }

    // 2. Afficher les informations de test
    const testUser = users[0];
    console.log(`\n📝 Informations de test pour: ${testUser.first_name} ${testUser.last_name}`);
    console.log(`   Téléphone: ${testUser.phone_number}`);
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Créé le: ${testUser.created_at}`);
    
    // 3. Reconstruire l'email temporaire
    const cleanPhone = testUser.phone_number.replace(/[^0-9]/g, '');
    const timestamp = new Date(testUser.created_at).getTime();
    const tempEmail = `user.${cleanPhone}.${timestamp}@gmail.com`;
    
    console.log(`\n📧 Email temporaire: ${tempEmail}`);
    
    console.log('\n🎯 Instructions de test:');
    console.log('   1. Allez sur http://localhost:3000');
    console.log('   2. Cliquez sur "Se connecter"');
    console.log('   3. Entrez le téléphone:', testUser.phone_number);
    console.log('   4. Entrez le mot de passe utilisé lors de l\'inscription');
    console.log('   5. Cliquez sur "Se connecter"');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter le test
testLoginSimple();
