/**
 * Script pour vérifier et corriger AUTOMATIQUEMENT tous les prêts d'un utilisateur
 * Usage: node backend/fix-user-all-loans.js <user_id>
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

async function fixUserAllLoans(userId) {
  console.log(`\n🔍 Vérification et correction des prêts pour l'utilisateur: ${userId}\n`);
  
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
      .eq('status', 'completed');

    if (paymentsError) {
      console.error('❌ Erreur récupération paiements:', paymentsError);
      return;
    }

    let fixedCount = 0;
    let alreadyCorrectCount = 0;

    for (const loan of loans) {
      console.log(`\n📊 Prêt #${loan.id.substring(0, 8)}...`);
      console.log(`   - Statut actuel: ${loan.status}`);

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
      const tolerance = 10;
      const isFullyPaid = totalPaid >= totalExpected - tolerance;

      console.log(`   💰 Total payé: ${totalPaid.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA`);
      console.log(`   💰 Total attendu: ${totalExpected.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA`);

      if (isFullyPaid && loan.status !== 'completed') {
        console.log(`   ⚠️ PROBLÈME DÉTECTÉ: Prêt entièrement remboursé mais statut = "${loan.status}"`);
        console.log(`   🔧 Correction en cours...`);
        
        const { error: updateError } = await supabase
          .from('loans')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', loan.id);

        if (updateError) {
          console.error(`   ❌ Erreur correction:`, updateError.message);
        } else {
          console.log(`   ✅ CORRIGÉ: ${loan.status} → completed`);
          fixedCount++;
        }
      } else if (isFullyPaid && loan.status === 'completed') {
        console.log(`   ✅ OK: Prêt déjà complété`);
        alreadyCorrectCount++;
      } else {
        console.log(`   ✅ OK: Prêt encore actif (normal, reste à payer)`);
      }
    }

    console.log(`\n\n📊 Résumé:`);
    console.log(`   ✅ Prêts corrigés: ${fixedCount}`);
    console.log(`   ✅ Prêts déjà corrects: ${alreadyCorrectCount}`);
    console.log(`   ✅ Prêts encore actifs (normal): ${loans.length - fixedCount - alreadyCorrectCount}`);

    if (fixedCount > 0) {
      console.log(`\n🎉 ${fixedCount} prêt(s) corrigé(s) ! Vous pouvez maintenant faire une nouvelle demande de prêt.`);
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
  console.error('❌ Usage: node backend/fix-user-all-loans.js <user_id>');
  console.error('\n💡 Pour trouver votre user_id:');
  console.error('   1. Ouvrez l\'app');
  console.error('   2. Allez dans les paramètres/profil');
  console.error('   3. Ou regardez dans les logs backend lors de la connexion');
  console.error('\n   Exemple: node backend/fix-user-all-loans.js 02f85ba9-2700-45f4-a146-ddba6d0cb8b3');
  process.exit(1);
}

fixUserAllLoans(userId)
  .then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
