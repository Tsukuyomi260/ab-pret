// Script de test pour vérifier le flux de configuration du plan d'épargne
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante dans .env.local');
  console.error('Veuillez configurer REACT_APP_SUPABASE_URL et REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour tester la vérification du statut du plan
async function testPlanStatusCheck() {
  console.log('\n🔍 Test de vérification du statut du plan d\'épargne...');
  
  try {
    // Récupérer un utilisateur de test
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .limit(1);

    if (usersError) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${usersError.message}`);
    }

    if (!users || users.length === 0) {
      console.log('⚠️  Aucun utilisateur trouvé pour le test');
      return;
    }

    const testUser = users[0];
    console.log(`👤 Utilisateur de test: ${testUser.first_name} ${testUser.last_name} (${testUser.email})`);

    // Vérifier le statut du plan
    const { data: savingsAccount, error: accountError } = await supabase
      .from('savings_accounts')
      .select('*')
      .eq('user_id', testUser.id)
      .single();

    if (accountError && accountError.code === 'PGRST116') {
      console.log('✅ Pas de compte épargne existant (nouvel utilisateur)');
    } else if (accountError) {
      throw new Error(`Erreur lors de la vérification du compte épargne: ${accountError.message}`);
    } else {
      console.log('✅ Compte épargne existant trouvé');
    }

    // Vérifier les transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('savings_transactions')
      .select('id, type, created_at')
      .eq('user_id', testUser.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (transactionsError) {
      throw new Error(`Erreur lors de la vérification des transactions: ${transactionsError.message}`);
    }

    const hasTransactions = transactions && transactions.length > 0;
    const hasConfiguredPlan = hasTransactions || (savingsAccount && savingsAccount.balance > 0);
    const isFirstVisit = !hasConfiguredPlan;

    console.log(`📊 Statut du plan:`);
    console.log(`   - A un compte épargne: ${!!savingsAccount}`);
    console.log(`   - A des transactions: ${hasTransactions}`);
    console.log(`   - Plan configuré: ${hasConfiguredPlan}`);
    console.log(`   - Première visite: ${isFirstVisit}`);

    if (isFirstVisit) {
      console.log('🎉 Cet utilisateur devrait voir le modal de configuration automatiquement !');
    } else {
      console.log('✅ Cet utilisateur a déjà un plan configuré');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Fonction pour tester la création d'un plan
async function testPlanCreation() {
  console.log('\n🔧 Test de création d\'un plan d\'épargne...');
  
  try {
    // Récupérer un utilisateur de test
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.log('⚠️  Aucun utilisateur trouvé pour le test');
      return;
    }

    const testUser = users[0];
    
    // Données de test pour un plan
    const testPlanData = {
      user_id: testUser.id,
      fixed_amount: 500,
      frequency: 5,
      duration: 2,
      total_deposits: 12,
      total_amount: 6000,
      estimated_benefits: 600,
      status: 'active',
      start_date: new Date().toISOString()
    };

    // Vérifier si la table savings_plans existe
    const { data: tableCheck, error: tableError } = await supabase
      .from('savings_plans')
      .select('count')
      .limit(1);

    if (tableError) {
      console.log('⚠️  Table savings_plans non trouvée. Veuillez exécuter le script create-savings-plans-table.sql');
      return;
    }

    console.log('✅ Table savings_plans trouvée');

    // Créer un plan de test
    const { data: newPlan, error: createError } = await supabase
      .from('savings_plans')
      .insert([testPlanData])
      .select()
      .single();

    if (createError) {
      throw new Error(`Erreur lors de la création du plan: ${createError.message}`);
    }

    console.log('✅ Plan d\'épargne créé avec succès !');
    console.log(`📋 Détails du plan:`);
    console.log(`   - ID: ${newPlan.id}`);
    console.log(`   - Montant fixe: ${newPlan.fixed_amount} FCFA`);
    console.log(`   - Fréquence: ${newPlan.frequency} jours`);
    console.log(`   - Durée: ${newPlan.duration} mois`);
    console.log(`   - Total prévu: ${newPlan.total_amount} FCFA`);
    console.log(`   - Bénéfices estimés: ${newPlan.estimated_benefits} FCFA`);

    // Vérifier que le plan peut être récupéré
    const { data: retrievedPlan, error: retrieveError } = await supabase
      .from('savings_plans')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (retrieveError) {
      throw new Error(`Erreur lors de la récupération du plan: ${retrieveError.message}`);
    }

    console.log('✅ Plan récupéré avec succès');
    console.log(`   - Statut: ${retrievedPlan.status}`);
    console.log(`   - Créé le: ${retrievedPlan.created_at}`);

  } catch (error) {
    console.error('❌ Erreur lors du test de création:', error.message);
  }
}

// Fonction principale
async function runTests() {
  console.log('🚀 Test du flux de configuration du plan d\'épargne');
  console.log('=' .repeat(60));

  await testPlanStatusCheck();
  await testPlanCreation();

  console.log('\n✅ Tests terminés !');
  console.log('\n📝 Instructions pour tester l\'interface:');
  console.log('1. Exécutez le script create-savings-plans-table.sql dans Supabase');
  console.log('2. Connectez-vous avec un nouvel utilisateur');
  console.log('3. Allez sur la section AB Épargne');
  console.log('4. Le modal de configuration devrait s\'afficher automatiquement');
}

// Exécuter les tests
runTests().catch(console.error);
