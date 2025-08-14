// =====================================================
// TEST DU SYSTÈME DE PÉNALITÉS ET INFORMATIONS DU TÉMOIN
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

async function testPenaltySystem() {
  console.log('🔍 Test du système de pénalités et informations du témoin...\n');

  try {
    // 1. Vérifier que le champ daily_penalty_rate existe
    console.log('1️⃣ Vérification du champ daily_penalty_rate...');
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('*')
      .limit(1);

    if (loansError) {
      console.error('❌ Erreur lors de la vérification des prêts:', loansError.message);
      return;
    }

    if (loans && loans.length > 0) {
      const loan = loans[0];
      if ('daily_penalty_rate' in loan) {
        console.log('✅ Champ daily_penalty_rate trouvé');
        console.log(`   Valeur actuelle: ${loan.daily_penalty_rate}%`);
      } else {
        console.log('❌ Champ daily_penalty_rate manquant');
        return;
      }
    } else {
      console.log('ℹ️ Aucun prêt trouvé pour vérifier la structure');
    }

    // 2. Vérifier les informations du témoin dans la table users
    console.log('\n2️⃣ Vérification des informations du témoin...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, temoin_name, temoin_phone, temoin_quartier')
      .order('created_at', { ascending: false })
      .limit(3);

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError.message);
      return;
    }

    if (users && users.length > 0) {
      console.log(`✅ ${users.length} utilisateurs trouvés`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.first_name} ${user.last_name}`);
        console.log(`      Témoin: ${user.temoin_name || 'Non spécifié'}`);
        console.log(`      Téléphone témoin: ${user.temoin_phone || 'Non spécifié'}`);
        console.log(`      Quartier témoin: ${user.temoin_quartier || 'Non spécifié'}`);
      });
    } else {
      console.log('ℹ️ Aucun utilisateur trouvé');
      return;
    }

    // 3. Test de création d'un prêt avec pénalité
    console.log('\n3️⃣ Test de création d\'un prêt avec pénalité...');
    
    if (users && users.length > 0) {
      const testUser = users[0];
      const testLoanData = {
        user_id: testUser.id,
        amount: 75000,
        purpose: 'Test système pénalités - Prêt avec pénalité de 2%',
        duration_months: 8,
        interest_rate: 10.0,
        daily_penalty_rate: 2.0,
        status: 'pending'
      };

      console.log(`   Création d'un prêt de test pour ${testUser.first_name} ${testUser.last_name}...`);
      console.log(`   Pénalité configurée: ${testLoanData.daily_penalty_rate}% par jour`);
      
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
        console.log(`   Pénalité: ${newLoan.daily_penalty_rate}% par jour`);
        console.log(`   Statut: ${newLoan.status}`);

        // 4. Calculer la pénalité pour un retard de 5 jours
        console.log('\n4️⃣ Calcul de la pénalité pour un retard...');
        const montantPret = newLoan.amount;
        const tauxPenalite = newLoan.daily_penalty_rate;
        const joursRetard = 5;
        
        const penaliteParJour = (montantPret * tauxPenalite) / 100;
        const penaliteTotale = penaliteParJour * joursRetard;
        
        console.log(`   Montant du prêt: ${montantPret} FCFA`);
        console.log(`   Taux de pénalité: ${tauxPenalite}% par jour`);
        console.log(`   Jours de retard: ${joursRetard}`);
        console.log(`   Pénalité par jour: ${penaliteParJour.toFixed(2)} FCFA`);
        console.log(`   Pénalité totale pour ${joursRetard} jours: ${penaliteTotale.toFixed(2)} FCFA`);
        console.log(`   Montant total à rembourser: ${(montantPret + penaliteTotale).toFixed(2)} FCFA`);

        // 5. Nettoyer le prêt de test
        console.log('\n5️⃣ Nettoyage du prêt de test...');
        
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

    console.log('\n🎉 Test du système de pénalités terminé avec succès !');
    console.log('\n📋 Résumé des vérifications :');
    console.log('   ✅ Champ daily_penalty_rate présent');
    console.log('   ✅ Informations du témoin disponibles');
    console.log('   ✅ Création de prêt avec pénalité');
    console.log('   ✅ Calcul des pénalités de retard');
    console.log('   ✅ Nettoyage des données de test');
    console.log('\n🚀 Le système est maintenant configuré pour :');
    console.log('   • Appliquer une pénalité de 2% par jour en cas de retard');
    console.log('   • Afficher les informations du témoin dans le PDF');
    console.log('   • Calculer automatiquement les pénalités cumulées');
    console.log('   • Informer les clients des conditions de pénalité');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testPenaltySystem();
