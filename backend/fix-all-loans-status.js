/**
 * Script pour vérifier et corriger TOUS les prêts qui sont entièrement remboursés
 * mais qui ont encore le statut "active" au lieu de "completed"
 * Usage: node backend/fix-all-loans-status.js
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

async function checkAndFixAllLoans() {
  console.log('\n🔍 Recherche de tous les prêts avec statut "active" ou "approved"...\n');
  
  try {
    // Récupérer tous les prêts actifs
    const { data: activeLoans, error: loansError } = await supabase
      .from('loans')
      .select('id, amount, interest_rate, status, approved_at, duration, duration_months, user_id')
      .in('status', ['active', 'approved', 'overdue'])
      .order('created_at', { ascending: false });

    if (loansError) {
      console.error('❌ Erreur récupération prêts:', loansError);
      return;
    }

    if (!activeLoans || activeLoans.length === 0) {
      console.log('✅ Aucun prêt actif trouvé');
      return;
    }

    console.log(`📋 ${activeLoans.length} prêt(s) actif(s) trouvé(s)\n`);

    let fixedCount = 0;
    let alreadyCompletedCount = 0;
    let stillActiveCount = 0;

    for (const loan of activeLoans) {
      try {
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
            const rate = 2.0; // Taux de pénalité par défaut: 2% tous les 5 jours
            const periods5 = Math.floor(daysOverdue / 5);
            
            if (periods5 > 0) {
              const withPenalties = (principal + interest) * Math.pow(1 + rate / 100, periods5);
              penalty = withPenalties - (principal + interest);
            }
          }
        }

        const totalExpected = principal + interest + penalty;

        // Récupérer tous les paiements
        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .eq('loan_id', loan.id)
          .eq('status', 'completed');

        const totalPaid = (payments || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const tolerance = 10; // Tolérance de 10 FCFA
        const isFullyPaid = totalPaid >= totalExpected - tolerance;

        if (isFullyPaid) {
          // Le prêt est entièrement remboursé, corriger le statut
          const { error: updateError } = await supabase
            .from('loans')
            .update({
              status: 'completed',
              updated_at: new Date().toISOString()
            })
            .eq('id', loan.id);

          if (updateError) {
            console.error(`❌ Erreur correction prêt ${loan.id.substring(0, 8)}...:`, updateError.message);
          } else {
            console.log(`✅ Prêt ${loan.id.substring(0, 8)}... corrigé: ${loan.status} → completed`);
            console.log(`   Montant: ${principal.toLocaleString()} FCFA | Payé: ${totalPaid.toLocaleString()} FCFA | Attendu: ${totalExpected.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA\n`);
            fixedCount++;
          }
        } else {
          const remaining = totalExpected - totalPaid;
          if (remaining <= 100) {
            // Prêt presque remboursé mais pas encore complété
            console.log(`⚠️ Prêt ${loan.id.substring(0, 8)}... presque remboursé (reste: ${remaining.toFixed(2)} FCFA)`);
            stillActiveCount++;
          } else {
            stillActiveCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Erreur traitement prêt ${loan.id.substring(0, 8)}...:`, error.message);
      }
    }

    console.log('\n📊 Résumé:');
    console.log(`   ✅ Prêts corrigés: ${fixedCount}`);
    console.log(`   ⚠️ Prêts encore actifs (normal): ${stillActiveCount}`);
    console.log(`\n🎉 Vérification terminée !`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkAndFixAllLoans()
  .then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
