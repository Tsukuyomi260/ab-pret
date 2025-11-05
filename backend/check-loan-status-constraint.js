// Script pour vérifier et corriger la contrainte de statut des prêts
require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./utils/supabaseClient-server');

async function checkAndFixLoanStatusConstraint() {
  console.log('\n=== 🔍 Vérification de la Contrainte de Statut des Prêts ===\n');

  try {
    // 1. Tester si on peut mettre un prêt en 'rejected'
    console.log('1️⃣ Test de rejet d\'un prêt...');
    const { data: pendingLoans, error: loanError } = await supabase
      .from('loans')
      .select('id, status')
      .eq('status', 'pending')
      .limit(1);

    if (loanError) {
      console.error('❌ Erreur récupération prêts:', loanError.message);
      return;
    }

    if (!pendingLoans || pendingLoans.length === 0) {
      console.log('⚠️ Aucun prêt en attente trouvé pour le test');
      console.log('💡 La contrainte ne peut pas être testée sans prêt en attente');
      return;
    }

    const testLoan = pendingLoans[0];
    console.log(`   Test avec prêt ID: ${testLoan.id}`);

    // 2. Tester la mise à jour vers 'rejected'
    const { data: updatedLoan, error: updateError } = await supabase
      .from('loans')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', testLoan.id)
      .select('id, status')
      .single();

    if (updateError) {
      console.error('❌ ERREUR: Le rejet a échoué !');
      console.error('   Message:', updateError.message);
      console.error('   Code:', updateError.code);
      console.error('   Détails:', updateError.details);
      console.error('   Hint:', updateError.hint);
      
      if (updateError.code === '23514' || updateError.message?.includes('check constraint')) {
        console.log('\n🔧 SOLUTION DÉTECTÉE:');
        console.log('   La contrainte de base de données n\'autorise pas le statut "rejected".');
        console.log('\n📋 INSTRUCTIONS:');
        console.log('   1. Allez dans Supabase Dashboard > SQL Editor');
        console.log('   2. Exécutez ce script SQL:');
        console.log('');
        console.log('   -- Supprimer l\'ancienne contrainte');
        console.log('   ALTER TABLE public.loans');
        console.log('   DROP CONSTRAINT IF EXISTS loans_status_check;');
        console.log('');
        console.log('   -- Créer la nouvelle contrainte avec "rejected"');
        console.log('   ALTER TABLE public.loans');
        console.log('   ADD CONSTRAINT loans_status_check');
        console.log('   CHECK (status IN (\'pending\', \'approved\', \'active\', \'completed\', \'rejected\'));');
        console.log('');
        console.log('   3. Relancez ce script pour vérifier que ça fonctionne');
        return;
      }
    } else {
      console.log('✅ SUCCÈS: Le rejet fonctionne !');
      console.log(`   Prêt ${updatedLoan.id} maintenant au statut: ${updatedLoan.status}`);
      
      // Remettre en pending
      await supabase
        .from('loans')
        .update({
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', testLoan.id);
      
      console.log('✅ Prêt remis en "pending" pour les tests futurs');
      console.log('\n🎉 La contrainte est correctement configurée !');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

checkAndFixLoanStatusConstraint();
