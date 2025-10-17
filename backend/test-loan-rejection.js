// Script pour tester le rejet des demandes de prêt
require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./utils/supabaseClient-server');

async function testLoanRejection() {
  console.log('\n=== 🔍 Test de Rejet des Demandes de Prêt ===\n');

  try {
    // 1. Récupérer une demande de prêt en attente
    console.log('1️⃣ Recherche d\'une demande de prêt en attente...');
    const { data: pendingLoans, error: loansError } = await supabase
      .from('loans')
      .select(`
        id,
        user_id,
        amount,
        status,
        created_at,
        users!inner(id, first_name, last_name, email)
      `)
      .eq('status', 'pending')
      .limit(1);

    if (loansError) {
      console.error('❌ Erreur récupération prêts:', loansError.message);
      return;
    }

    if (!pendingLoans || pendingLoans.length === 0) {
      console.log('❌ Aucune demande de prêt en attente trouvée');
      return;
    }

    const loan = pendingLoans[0];
    console.log(`✅ Demande trouvée: ${loan.id}`);
    console.log(`   Utilisateur: ${loan.users.first_name} ${loan.users.last_name}`);
    console.log(`   Montant: ${parseInt(loan.amount).toLocaleString()} FCFA`);
    console.log(`   Statut actuel: ${loan.status}`);

    // 2. Tester la mise à jour du statut vers 'rejected'
    console.log('\n2️⃣ Test de mise à jour vers "rejected"...');
    const { data: updatedLoan, error: updateError } = await supabase
      .from('loans')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', loan.id)
      .select(`
        id,
        status,
        updated_at
      `)
      .single();

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError.message);
      console.error('   Détails:', updateError);
      return;
    }

    console.log('✅ Mise à jour réussie !');
    console.log(`   Nouveau statut: ${updatedLoan.status}`);
    console.log(`   Mis à jour le: ${updatedLoan.updated_at}`);

    // 3. Vérifier que la mise à jour a bien fonctionné
    console.log('\n3️⃣ Vérification de la mise à jour...');
    const { data: verifyLoan, error: verifyError } = await supabase
      .from('loans')
      .select('id, status, updated_at')
      .eq('id', loan.id)
      .single();

    if (verifyError) {
      console.error('❌ Erreur vérification:', verifyError.message);
      return;
    }

    console.log('✅ Vérification réussie !');
    console.log(`   Statut final: ${verifyLoan.status}`);

    // 4. Remettre le prêt en "pending" pour ne pas affecter les tests
    console.log('\n4️⃣ Remise en "pending" pour les tests...');
    const { error: resetError } = await supabase
      .from('loans')
      .update({
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', loan.id);

    if (resetError) {
      console.error('⚠️ Erreur lors de la remise en pending:', resetError.message);
    } else {
      console.log('✅ Prêt remis en "pending"');
    }

    console.log('\n=== ✅ Test terminé avec succès ===\n');
    console.log('💡 Le problème ne semble pas venir de la base de données.');
    console.log('💡 Vérifiez les logs du navigateur pour voir les erreurs JavaScript.');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Lancer le test
testLoanRejection();
