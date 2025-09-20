const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkLoanPayments(loanId) {
  try {
    console.log(`🔍 Vérification des paiements pour le prêt: ${loanId}`);
    
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }
    
    console.log('📊 Paiements trouvés:', payments.length);
    payments.forEach((payment, index) => {
      console.log(`${index + 1}. Paiement #${payment.id}`);
      console.log(`   - Montant: ${payment.amount}`);
      console.log(`   - Statut: ${payment.status}`);
      console.log(`   - Méthode: ${payment.method}`);
      console.log(`   - Transaction ID: ${payment.transaction_id}`);
      console.log(`   - Date: ${payment.payment_date}`);
      console.log(`   - Créé le: ${payment.created_at}`);
      console.log('---');
    });

    // Calculer le total payé
    const totalPaid = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    console.log(`💰 Total payé: ${totalPaid} FCFA`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Prêt qui pose problème
const loanId = '2e5ded52-759e-462c-ae18-a402f3ea8bb7';
checkLoanPayments(loanId);
