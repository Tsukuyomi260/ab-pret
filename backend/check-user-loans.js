/**
 * Script pour vérifier tous les prêts actifs d'un utilisateur et voir lesquels sont entièrement remboursés
 * Usage: node backend/check-user-loans.js <user_id>
 */

require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserLoans(userId) {
  console.log(`\n🔍 Vérification des prêts pour l'utilisateur: ${userId}\n`);
  
  try {
    // Récupérer tous les prêts de l'utilisateur
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('id, amount, interest_rate, status, approved_at, duration, duration_months, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (loansError) {
      console.error('❌ Erreur récupération prêts:', loansError);
      return;
    }

    if (!loans || loans.length === 0) {
      console.log('✅ Aucun prêt trouvé pour cet utilisateur');
      return;
    }

    console.log(`📋 ${loans.length} prêt(s) trouvé(s)\n`);

    // Récupérer tous les paiements de l'utilisateur
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, loan_id, amount, status, payment_date, created_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('❌ Erreur récupération paiements:', paymentsError);
      return;
    }

    let needsFix = [];

    for (const loan of loans) {
      console.log(`\n📊 Prêt #${loan.id.substring(0, 8)}...`);
      console.log(`   - Statut actuel: ${loan.status}`);
      console.log(`   - Montant: ${parseFloat(loan.amount).toLocaleString()} FCFA`);
      console.log(`   - Taux d'intérêt: ${loan.interest_rate}%`);
      console.log(`   - Date création: ${loan.created_at ? new Date(loan.created_at).toLocaleDateString('fr-FR') : 'N/A'}`);
      console.log(`   - Date approbation: ${loan.approved_at ? new Date(loan.approved_at).toLocaleDateString('fr-FR') : 'N/A'}`);

      // Calculer le montant total attendu
      const principal = parseFloat(loan.amount) || 0;
      const interest = principal * ((loan.interest_rate || 0) / 100);
      let penalty = 0;

      // Recalculer les pénalités si nécessaire
      if (loan.approved_at) {
        const durationDays = loan.duration_months != null 
          ? Number(loan.duration_months) 
          : (loan.duration != null ? Number(loan.duration) : 30);
        
        const approvedDate = new Date(loan.approved_at);
        const dueDate = new Date(approvedDate);
        dueDate.setDate(dueDate.getDate() + durationDays);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        
        const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        
        if (daysOverdue > 0) {
          const rate = 2.0;
          const periods5 = Math.floor(daysOverdue / 5);
          
          if (periods5 > 0) {
            const withPenalties = (principal + interest) * Math.pow(1 + rate / 100, periods5);
            penalty = withPenalties - (principal + interest);
          }
        }
      }

      const totalExpected = principal + interest + penalty;

      // Récupérer les paiements pour ce prêt
      const loanPayments = (payments || []).filter(p => p.loan_id === loan.id);
      const totalPaid = loanPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      const remaining = totalExpected - totalPaid;
      const tolerance = 10;
      const isFullyPaid = totalPaid >= totalExpected - tolerance;

      console.log(`   💳 Paiements: ${loanPayments.length} paiement(s)`);
      if (loanPayments.length > 0) {
        loanPayments.forEach((p, i) => {
          console.log(`      ${i + 1}. ${parseFloat(p.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA - ${p.payment_date ? new Date(p.payment_date).toLocaleDateString('fr-FR') : new Date(p.created_at).toLocaleDateString('fr-FR')}`);
        });
      }
      console.log(`   💰 Total payé: ${totalPaid.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA`);
      console.log(`   💰 Total attendu: ${totalExpected.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA`);
      console.log(`   💰 Reste à payer: ${remaining.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA`);

      if (isFullyPaid && loan.status !== 'completed') {
        console.log(`   ⚠️ PROBLÈME: Prêt entièrement remboursé mais statut = "${loan.status}" au lieu de "completed"`);
        needsFix.push(loan.id);
      } else if (isFullyPaid && loan.status === 'completed') {
        console.log(`   ✅ OK: Prêt complété`);
      } else if (!isFullyPaid && loan.status === 'active') {
        console.log(`   ✅ OK: Prêt encore actif (normal)`);
      } else {
        console.log(`   ℹ️ Statut: ${loan.status}`);
      }
    }

    if (needsFix.length > 0) {
      console.log(`\n\n🔧 ${needsFix.length} prêt(s) nécessite(nt) une correction:`);
      needsFix.forEach((loanId, i) => {
        console.log(`   ${i + 1}. ${loanId}`);
      });
      console.log(`\n💡 Pour corriger, exécutez:`);
      needsFix.forEach(loanId => {
        console.log(`   node backend/fix-loan-status.js ${loanId}`);
      });
    } else {
      console.log(`\n✅ Tous les prêts ont le bon statut !`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Récupérer l'ID utilisateur depuis les arguments
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Usage: node backend/check-user-loans.js <user_id>');
  console.error('   Exemple: node backend/check-user-loans.js 02f85ba9-2700-45f4-a146-ddba6d0cb8b3');
  process.exit(1);
}

checkUserLoans(userId)
  .then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
