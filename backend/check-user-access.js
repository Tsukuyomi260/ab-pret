// Script pour vérifier l'accès à un utilisateur dans la base de données
require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./utils/supabaseClient-server');

const USER_EMAIL = 'abpret51@gmail.com';

async function checkUserAccess() {
  console.log('\n=== 🔍 Vérification Accès Utilisateur ===\n');
  console.log(`📧 Email: ${USER_EMAIL}\n`);

  try {
    // 1. Chercher l'utilisateur dans la table users par email
    console.log('1️⃣ Recherche dans la table users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', USER_EMAIL)
      .single();

    if (userError) {
      console.error('❌ Erreur:', userError.message);
      console.error('   Code:', userError.code);
      console.error('   Détails:', userError.details);
      console.error('   Hint:', userError.hint);
    } else if (userData) {
      console.log('✅ Utilisateur trouvé dans users:');
      console.log('   ID:', userData.id);
      console.log('   Nom:', userData.first_name, userData.last_name);
      console.log('   Email:', userData.email);
      console.log('   Rôle:', userData.role);
      console.log('   Status:', userData.status);
      console.log('   Téléphone:', userData.phone_number);
      
      // 2. Essayer de récupérer par ID pour tester RLS
      console.log('\n2️⃣ Test récupération par ID (simulation client)...');
      const { data: userById, error: idError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userData.id)
        .single();
      
      if (idError) {
        console.error('❌ Erreur récupération par ID:', idError.message);
      } else {
        console.log('✅ Récupération par ID OK');
      }
    } else {
      console.log('⚠️  Utilisateur non trouvé dans la table users');
    }

    // 3. Lister tous les utilisateurs (pour voir si on peut accéder à la table)
    console.log('\n3️⃣ Test accès table users (5 premiers)...');
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('id, email, role, first_name, last_name')
      .limit(5);

    if (allError) {
      console.error('❌ Erreur accès table:', allError.message);
      console.error('   Code:', allError.code);
    } else {
      console.log(`✅ Accès table OK - ${allUsers.length} utilisateurs trouvés`);
      allUsers.forEach((u, i) => {
        console.log(`   ${i+1}. ${u.email} (${u.role})`);
      });
    }

    // 4. Vérifier les politiques RLS
    console.log('\n4️⃣ Vérification structure de la table...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erreur structure:', tableError.message);
    } else {
      console.log('✅ Structure accessible');
      if (tableInfo && tableInfo.length > 0) {
        const columns = Object.keys(tableInfo[0]);
        console.log(`   Colonnes: ${columns.slice(0, 10).join(', ')}...`);
      }
    }

  } catch (error) {
    console.error('\n❌ Erreur générale:', error.message);
    console.error('Stack:', error.stack);
  }
}

checkUserAccess().then(() => {
  console.log('\n=== ✅ Vérification terminée ===\n');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Erreur fatale:', error);
  process.exit(1);
});
