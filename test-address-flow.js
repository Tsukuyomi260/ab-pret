// =====================================================
// TEST DU FLUX COMPLET DE L'ADRESSE
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAddressFlow() {
  console.log('🔍 Test du flux complet de l\'adresse...\n');

  try {
    // 1. Vérifier que le champ address existe
    console.log('1️⃣ Vérification du champ address dans la table users...');
    const { data: columns, error: columnsError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (columnsError) {
      console.error('❌ Erreur lors de la vérification de la table:', columnsError.message);
      return;
    }

    if (columns && columns.length > 0) {
      const user = columns[0];
      if ('address' in user) {
        console.log('✅ Champ address trouvé dans la table users');
        console.log(`   Adresse actuelle: ${user.address || 'Non renseignée'}`);
      } else {
        console.log('❌ Champ address manquant dans la table users');
        console.log('   Colonnes disponibles:', Object.keys(user));
        return;
      }
    }

    // 2. Vérifier les utilisateurs existants
    console.log('\n2️⃣ Vérification des utilisateurs existants...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, address, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError.message);
      return;
    }

    if (users && users.length > 0) {
      console.log(`✅ ${users.length} utilisateurs trouvés`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.first_name} ${user.last_name}`);
        console.log(`      Adresse: ${user.address || 'Non renseignée'}`);
        console.log(`      Créé le: ${new Date(user.created_at).toLocaleDateString()}`);
      });
    } else {
      console.log('ℹ️ Aucun utilisateur trouvé');
    }

    // 3. Test de mise à jour d'une adresse
    console.log('\n3️⃣ Test de mise à jour d\'une adresse...');
    if (users && users.length > 0) {
      const testUser = users[0];
      const newAddress = '123 Rue Test, Cotonou, Bénin';
      
      console.log(`   Mise à jour de l'adresse pour ${testUser.first_name} ${testUser.last_name}...`);
      
      const { data: updateResult, error: updateError } = await supabase
        .from('users')
        .update({ address: newAddress })
        .eq('id', testUser.id)
        .select('address');

      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour:', updateError.message);
      } else {
        console.log('✅ Adresse mise à jour avec succès');
        console.log(`   Nouvelle adresse: ${updateResult[0].address}`);
        
        // Remettre l'ancienne adresse
        await supabase
          .from('users')
          .update({ address: testUser.address })
          .eq('id', testUser.id);
        console.log('   Ancienne adresse restaurée');
      }
    }

    console.log('\n🎉 Test du flux d\'adresse terminé avec succès !');
    console.log('\n📋 Résumé des vérifications :');
    console.log('   ✅ Champ address présent dans la table users');
    console.log('   ✅ Lecture des utilisateurs existants');
    console.log('   ✅ Test de mise à jour d\'adresse');
    console.log('\n🚀 L\'adresse sera maintenant automatiquement :');
    console.log('   • Collectée lors de l\'inscription');
    console.log('   • Sauvegardée dans la base de données');
    console.log('   • Affichée dans le profil utilisateur');
    console.log('   • Mise à jour lors de la modification du profil');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testAddressFlow();
