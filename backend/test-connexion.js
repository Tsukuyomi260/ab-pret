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

async function testConnexion() {
  console.log('🧪 Test de connexion...\n');

  try {
    // 1. Lister les utilisateurs existants
    console.log('1️⃣ Récupération des utilisateurs existants...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, phone_number, email, created_at, status')
      .order('created_at', { ascending: false })
      .limit(5);

    if (usersError) {
      console.error('❌ Erreur récupération utilisateurs:', usersError.message);
      return;
    }

    console.log('📋 Utilisateurs trouvés:', users.length);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.first_name} ${user.last_name} (${user.phone_number}) - ${user.status}`);
    });

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }

    // 2. Tester la connexion avec le premier utilisateur
    const testUser = users[0];
    console.log(`\n2️⃣ Test de connexion avec: ${testUser.first_name} ${testUser.last_name}`);
    
    // Reconstruire l'email temporaire
    const cleanPhone = testUser.phone_number.replace(/[^0-9]/g, '');
    const timestamp = new Date(testUser.created_at).getTime();
    const tempEmail = `user.${cleanPhone}.${timestamp}@gmail.com`;
    
    console.log('📧 Email temporaire reconstruit:', tempEmail);
    
    // 3. Vérifier si l'utilisateur existe dans auth.users
    console.log('\n3️⃣ Vérification dans auth.users...');
    
    // Note: Cette requête nécessite des permissions admin
    // Pour le test, on va essayer de se connecter directement
    
    console.log('🔐 Tentative de connexion...');
    console.log('⚠️  Note: Utilisez le mot de passe que vous avez défini lors de l\'inscription');
    
    // 4. Afficher les informations de test
    console.log('\n📝 Informations de test:');
    console.log(`   Email: ${tempEmail}`);
    console.log(`   Téléphone: ${testUser.phone_number}`);
    console.log(`   Nom: ${testUser.first_name} ${testUser.last_name}`);
    console.log(`   Statut: ${testUser.status}`);
    
    console.log('\n🎯 Pour tester dans l\'application:');
    console.log('   1. Allez sur la page de connexion');
    console.log('   2. Entrez le numéro de téléphone:', testUser.phone_number);
    console.log('   3. Entrez le mot de passe utilisé lors de l\'inscription');
    
  } catch (error) {
    console.error('❌ Erreur test:', error.message);
  }
}

// Exécuter le test
testConnexion();
