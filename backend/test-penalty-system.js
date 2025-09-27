// Test du système de pénalités pour les prêts en retard
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

console.log('🧪 Test du système de pénalités pour les prêts en retard...\n');

async function testPenaltySystem() {
  try {
    // 1. Vérifier la structure de la table loans
    console.log('1. 🔍 Vérification de la structure de la table loans...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, column_default')
      .eq('table_name', 'loans')
      .in('column_name', ['daily_penalty_rate', 'total_penalty_amount', 'last_penalty_calculation']);
    
    if (columnsError) {
      console.error('   ❌ Erreur récupération colonnes:', columnsError);
    } else {
      console.log('   📊 Colonnes de pénalités:');
      columns.forEach(col => {
        console.log(`      - ${col.column_name}: ${col.data_type} (défaut: ${col.column_default || 'NULL'})`);
      });
    }

    // 2. Récupérer tous les prêts
    console.log('\n2. 📋 Récupération des prêts...');
    
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select(`
        id,
        user_id,
        amount,
        interest_rate,
        duration,
        approved_at,
        status,
        daily_penalty_rate,
        total_penalty_amount,
        last_penalty_calculation,
        created_at,
        users!inner(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (loansError) {
      console.error('   ❌ Erreur récupération prêts:', loansError);
      return;
    }
    
    console.log(`   📊 Total prêts: ${loans.length}`);
    
    // 3. Analyser chaque prêt
    console.log('\n3. 📅 Analyse des prêts et calcul des pénalités...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const loanAnalysis = {
      total: loans.length,
      active: 0,
      overdue: 0,
      completed: 0,
      pending: 0,
      withPenalties: 0,
      totalPenaltyAmount: 0
    };
    
    for (const loan of loans) {
      // Compter par statut
      loanAnalysis[loan.status] = (loanAnalysis[loan.status] || 0) + 1;
      
      if (loan.status === 'active' || loan.status === 'overdue') {
        // Calculer la date d'échéance
        const approvedDate = new Date(loan.approved_at);
        const dueDate = new Date(approvedDate);
        dueDate.setDate(dueDate.getDate() + loan.duration);
        
        const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        
        if (daysOverdue > 0) {
          // Calculer les pénalités
          const penaltyRate = loan.daily_penalty_rate || 2.0;
          const principalAmount = parseFloat(loan.amount);
          const interestAmount = principalAmount * (loan.interest_rate / 100);
          const totalOriginalAmount = principalAmount + interestAmount;
          const totalPenalty = totalOriginalAmount * (penaltyRate / 100) * daysOverdue;
          
          loanAnalysis.withPenalties++;
          loanAnalysis.totalPenaltyAmount += totalPenalty;
          
          console.log(`   🚨 Prêt #${loan.id} - ${loan.users.first_name} ${loan.users.last_name}:`);
          console.log(`      💰 Montant original: ${principalAmount.toLocaleString()} FCFA`);
          console.log(`      📅 En retard depuis: ${daysOverdue} jour(s)`);
          console.log(`      ⚠️  Pénalité calculée: ${totalPenalty.toLocaleString()} FCFA`);
          console.log(`      💸 Montant total avec pénalité: ${(totalOriginalAmount + totalPenalty).toLocaleString()} FCFA`);
          console.log(`      📊 Statut actuel: ${loan.status}`);
          console.log(`      🗓️  Date d'échéance: ${dueDate.toISOString().split('T')[0]}`);
          console.log('');
        } else {
          console.log(`   ✅ Prêt #${loan.id} - ${loan.users.first_name} ${loan.users.last_name}: À jour`);
        }
      }
    }
    
    // 4. Résumé de l'analyse
    console.log('4. 📊 Résumé de l\'analyse:');
    console.log(`   📋 Total prêts: ${loanAnalysis.total}`);
    console.log(`   🟢 Prêts actifs: ${loanAnalysis.active}`);
    console.log(`   🔴 Prêts en retard: ${loanAnalysis.overdue}`);
    console.log(`   ✅ Prêts complétés: ${loanAnalysis.completed}`);
    console.log(`   ⏳ Prêts en attente: ${loanAnalysis.pending}`);
    console.log(`   ⚠️  Prêts avec pénalités: ${loanAnalysis.withPenalties}`);
    console.log(`   💰 Montant total des pénalités: ${loanAnalysis.totalPenaltyAmount.toLocaleString()} FCFA`);
    
    // 5. Test du calcul de pénalités
    console.log('\n5. 🧮 Test du calcul de pénalités:');
    
    const testCases = [
      { amount: 10000, interestRate: 25, duration: 30, daysOverdue: 1 },
      { amount: 25000, interestRate: 25, duration: 30, daysOverdue: 3 },
      { amount: 50000, interestRate: 30, duration: 30, daysOverdue: 7 },
      { amount: 100000, interestRate: 25, duration: 25, daysOverdue: 15 }
    ];
    
    testCases.forEach((testCase, index) => {
      const principalAmount = testCase.amount;
      const interestAmount = principalAmount * (testCase.interestRate / 100);
      const totalOriginalAmount = principalAmount + interestAmount;
      const penaltyRate = 2.0; // 2% par jour
      const totalPenalty = totalOriginalAmount * (penaltyRate / 100) * testCase.daysOverdue;
      const totalAmountWithPenalty = totalOriginalAmount + totalPenalty;
      
      console.log(`   Test ${index + 1}:`);
      console.log(`      💰 Prêt: ${principalAmount.toLocaleString()} FCFA (${testCase.interestRate}% intérêts)`);
      console.log(`      📅 Durée: ${testCase.duration} jours, Retard: ${testCase.daysOverdue} jour(s)`);
      console.log(`      💸 Montant original: ${totalOriginalAmount.toLocaleString()} FCFA`);
      console.log(`      ⚠️  Pénalité (${penaltyRate}%/jour): ${totalPenalty.toLocaleString()} FCFA`);
      console.log(`      💰 Total avec pénalité: ${totalAmountWithPenalty.toLocaleString()} FCFA`);
      console.log('');
    });
    
    // 6. Recommandations
    console.log('6. 💡 Recommandations:');
    console.log('   🔄 Exécuter le script de gestion des retards quotidiennement');
    console.log('   📱 Envoyer des notifications push aux clients en retard');
    console.log('   📧 Envoyer des emails de rappel avec le montant des pénalités');
    console.log('   🚫 Bloquer les nouveaux prêts pour les clients en retard');
    console.log('   📊 Surveiller l\'évolution des pénalités');
    console.log('   🤝 Contacter les clients avec des retards importants');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testPenaltySystem().then(() => {
  console.log('\n✅ Test terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
