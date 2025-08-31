const { supabase } = require('./supabaseClient-server');

// Fonction pour traiter le remboursement FedaPay
const processFedaPayLoanRepayment = async ({ loan_id, user_id, amount, transaction_id, payment_method, paid_at }) => {
  try {
    console.log('[FEDAPAY_PROCESS] Début du traitement du remboursement:', {
      loan_id,
      user_id,
      amount,
      transaction_id
    });

    if (!supabase) {
      throw new Error('Client Supabase non initialisé');
    }

    // 1. Créer l'enregistrement de paiement
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        loan_id: loan_id,
        user_id: user_id,
        amount: amount,
        transaction_id: transaction_id,
        method: 'mobile_money', // Valeur fixe autorisée
        status: 'pending', // Utiliser 'pending' au lieu de 'completed'
        payment_date: paid_at,
        created_at: new Date().toISOString()
      }])
      .select();

    if (paymentError) {
      console.error('[FEDAPAY_PROCESS] Erreur création paiement:', paymentError);
      throw new Error(`Erreur création paiement: ${paymentError.message}`);
    }

    console.log('[FEDAPAY_PROCESS] Paiement créé:', paymentData[0]);

    // 2. Mettre à jour le statut du prêt à 'completed'
    const { data: loanData, error: loanError } = await supabase
      .from('loans')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', loan_id)
      .select();

    if (loanError) {
      console.error('[FEDAPAY_PROCESS] Erreur mise à jour prêt:', loanError);
      throw new Error(`Erreur mise à jour prêt: ${loanError.message}`);
    }

    console.log('[FEDAPAY_PROCESS] Prêt mis à jour:', loanData[0]);

    // 3. Créer une notification pour l'admin
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert([{
        user_id: user_id,
        type: 'loan_repayment',
        title: 'Remboursement effectué',
        message: `Le prêt #${loan_id} a été remboursé avec succès (${amount} FCFA)`,
        is_read: false,
        created_at: new Date().toISOString()
      }]);

    if (notificationError) {
      console.warn('[FEDAPAY_PROCESS] Erreur création notification:', notificationError);
      // Ne pas faire échouer le processus pour une notification
    }

    console.log('[FEDAPAY_PROCESS] ✅ Remboursement traité avec succès');

    return {
      success: true,
      payment: paymentData[0],
      loan: loanData[0]
    };

  } catch (error) {
    console.error('[FEDAPAY_PROCESS] ❌ Erreur lors du traitement:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  processFedaPayLoanRepayment
}; 