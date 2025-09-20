const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function debugUserLoans(userId) {
  try {
    console.log(`🔍 Débogage des prêts pour l'utilisateur: ${userId}`);
    
    // Récupérer tous les prêts de l'utilisateur
    const { data: loans, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }
    
    console.log('📊 Tous les prêts de l\'utilisateur:');
    loans.forEach((loan, index) => {
      console.log(`${index + 1}. Prêt #${loan.id}`);
      console.log(`   - Statut: ${loan.status}`);
      console.log(`   - Montant: ${loan.amount}`);
      console.log(`   - Créé le: ${loan.created_at}`);
      console.log(`   - Mis à jour le: ${loan.updated_at}`);
      console.log('---');
    });

    // Vérifier la logique de la page de remboursement
    console.log('\n🔍 LOGIQUE PAGE REMBOURSEMENT:');
    const activeLoanForRepayment = loans.find(loan => 
      loan.status === 'active' || loan.status === 'approved'
    );
    
    if (activeLoanForRepayment) {
      console.log('✅ Page remboursement: Affiche le prêt (actif/approuvé)');
      console.log(`   - Prêt #${activeLoanForRepayment.id} (${activeLoanForRepayment.status})`);
    } else {
      console.log('❌ Page remboursement: Aucun prêt à afficher');
    }

    // Vérifier la logique de la page de demande de prêt
    console.log('\n🔍 LOGIQUE PAGE DEMANDE DE PRÊT:');
    const activeLoanForRequest = loans.find(loan => 
      loan.status === 'active' || loan.status === 'approved'
    );
    
    if (activeLoanForRequest) {
      console.log('❌ Page demande de prêt: Empêche la demande (prêt actif/approuvé)');
      console.log(`   - Prêt #${activeLoanForRequest.id} (${activeLoanForRequest.status})`);
    } else {
      console.log('✅ Page demande de prêt: Permet la demande (aucun prêt actif/approuvé)');
    }

    // Vérifier les paiements pour chaque prêt
    console.log('\n💰 PAIEMENTS PAR PRÊT:');
    for (const loan of loans) {
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('loan_id', loan.id);
      
      if (paymentsError) {
        console.error(`❌ Erreur récupération paiements pour prêt ${loan.id}:`, paymentsError);
        continue;
      }
      
      const totalPaid = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      console.log(`Prêt #${loan.id} (${loan.status}): ${payments.length} paiements, total: ${totalPaid} FCFA`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Remplacer par l'ID de l'utilisateur qui a le problème
// Vous pouvez trouver cet ID dans les logs de l'application ou dans la base de données
const userId = '33b107a8-bedf-4c54-9535-5b25803e19d7'; // Paterne Godson
debugUserLoans(userId);
