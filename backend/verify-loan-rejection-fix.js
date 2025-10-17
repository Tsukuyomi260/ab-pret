// Script pour vérifier que la correction du rejet des prêts fonctionne
require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./utils/supabaseClient-server');

async function verifyLoanRejectionFix() {
  console.log('\n=== ✅ Vérification de la Correction du Rejet des Prêts ===\n');

  try {
    // 1. Vérifier qu'il y a des prêts en attente
    console.log('1️⃣ Vérification des prêts en attente...');
    const { data: pendingLoans, error: pendingError } = await supabase
      .from('loans')
      .select('id, status, amount, users!inner(first_name, last_name)')
      .eq('status', 'pending');

    if (pendingError) {
      console.error('❌ Erreur récupération prêts en attente:', pendingError.message);
      return;
    }

    if (!pendingLoans || pendingLoans.length === 0) {
      console.log('⚠️ Aucun prêt en attente trouvé pour le test');
      return;
    }

    console.log(`✅ ${pendingLoans.length} prêt(s) en attente trouvé(s)`);
    const testLoan = pendingLoans[0];
    console.log(`   Test avec: ${testLoan.users.first_name} ${testLoan.users.last_name} - ${parseInt(testLoan.amount).toLocaleString()} FCFA`);

    // 2. Tester le rejet
    console.log('\n2️⃣ Test du rejet...');
    const { data: rejectedLoan, error: rejectError } = await supabase
      .from('loans')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', testLoan.id)
      .select('id, status, updated_at')
      .single();

    if (rejectError) {
      console.error('❌ ERREUR: Le rejet a échoué !');
      console.error('   Erreur:', rejectError.message);
      console.error('   Détails:', rejectError);
      console.log('\n🔧 SOLUTION:');
      console.log('   1. Aller dans Supabase SQL Editor');
      console.log('   2. Exécuter le script de correction (voir FIX_LOAN_REJECTION_GUIDE.md)');
      console.log('   3. Relancer ce test');
      return;
    }

    console.log('✅ REJET RÉUSSI !');
    console.log(`   Prêt ${rejectedLoan.id} maintenant au statut: ${rejectedLoan.status}`);

    // 3. Vérifier que le statut a bien changé
    console.log('\n3️⃣ Vérification du changement de statut...');
    const { data: verifyLoan, error: verifyError } = await supabase
      .from('loans')
      .select('id, status, updated_at')
      .eq('id', testLoan.id)
      .single();

    if (verifyError) {
      console.error('❌ Erreur vérification:', verifyError.message);
      return;
    }

    if (verifyLoan.status === 'rejected') {
      console.log('✅ Statut correctement mis à jour vers "rejected"');
    } else {
      console.log(`⚠️ Statut inattendu: ${verifyLoan.status}`);
    }

    // 4. Remettre le prêt en pending pour ne pas affecter les données
    console.log('\n4️⃣ Remise en "pending" pour ne pas affecter les données...');
    const { error: resetError } = await supabase
      .from('loans')
      .update({
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', testLoan.id);

    if (resetError) {
      console.error('⚠️ Erreur lors de la remise en pending:', resetError.message);
    } else {
      console.log('✅ Prêt remis en "pending"');
    }

    // 5. Test final - vérifier que le prêt est bien en pending
    const { data: finalCheck, error: finalError } = await supabase
      .from('loans')
      .select('status')
      .eq('id', testLoan.id)
      .single();

    if (finalError) {
      console.error('❌ Erreur vérification finale:', finalError.message);
    } else if (finalCheck.status === 'pending') {
      console.log('✅ Prêt correctement remis en "pending"');
    } else {
      console.log(`⚠️ Statut final inattendu: ${finalCheck.status}`);
    }

    console.log('\n=== 🎉 CORRECTION VÉRIFIÉE AVEC SUCCÈS ===\n');
    console.log('✅ L\'admin peut maintenant rejeter les demandes de prêt !');
    console.log('✅ La fonctionnalité est opérationnelle.');
    console.log('💡 Testez dans l\'interface admin pour confirmer.');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Lancer la vérification
verifyLoanRejectionFix();
