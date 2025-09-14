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

// Fonction pour traiter la création de plan d'épargne via FedaPay
const processFedaPaySavingsPlanCreation = async ({ user_id, amount, transaction_id, payment_method, paid_at }) => {
  try {
    console.log('[FEDAPAY_SAVINGS] Début du traitement de la création de plan d\'épargne:', {
      user_id,
      amount,
      transaction_id
    });

    if (!supabase) {
      throw new Error('Client Supabase non initialisé');
    }

    // 1. Récupérer les informations de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone_number')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      console.error('[FEDAPAY_SAVINGS] Erreur récupération utilisateur:', userError);
      throw new Error(`Utilisateur non trouvé: ${userError?.message || 'Utilisateur introuvable'}`);
    }

    console.log('[FEDAPAY_SAVINGS] Utilisateur trouvé:', userData);

    // 2. Créer le compte d'épargne s'il n'existe pas
    const { data: account, error: accErr } = await supabase
      .from('savings_accounts')
      .insert({
        user_id,
        balance: 0,
        account_creation_fee_paid: true,
        account_creation_fee_amount: amount,
        interest_rate: 5.00, // 5% par mois
        total_interest_earned: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    let savingsAccountId;
    if (accErr) {
      // Si le compte existe déjà, le récupérer
      if (accErr.code === '23505') { // Violation de contrainte unique
        const { data: existingAccount, error: fetchErr } = await supabase
          .from('savings_accounts')
          .select('*')
          .eq('user_id', user_id)
          .single();
        
        if (fetchErr) throw fetchErr;
        savingsAccountId = existingAccount.id;
        console.log('[FEDAPAY_SAVINGS] Compte d\'épargne existant trouvé:', existingAccount);
      } else {
        throw accErr;
      }
    } else {
      savingsAccountId = account.id;
      console.log('[FEDAPAY_SAVINGS] Compte d\'épargne créé:', account);
    }

    // 3. Créer un plan d'épargne par défaut avec la structure correcte
    const fixedAmount = 100.00; // 100 FCFA
    const frequencyDays = 10; // Tous les 10 jours (conforme aux contraintes)
    const durationMonths = 3; // 3 mois (conforme aux contraintes)
    const totalDepositsRequired = (durationMonths * 30) / frequencyDays; // 9 dépôts
    const totalAmountTarget = fixedAmount * totalDepositsRequired; // 900 FCFA
    
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);
    
    const savingsPlanData = {
      user_id: user_id,
      savings_account_id: savingsAccountId,
      plan_name: 'Plan Campus Finance',
      fixed_amount: fixedAmount,
      frequency_days: frequencyDays,
      duration_months: durationMonths,
      total_deposits_required: totalDepositsRequired,
      total_amount_target: totalAmountTarget,
      completed_deposits: 0,
      current_balance: 0,
      total_deposited: 0,
      start_date: new Date().toISOString(),
      end_date: endDate.toISOString(),
      next_deposit_date: new Date().toISOString(),
      status: 'active',
      completion_percentage: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 3. Créer le plan d'épargne en y mettant BIEN la transaction_id
    const { data: planData, error: planError } = await supabase
      .from('savings_plans')
      .insert({
        user_id,
        savings_account_id: savingsAccountId,
        plan_name: 'Plan Campus Finance',
        fixed_amount: fixedAmount,
        frequency_days: frequencyDays,
        duration_months: durationMonths,
        total_deposits_required: Math.ceil((durationMonths * 30) / frequencyDays),
        total_amount_target: fixedAmount * Math.ceil((durationMonths * 30) / frequencyDays),
        completed_deposits: 0,
        current_balance: 0,
        total_deposited: 0,
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        next_deposit_date: new Date().toISOString(),
        status: 'active',
        completion_percentage: 0,
        transaction_reference: String(transaction_id),     // 👈 OBLIGATOIRE pour le polling
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (planError) {
      console.error('[FEDAPAY_SAVINGS] Erreur création plan d\'épargne:', planError);
      throw new Error(`Erreur création plan d'épargne: ${planError.message}`);
    }

    console.log('[FEDAPAY_SAVINGS] Plan d\'épargne créé avec transaction_id:', planData);

    // 4. (optionnel) enregistrer une "transaction d'épargne" liée au plan
    const { data: transaction, error: transErr } = await supabase
      .from('savings_transactions')
      .insert({
        user_id,
        savings_account_id: savingsAccountId,
        savings_plan_id: planData.id,
        type: 'account_creation_fee',
        amount: amount,
        description: 'Frais de création de compte épargne',
        payment_method: payment_method || 'mobile_money',
        payment_reference: String(transaction_id),
        payment_status: 'completed',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (transErr) {
      console.error('[FEDAPAY_SAVINGS] Erreur création transaction d\'épargne:', transErr);
      // Ne pas faire échouer le processus, juste logger l'erreur
    } else {
      console.log('[FEDAPAY_SAVINGS] Transaction d\'épargne créée:', transaction);
    }

    console.log('[FEDAPAY_SAVINGS] ✅ Plan d\'épargne créé avec succès');

    return { 
      success: true, 
      plan_id: planData.id,
      account_id: savingsAccountId,
      transaction_id: String(transaction_id)
    };

  } catch (error) {
    console.error('[FEDAPAY_SAVINGS] process error:', error);
    return { success: false, error: error.message || 'Erreur inconnue' };
  }
};

module.exports = {
  processFedaPayLoanRepayment,
  processFedaPaySavingsPlanCreation
};