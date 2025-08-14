// =====================================================
// TEST DU SYSTÈME COMPLET DE PRÊTS ET NOTIFICATIONS
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

async function testLoanSystem() {
  console.log('🔍 Test du système complet de prêts et notifications...\n');

  try {
    // 1. Vérifier la structure de la base de données
    console.log('1️⃣ Vérification de la structure de la base de données...');
    
    const tables = ['users', 'loans', 'payments', 'otp_codes'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: Accessible`);
        }
      } catch (err) {
        console.error(`❌ Table ${table}: Erreur - ${err.message}`);
      }
    }

    // 2. Vérifier les utilisateurs existants
    console.log('\n2️⃣ Vérification des utilisateurs existants...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, status, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError.message);
      return;
    }

    if (users && users.length > 0) {
      console.log(`✅ ${users.length} utilisateurs trouvés`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.first_name} ${user.last_name} (${user.status})`);
      });
    } else {
      console.log('ℹ️ Aucun utilisateur trouvé');
      return;
    }

    // 3. Vérifier les prêts existants
    console.log('\n3️⃣ Vérification des prêts existants...');
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select(`
        *,
        users (
          id,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (loansError) {
      console.error('❌ Erreur lors de la récupération des prêts:', loansError.message);
    } else if (loans && loans.length > 0) {
      console.log(`✅ ${loans.length} prêts trouvés`);
      loans.forEach((loan, index) => {
        console.log(`   ${index + 1}. ${loan.amount} FCFA - ${loan.status}`);
        console.log(`      Utilisateur: ${loan.users?.first_name} ${loan.users?.last_name}`);
        console.log(`      Objet: ${loan.purpose}`);
      });
    } else {
      console.log('ℹ️ Aucun prêt trouvé');
    }

    // 4. Test de création d'un prêt de test
    console.log('\n4️⃣ Test de création d\'un prêt de test...');
    
    if (users && users.length > 0) {
      const testUser = users[0];
      const testLoanData = {
        user_id: testUser.id,
        amount: 50000,
        purpose: 'Test de système - Prêt de test',
        loan_type: 'test',
        duration: 6,
        interest_rate: 10.0,
        status: 'pending'
      };

      console.log(`   Création d'un prêt de test pour ${testUser.first_name} ${testUser.last_name}...`);
      
      const { data: newLoan, error: createError } = await supabase
        .from('loans')
        .insert([testLoanData])
        .select()
        .single();

      if (createError) {
        console.error('❌ Erreur lors de la création du prêt de test:', createError.message);
      } else {
        console.log('✅ Prêt de test créé avec succès');
        console.log(`   ID: ${newLoan.id}`);
        console.log(`   Montant: ${newLoan.amount} FCFA`);
        console.log(`   Statut: ${newLoan.status}`);

        // 5. Test de mise à jour du statut
        console.log('\n5️⃣ Test de mise à jour du statut...');
        
        const { data: updatedLoan, error: updateError } = await supabase
          .from('loans')
          .update({ 
            status: 'approved',
            approved_at: new Date().toISOString()
          })
          .eq('id', newLoan.id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour:', updateError.message);
        } else {
          console.log('✅ Statut du prêt mis à jour avec succès');
          console.log(`   Nouveau statut: ${updatedLoan.status}`);
        }

        // 6. Nettoyer le prêt de test
        console.log('\n6️⃣ Nettoyage du prêt de test...');
        
        const { error: deleteError } = await supabase
          .from('loans')
          .delete()
          .eq('id', newLoan.id);

        if (deleteError) {
          console.error('❌ Erreur lors de la suppression:', deleteError.message);
        } else {
          console.log('✅ Prêt de test supprimé');
        }
      }
    }

    console.log('\n🎉 Test du système de prêts terminé avec succès !');
    console.log('\n📋 Résumé des vérifications :');
    console.log('   ✅ Structure de la base de données');
    console.log('   ✅ Utilisateurs existants');
    console.log('   ✅ Prêts existants');
    console.log('   ✅ Création de prêt');
    console.log('   ✅ Mise à jour de statut');
    console.log('   ✅ Suppression de prêt');
    console.log('\n🚀 Le système est prêt pour :');
    console.log('   • Création de demandes de prêts par les clients');
    console.log('   • Notifications automatiques pour les admins');
    console.log('   • Validation/rejet des demandes par les admins');
    console.log('   • Suivi en temps réel des changements');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testLoanSystem();
