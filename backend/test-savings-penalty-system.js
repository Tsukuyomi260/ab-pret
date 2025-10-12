const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSavingsPenaltySystem() {
  try {
    console.log('🧪 Test du système de pénalités pour les dépôts d\'épargne');
    console.log('=' .repeat(60));
    
    // 1. Vérifier les colonnes de pénalité
    console.log('1. 🔍 Vérification des colonnes de pénalité...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'savings_plans')
      .in('column_name', ['is_overdue', 'overdue_since', 'days_overdue', 'is_suspended', 'suspended_since', 'lost_interest_amount']);
    
    if (columnsError) {
      console.error('❌ Erreur lors de la vérification des colonnes:', columnsError);
      return;
    }
    
    const requiredColumns = ['is_overdue', 'overdue_since', 'days_overdue', 'is_suspended', 'suspended_since', 'lost_interest_amount'];
    const existingColumns = columns.map(col => col.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.error('❌ Colonnes manquantes:', missingColumns);
      console.log('💡 Exécutez d\'abord le script add-savings-penalty-fields.sql');
      return;
    } else {
      console.log('✅ Toutes les colonnes de pénalité sont présentes');
    }
    
    // 2. Analyser les plans d'épargne existants
    console.log('\n2. 📊 Analyse des plans d\'épargne existants...');
    const { data: plans, error: plansError } = await supabase
      .from('savings_plans')
      .select(`
        id,
        user_id,
        plan_name,
        status,
        is_overdue,
        days_overdue,
        is_suspended,
        next_deposit_date,
        current_balance,
        total_interest_earned,
        lost_interest_amount,
        users!inner(first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (plansError) {
      console.error('❌ Erreur lors de la récupération des plans:', plansError);
      return;
    }
    
    if (!plans || plans.length === 0) {
      console.log('ℹ️ Aucun plan d\'épargne trouvé');
      return;
    }
    
    console.log(`📋 ${plans.length} plan(s) d'épargne trouvé(s):`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let overduePlans = 0;
    let suspendedPlans = 0;
    let totalLostInterest = 0;
    
    for (const plan of plans) {
      const depositDate = new Date(plan.next_deposit_date);
      const daysOverdue = Math.floor((today - depositDate) / (1000 * 60 * 60 * 24));
      
      console.log(`\n   📋 Plan #${plan.id} - ${plan.users.first_name} ${plan.users.last_name}:`);
      console.log(`      📅 Prochain dépôt: ${plan.next_deposit_date}`);
      console.log(`      📊 Statut: ${plan.status}`);
      console.log(`      ⚠️  En retard: ${plan.is_overdue ? 'Oui' : 'Non'}`);
      console.log(`      📈 Jours de retard: ${plan.days_overdue || 0}`);
      console.log(`      🚫 Suspendu: ${plan.is_suspended ? 'Oui' : 'Non'}`);
      console.log(`      💰 Solde actuel: ${(plan.current_balance || 0).toLocaleString()} FCFA`);
      console.log(`      📈 Intérêts gagnés: ${(plan.total_interest_earned || 0).toLocaleString()} FCFA`);
      console.log(`      💸 Intérêts perdus: ${(plan.lost_interest_amount || 0).toLocaleString()} FCFA`);
      
      if (daysOverdue > 0) {
        console.log(`      🚨 Calculé: ${daysOverdue} jour(s) de retard`);
        overduePlans++;
      }
      
      if (plan.is_suspended) {
        suspendedPlans++;
      }
      
      totalLostInterest += plan.lost_interest_amount || 0;
    }
    
    // 3. Résumé de l'analyse
    console.log('\n3. 📊 Résumé de l\'analyse:');
    console.log(`   📋 Total plans: ${plans.length}`);
    console.log(`   ⚠️  Plans en retard: ${overduePlans}`);
    console.log(`   🚫 Plans suspendus: ${suspendedPlans}`);
    console.log(`   💸 Total intérêts perdus: ${totalLostInterest.toLocaleString()} FCFA`);
    
    // 4. Test de simulation de retard
    console.log('\n4. 🧪 Simulation de gestion des retards...');
    
    // Créer un plan de test avec une date de dépôt passée
    const testPlanData = {
      user_id: plans[0]?.user_id || 'test-user-id',
      plan_name: 'Plan Test Pénalités',
      fixed_amount: 1000,
      frequency_days: 7,
      duration_months: 3,
      next_deposit_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 jours dans le passé
      status: 'active',
      current_balance: 5000,
      total_interest_earned: 250,
      is_overdue: false,
      is_suspended: false
    };
    
    console.log('   📝 Création d\'un plan de test avec 10 jours de retard...');
    
    const { data: testPlan, error: testPlanError } = await supabase
      .from('savings_plans')
      .insert(testPlanData)
      .select()
      .single();
    
    if (testPlanError) {
      console.log('   ⚠️ Impossible de créer le plan de test (probablement déjà existant)');
    } else {
      console.log('   ✅ Plan de test créé:', testPlan.id);
      
      // Simuler la gestion des retards
      console.log('   🔄 Simulation de la gestion des retards...');
      
      const depositDate = new Date(testPlan.next_deposit_date);
      const daysOverdue = Math.floor((today - depositDate) / (1000 * 60 * 60 * 24));
      
      if (daysOverdue >= 7) {
        console.log(`   🚨 Le plan devrait être suspendu (${daysOverdue} jours de retard)`);
        console.log(`   💸 Intérêts perdus: ${testPlan.total_interest_earned} FCFA`);
      } else if (daysOverdue > 0) {
        console.log(`   ⚠️ Le plan est en retard de ${daysOverdue} jour(s)`);
        console.log(`   💸 Intérêts perdus: ${testPlan.total_interest_earned} FCFA`);
      }
      
      // Nettoyer le plan de test
      await supabase
        .from('savings_plans')
        .delete()
        .eq('id', testPlan.id);
      
      console.log('   🧹 Plan de test supprimé');
    }
    
    console.log('\n✅ Test terminé avec succès !');
    console.log('\n💡 Pour tester en conditions réelles:');
    console.log('   1. Exécutez le script add-savings-penalty-fields.sql dans Supabase');
    console.log('   2. Redémarrez le serveur backend');
    console.log('   3. Le système s\'exécutera automatiquement à 11h chaque jour');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testSavingsPenaltySystem();
