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

async function diagnoseSavingsTables() {
  console.log('🔍 Diagnostic des tables d\'épargne...\n');

  try {
    // 1. Vérifier la table savings_plans
    console.log('1. Vérification de la table savings_plans...');
    const { data: plans, error: plansError } = await supabase
      .from('savings_plans')
      .select('*')
      .limit(5);
    
    if (plansError) {
      console.error('❌ Erreur table savings_plans:', plansError);
    } else {
      console.log('✅ Table savings_plans accessible');
      console.log(`   - Nombre d'enregistrements: ${plans?.length || 0}`);
      if (plans && plans.length > 0) {
        console.log('   - Exemple de plan:', {
          id: plans[0].id,
          user_id: plans[0].user_id,
          current_balance: plans[0].current_balance,
          total_deposited: plans[0].total_deposited,
          status: plans[0].status
        });
      }
    }

    // 2. Vérifier la table savings_transactions
    console.log('\n2. Vérification de la table savings_transactions...');
    const { data: transactions, error: transactionsError } = await supabase
      .from('savings_transactions')
      .select('*')
      .limit(5);
    
    if (transactionsError) {
      console.error('❌ Erreur table savings_transactions:', transactionsError);
    } else {
      console.log('✅ Table savings_transactions accessible');
      console.log(`   - Nombre d'enregistrements: ${transactions?.length || 0}`);
      if (transactions && transactions.length > 0) {
        console.log('   - Exemple de transaction:', {
          id: transactions[0].id,
          user_id: transactions[0].user_id,
          amount: transactions[0].amount,
          transaction_type: transactions[0].transaction_type,
          status: transactions[0].status
        });
      }
    }

    // 3. Vérifier la table savings_accounts
    console.log('\n3. Vérification de la table savings_accounts...');
    const { data: accounts, error: accountsError } = await supabase
      .from('savings_accounts')
      .select('*')
      .limit(5);
    
    if (accountsError) {
      console.error('❌ Erreur table savings_accounts:', accountsError);
    } else {
      console.log('✅ Table savings_accounts accessible');
      console.log(`   - Nombre d'enregistrements: ${accounts?.length || 0}`);
      if (accounts && accounts.length > 0) {
        console.log('   - Exemple de compte:', {
          id: accounts[0].id,
          user_id: accounts[0].user_id,
          balance: accounts[0].balance
        });
      }
    }

    // 4. Vérifier les plans récents avec des transactions
    console.log('\n4. Vérification des plans récents...');
    const { data: recentPlans, error: recentError } = await supabase
      .from('savings_plans')
      .select(`
        id,
        user_id,
        plan_name,
        current_balance,
        total_deposited,
        completed_deposits,
        status,
        updated_at
      `)
      .order('updated_at', { ascending: false })
      .limit(3);
    
    if (recentError) {
      console.error('❌ Erreur récupération plans récents:', recentError);
    } else {
      console.log('✅ Plans récents récupérés');
      recentPlans?.forEach((plan, index) => {
        console.log(`   Plan ${index + 1}:`, {
          id: plan.id,
          user_id: plan.user_id,
          plan_name: plan.plan_name,
          current_balance: plan.current_balance,
          total_deposited: plan.total_deposited,
          completed_deposits: plan.completed_deposits,
          status: plan.status,
          updated_at: plan.updated_at
        });
      });
    }

    // 5. Vérifier les transactions récentes
    console.log('\n5. Vérification des transactions récentes...');
    const { data: recentTransactions, error: recentTxError } = await supabase
      .from('savings_transactions')
      .select(`
        id,
        user_id,
        savings_plan_id,
        transaction_type,
        amount,
        status,
        transaction_reference,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentTxError) {
      console.error('❌ Erreur récupération transactions récentes:', recentTxError);
    } else {
      console.log('✅ Transactions récentes récupérées');
      recentTransactions?.forEach((tx, index) => {
        console.log(`   Transaction ${index + 1}:`, {
          id: tx.id,
          user_id: tx.user_id,
          savings_plan_id: tx.savings_plan_id,
          transaction_type: tx.transaction_type,
          amount: tx.amount,
          status: tx.status,
          transaction_reference: tx.transaction_reference,
          created_at: tx.created_at
        });
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le diagnostic
diagnoseSavingsTables().then(() => {
  console.log('\n🏁 Diagnostic terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
