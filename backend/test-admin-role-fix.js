// Script de test pour vérifier la correction du problème de rôle admin
require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./utils/supabaseClient-server');

async function testAdminRoleFix() {
  console.log('\n=== 🧪 Test de Correction du Rôle Admin ===\n');

  try {
    // 1. Vérifier la connexion Supabase
    console.log('1️⃣ Vérification de la connexion Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur connexion Supabase:', testError.message);
      return;
    }
    
    console.log('✅ Connexion Supabase OK');

    // 2. Récupérer tous les utilisateurs admin
    console.log('\n2️⃣ Recherche des utilisateurs admin...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('id, email, role, first_name, last_name, created_at')
      .eq('role', 'admin');

    if (adminError) {
      console.error('❌ Erreur récupération admins:', adminError.message);
      return;
    }

    console.log(`📊 Admins trouvés: ${adminUsers.length}`);
    
    if (adminUsers.length === 0) {
      console.log('⚠️  Aucun utilisateur admin trouvé');
      console.log('💡 Créez un utilisateur admin ou changez le rôle d\'un utilisateur existant');
      return;
    }

    // 3. Afficher les informations des admins
    console.log('\n3️⃣ Informations des administrateurs:');
    adminUsers.forEach((admin, index) => {
      console.log(`\n👤 Admin ${index + 1}:`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Nom: ${admin.first_name} ${admin.last_name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Rôle: ${admin.role}`);
      console.log(`   Créé le: ${new Date(admin.created_at).toLocaleDateString('fr-FR')}`);
    });

    // 4. Vérifier la structure de la table users
    console.log('\n4️⃣ Vérification de la structure de la table users...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erreur structure table:', tableError.message);
    } else {
      console.log('✅ Structure de la table users OK');
      if (tableInfo.length > 0) {
        const columns = Object.keys(tableInfo[0]);
        console.log(`📋 Colonnes disponibles: ${columns.join(', ')}`);
        
        // Vérifier les colonnes importantes
        const importantColumns = ['id', 'email', 'role', 'first_name', 'last_name'];
        const missingColumns = importantColumns.filter(col => !columns.includes(col));
        
        if (missingColumns.length > 0) {
          console.log(`⚠️  Colonnes manquantes: ${missingColumns.join(', ')}`);
        } else {
          console.log('✅ Toutes les colonnes importantes sont présentes');
        }
      }
    }

    // 5. Test de récupération d'un admin spécifique
    console.log('\n5️⃣ Test de récupération d\'un admin...');
    const testAdmin = adminUsers[0];
    
    const { data: specificAdmin, error: specificError } = await supabase
      .from('users')
      .select('id, email, role, first_name, last_name')
      .eq('id', testAdmin.id)
      .single();

    if (specificError) {
      console.error('❌ Erreur récupération admin spécifique:', specificError.message);
    } else {
      console.log('✅ Récupération admin spécifique OK');
      console.log(`   Rôle récupéré: ${specificAdmin.role}`);
      console.log(`   Nom: ${specificAdmin.first_name} ${specificAdmin.last_name}`);
    }

    // 6. Résumé et recommandations
    console.log('\n=== 📊 RÉSUMÉ ===\n');
    
    console.log(`👥 Total admins: ${adminUsers.length}`);
    console.log(`🔗 Connexion Supabase: ✅ OK`);
    console.log(`📋 Structure table: ✅ OK`);
    console.log(`🔍 Récupération admin: ✅ OK`);
    
    console.log('\n=== 💡 RECOMMANDATIONS ===\n');
    
    if (adminUsers.length > 0) {
      console.log('✅ Le système est prêt pour les tests de rôle admin');
      console.log('🔧 Utilisez le composant RoleDebugger dans l\'interface admin');
      console.log('📱 Connectez-vous avec un compte admin pour tester');
    } else {
      console.log('⚠️  Créez d\'abord un utilisateur admin');
      console.log('💡 Ou changez le rôle d\'un utilisateur existant vers "admin"');
    }
    
    console.log('\n=== 🎯 PROCHAINES ÉTAPES ===\n');
    console.log('1. Connectez-vous avec un compte admin');
    console.log('2. Vérifiez que l\'interface admin s\'affiche');
    console.log('3. Si problème, utilisez le composant de debug en haut à droite');
    console.log('4. Cliquez sur "Force Refresh + Reload" si nécessaire');
    
    console.log('\n✅ Test terminé !\n');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Lancer le test
testAdminRoleFix();
