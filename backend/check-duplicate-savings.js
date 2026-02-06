/**
 * Script pour vérifier les doublons dans les plans d'épargne et transactions d'épargne
 * 
 * Usage: node check-duplicate-savings.js
 */

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

async function checkDuplicateSavings() {
  console.log('🔍 Vérification des doublons dans les plans d\'épargne et transactions...\n');

  try {
    // ===== VÉRIFICATION DES PLANS D'ÉPARGNE =====
    console.log('📋 Vérification des plans d\'épargne...\n');
    
    const { data: allPlans, error: plansError } = await supabase
      .from('savings_plans')
      .select('id, user_id, transaction_reference, created_at, status')
      .order('created_at', { ascending: true });

    if (plansError) {
      throw plansError;
    }

    console.log(`📊 Total de plans trouvés: ${allPlans.length}`);

    // Grouper par transaction_reference
    const plansByReference = {};
    allPlans.forEach(plan => {
      if (plan.transaction_reference) {
        if (!plansByReference[plan.transaction_reference]) {
          plansByReference[plan.transaction_reference] = [];
        }
        plansByReference[plan.transaction_reference].push(plan);
      }
    });

    // Identifier les doublons
    const duplicatePlans = [];
    Object.entries(plansByReference).forEach(([reference, plans]) => {
      if (plans.length > 1) {
        duplicatePlans.push({
          reference,
          plans
        });
      }
    });

    if (duplicatePlans.length === 0) {
      console.log('✅ Aucun doublon trouvé dans les plans d\'épargne\n');
    } else {
      console.log(`⚠️  ${duplicatePlans.length} groupe(s) de plans en double trouvé(s)\n`);
      
      duplicatePlans.forEach((group, index) => {
        console.log(`📦 Groupe ${index + 1}: transaction_reference = ${group.reference}`);
        console.log(`   ${group.plans.length} plan(s) trouvé(s)`);
        
        group.plans.forEach((plan, idx) => {
          const date = new Date(plan.created_at).toLocaleString('fr-FR');
          console.log(`   ${idx === 0 ? '✅ À garder' : '❌ Doublon'}: ID ${plan.id} - User ${plan.user_id} - Créé le ${date} - Statut: ${plan.status}`);
        });
        console.log('');
      });
    }

    // ===== VÉRIFICATION DES TRANSACTIONS D'ÉPARGNE =====
    console.log('\n📋 Vérification des transactions d\'épargne...\n');
    
    const { data: allTransactions, error: transactionsError } = await supabase
      .from('savings_transactions')
      .select('id, user_id, savings_plan_id, transaction_reference, created_at, amount, status')
      .order('created_at', { ascending: true });

    if (transactionsError) {
      throw transactionsError;
    }

    console.log(`📊 Total de transactions trouvées: ${allTransactions.length}`);

    // Grouper par transaction_reference
    const transactionsByReference = {};
    allTransactions.forEach(transaction => {
      if (transaction.transaction_reference) {
        if (!transactionsByReference[transaction.transaction_reference]) {
          transactionsByReference[transaction.transaction_reference] = [];
        }
        transactionsByReference[transaction.transaction_reference].push(transaction);
      }
    });

    // Identifier les doublons
    const duplicateTransactions = [];
    Object.entries(transactionsByReference).forEach(([reference, transactions]) => {
      if (transactions.length > 1) {
        duplicateTransactions.push({
          reference,
          transactions
        });
      }
    });

    if (duplicateTransactions.length === 0) {
      console.log('✅ Aucun doublon trouvé dans les transactions d\'épargne\n');
    } else {
      console.log(`⚠️  ${duplicateTransactions.length} groupe(s) de transactions en double trouvé(s)\n`);
      
      duplicateTransactions.forEach((group, index) => {
        console.log(`📦 Groupe ${index + 1}: transaction_reference = ${group.reference}`);
        console.log(`   ${group.transactions.length} transaction(s) trouvée(s)`);
        
        group.transactions.forEach((transaction, idx) => {
          const date = new Date(transaction.created_at).toLocaleString('fr-FR');
          const amount = parseInt(transaction.amount || 0).toLocaleString('fr-FR');
          console.log(`   ${idx === 0 ? '✅ À garder' : '❌ Doublon'}: ID ${transaction.id} - Plan ${transaction.savings_plan_id} - ${amount} FCFA - Créé le ${date} - Statut: ${transaction.status}`);
        });
        console.log('');
      });
    }

    // ===== RÉSUMÉ FINAL =====
    console.log('\n📊 RÉSUMÉ FINAL:');
    console.log(`   - Plans d'épargne: ${allPlans.length} total, ${duplicatePlans.length} groupe(s) de doublons`);
    console.log(`   - Transactions d'épargne: ${allTransactions.length} total, ${duplicateTransactions.length} groupe(s) de doublons`);
    
    const totalDuplicatePlans = duplicatePlans.reduce((sum, group) => sum + group.plans.length - 1, 0);
    const totalDuplicateTransactions = duplicateTransactions.reduce((sum, group) => sum + group.transactions.length - 1, 0);
    
    if (totalDuplicatePlans > 0 || totalDuplicateTransactions > 0) {
      console.log(`\n⚠️  Doublons à nettoyer:`);
      console.log(`   - ${totalDuplicatePlans} plan(s) d'épargne en double`);
      console.log(`   - ${totalDuplicateTransactions} transaction(s) d'épargne en double`);
      console.log(`\n💡 Pour nettoyer, créez un script de nettoyage similaire à cleanup-duplicate-payments.js`);
    } else {
      console.log('\n✅ Aucun doublon détecté !');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
checkDuplicateSavings()
  .then(() => {
    console.log('\n✨ Vérification terminée');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
