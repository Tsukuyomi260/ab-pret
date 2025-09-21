const { createClient } = require('@supabase/supabase-js');

// Load env from .env.local first, then .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTransactionUpdate() {
  console.log('🧪 Test de mise à jour de transaction...\n');

  try {
    // 1. Récupérer le plan le plus récent
    console.log('1. Récupération du plan le plus récent...');
    const { data: recentPlan, error: planError } = await supabase
      .from('savings_plans')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (planError || !recentPlan) {
      console.error('❌ Aucun plan trouvé:', planError);
      return;
    }

    console.log('✅ Plan trouvé:', {
      id: recentPlan.id,
      user_id: recentPlan.user_id,
      current_balance: recentPlan.current_balance,
      total_deposited: recentPlan.total_deposited,
      transaction_reference: recentPlan.transaction_reference
    });

    // 2. Simuler une mise à jour avec la transaction de référence
    const transactionReference = '363122'; // L'ID de transaction du client
    const depositAmount = 1000; // Montant du dépôt

    console.log(`\n2. Simulation de mise à jour avec transaction ${transactionReference}...`);
    
    const newTotalDeposited = (recentPlan.total_deposited || 0) + depositAmount;
    const newCompletedDeposits = (recentPlan.completed_deposits || 0) + 1;
    const newCurrentBalance = (recentPlan.current_balance || 0) + depositAmount;

    const { data: updatedPlan, error: updateError } = await supabase
      .from('savings_plans')
      .update({
        total_deposited: newTotalDeposited,
        completed_deposits: newCompletedDeposits,
        current_balance: newCurrentBalance,
        transaction_reference: transactionReference,
        updated_at: new Date().toISOString()
      })
      .eq('id', recentPlan.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur mise à jour plan:', updateError);
      return;
    }

    console.log('✅ Plan mis à jour:', {
      id: updatedPlan.id,
      current_balance: updatedPlan.current_balance,
      total_deposited: updatedPlan.total_deposited,
      completed_deposits: updatedPlan.completed_deposits,
      transaction_reference: updatedPlan.transaction_reference
    });

    // 3. Tester la récupération par transaction_reference
    console.log(`\n3. Test de récupération par transaction_reference ${transactionReference}...`);
    const { data: foundPlan, error: findError } = await supabase
      .from('savings_plans')
      .select('*')
      .eq('transaction_reference', transactionReference)
      .single();

    if (findError) {
      console.error('❌ Plan non trouvé par transaction_reference:', findError);
    } else {
      console.log('✅ Plan trouvé par transaction_reference:', {
        id: foundPlan.id,
        current_balance: foundPlan.current_balance,
        total_deposited: foundPlan.total_deposited,
        transaction_reference: foundPlan.transaction_reference
      });
    }

    // 4. Créer une entrée dans savings_transactions
    console.log('\n4. Création d\'une entrée dans savings_transactions...');
    const { data: newTransaction, error: transactionError } = await supabase
      .from('savings_transactions')
      .insert({
        user_id: recentPlan.user_id,
        savings_plan_id: recentPlan.id,
        transaction_type: 'deposit',
        amount: depositAmount,
        transaction_reference: transactionReference,
        status: 'completed',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (transactionError) {
      console.error('❌ Erreur création transaction:', transactionError);
    } else {
      console.log('✅ Transaction créée:', {
        id: newTransaction.id,
        user_id: newTransaction.user_id,
        savings_plan_id: newTransaction.savings_plan_id,
        amount: newTransaction.amount,
        status: newTransaction.status
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testTransactionUpdate().then(() => {
  console.log('\n🏁 Test terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
