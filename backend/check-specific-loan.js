const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkSpecificLoan(loanId) {
  try {
    console.log(`🔍 Vérification du prêt: ${loanId}`);
    
    const { data: loan, error } = await supabase
      .from('loans')
      .select('*')
      .eq('id', loanId)
      .single();
    
    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }
    
    console.log('📊 Détails du prêt:');
    console.log(`   - ID: ${loan.id}`);
    console.log(`   - Statut: ${loan.status}`);
    console.log(`   - Montant: ${loan.amount}`);
    console.log(`   - User ID: ${loan.user_id}`);
    console.log(`   - Créé le: ${loan.created_at}`);
    console.log(`   - Mis à jour le: ${loan.updated_at}`);
    
    // Vérifier les paiements pour ce prêt
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('loan_id', loanId);
    
    if (paymentsError) {
      console.error('❌ Erreur récupération paiements:', paymentsError);
      return;
    }
    
    console.log(`💰 Paiements pour ce prêt: ${payments.length}`);
    payments.forEach((payment, index) => {
      console.log(`   ${index + 1}. Montant: ${payment.amount}, Statut: ${payment.status}, Transaction ID: ${payment.transaction_id}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Prêt mentionné dans les logs FedaPay
const loanId = 'b6653f2b-ebf3-4e4c-9ac4-c549ea7da126';
checkSpecificLoan(loanId);
