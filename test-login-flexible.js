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

async function testLoginFlexible() {
  console.log('🧪 Test de connexion flexible...\n');

  try {
    // 1. Lister les utilisateurs
    console.log('1️⃣ Récupération des utilisateurs...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, phone_number, email, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (usersError) {
      console.error('❌ Erreur:', usersError.message);
      return;
    }

    console.log('📋 Utilisateurs trouvés:', users.length);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.first_name} ${user.last_name}`);
      console.log(`      📱 Téléphone: ${user.phone_number}`);
      
      // Formater l'affichage de l'email
      let emailDisplay = user.email || 'Non défini';
      if (emailDisplay.includes('user.') && emailDisplay.includes('@gmail.com')) {
        emailDisplay = 'Email temporaire (non défini)';
      }
      console.log(`      📧 Email: ${emailDisplay}`);
    });

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }

    // 2. Afficher les options de connexion
    const testUser = users[0];
    console.log(`\n📝 Options de connexion pour: ${testUser.first_name} ${testUser.last_name}`);
    
    console.log('\n🎯 Option 1 - Connexion par téléphone:');
    console.log(`   Téléphone: ${testUser.phone_number}`);
    
    console.log('\n🎯 Option 2 - Connexion par email:');
    if (testUser.email && !testUser.email.includes('@gmail.com')) {
      console.log(`   Email: ${testUser.email}`);
    } else {
      console.log(`   Email: (email temporaire généré automatiquement)`);
    }
    
    console.log('\n📋 Instructions de test:');
    console.log('   1. Allez sur http://localhost:3000');
    console.log('   2. Cliquez sur "Se connecter"');
    console.log('   3. Entrez soit:');
    console.log(`      - Le téléphone: ${testUser.phone_number}`);
    console.log(`      - Ou l'email (si défini)`);
    console.log('   4. Entrez le mot de passe utilisé lors de l\'inscription');
    console.log('   5. Cliquez sur "Se connecter"');
    
    console.log('\n✅ Les deux méthodes devraient fonctionner !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter le test
testLoginFlexible();
