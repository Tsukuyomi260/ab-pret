/**
 * Script pour vérifier et corriger le statut d'un prêt spécifique
 * Usage: node backend/fix-loan-status.js <loan_id>
 */

require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('Assurez-vous que REACT_APP_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies dans backend/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixLoanStatus(loanId) {
  console.log(`\n🔍 Vérification du prêt: ${loanId}\n`);
  
  try {
    // 1. Récupérer le prêt (colonnes de base uniquement)
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('id, amount, interest_rate, status, approved_at, duration, duration_months, user_id')
      .eq('id', loanId)
      .single();

    if (loanError || !loan) {
      console.error('❌ Prêt non trouvé:', loanError);
      return;
    }

    console.log('📋 Informations du prêt:');
    console.log(`   - Montant: ${parseFloat(loan.amount).toLocaleString()} FCFA`);
    console.log(`   - Taux d'intérêt: ${loan.interest_rate}%`);
    console.log(`   - Statut actuel: ${loan.status}`);
    console.log(`   - Date d'approbation: ${loan.approved_at || 'N/A'}`);

    // 2. Calculer le montant total attendu
    const principal = parseFloat(loan.amount) || 0;
    const interest = principal * ((loan.interest_rate || 0) / 100);
    let penalty = 0; // Les pénalités seront recalculées si nécessaire

    // Recalculer les pénalités si nécessaire
    if (penalty === 0 && loan.approved_at) {
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
        // Taux de pénalité par défaut: 2% tous les 5 jours
        const rate = 2.0;
        const periods5 = Math.floor(daysOverdue / 5);
        
        if (periods5 > 0) {
          const withPenalties = (principal + interest) * Math.pow(1 + rate / 100, periods5);
          penalty = withPenalties - (principal + interest);
          console.log(`   - Pénalités recalculées: ${penalty.toFixed(2)} FCFA (${periods5} périodes de 5 jours)`);
        }
      }
    }

    const totalExpected = principal + interest + penalty;
    console.log(`\n💰 Montant total attendu: ${totalExpected.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA`);
    console.log(`   - Capital: ${principal.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA`);
    console.log(`   - Intérêts: ${interest.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA`);
    console.log(`   - Pénalités: ${penalty.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA`);

    // 3. Récupérer tous les paiements
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, amount, status, payment_date, transaction_id')
      .eq('loan_id', loanId)
      .eq('status', 'completed')
      .order('payment_date', { ascending: true });

    if (paymentsError) {
      console.error('❌ Erreur récupération paiements:', paymentsError);
      return;
    }

    const totalPaid = (payments || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const remaining = totalExpected - totalPaid;

    console.log(`\n💳 Paiements effectués (${payments?.length || 0} paiement(s)):`);
    if (payments && payments.length > 0) {
      payments.forEach((p, i) => {
        console.log(`   ${i + 1}. ${parseFloat(p.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA - ${p.payment_date ? new Date(p.payment_date).toLocaleDateString('fr-FR') : 'N/A'}`);
      });
    } else {
      console.log('   Aucun paiement trouvé');
    }

    console.log(`\n📊 Résumé:`);
    console.log(`   - Total payé: ${totalPaid.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA`);
    console.log(`   - Reste à payer: ${remaining.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA`);

    // 4. Vérifier si le prêt est entièrement remboursé
    const tolerance = 10; // Tolérance de 10 FCFA
    const isFullyPaid = totalPaid >= totalExpected - tolerance;

    console.log(`\n✅ Vérification:`);
    console.log(`   - Prêt entièrement remboursé: ${isFullyPaid ? 'OUI ✅' : 'NON ❌'}`);
    console.log(`   - Statut actuel: ${loan.status}`);
    console.log(`   - Statut attendu: ${isFullyPaid ? 'completed' : 'active'}`);

    // 5. Corriger le statut si nécessaire
    if (isFullyPaid && loan.status !== 'completed') {
      console.log(`\n🔧 Correction du statut...`);
      
      const { data: updatedLoan, error: updateError } = await supabase
        .from('loans')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', loanId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erreur mise à jour:', updateError);
        return;
      }

      console.log(`✅ Statut corrigé: ${loan.status} → completed`);
      console.log(`\n🎉 Le prêt est maintenant marqué comme complété !`);
    } else if (isFullyPaid && loan.status === 'completed') {
      console.log(`\n✅ Le statut est déjà correct (completed)`);
    } else {
      console.log(`\n⚠️ Le prêt n'est pas encore entièrement remboursé.`);
      console.log(`   Il reste ${remaining.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA à payer.`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Récupérer l'ID du prêt depuis les arguments
const loanId = process.argv[2];

if (!loanId) {
  console.error('❌ Usage: node backend/fix-loan-status.js <loan_id>');
  console.error('   Exemple: node backend/fix-loan-status.js a6d4f190-8d7d-440a-a9d5-87fdb59fe78f');
  process.exit(1);
}

fixLoanStatus(loanId)
  .then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
