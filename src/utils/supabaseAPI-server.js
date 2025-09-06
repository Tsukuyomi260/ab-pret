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

    // 2. Créer le compte d'épargne s'il n'existe pas (en utilisant SQL direct pour contourner RLS)
    let savingsAccountId;
    
    try {
      // Vérifier si le compte existe
      const { data: existingAccount, error: accountCheckError } = await supabase
        .rpc('get_user_savings_account', { user_id_param: user_id });

      if (existingAccount && existingAccount.length > 0) {
        savingsAccountId = existingAccount[0].id;
        console.log('[FEDAPAY_SAVINGS] Compte d\'épargne existant trouvé:', existingAccount[0]);
      } else {
        // Créer le compte d'épargne avec SQL direct
        const { data: newAccount, error: accountError } = await supabase
          .rpc('create_savings_account', {
            user_id_param: user_id,
            balance_param: 0,
            account_creation_fee_paid_param: true,
            account_creation_fee_amount_param: 1000.00,
            interest_rate_param: 5.00, // 5% par mois
            total_interest_earned_param: 0,
            is_active_param: true
          });

        if (accountError) {
          console.error('[FEDAPAY_SAVINGS] Erreur création compte d\'épargne:', accountError);
          throw new Error(`Erreur création compte d'épargne: ${accountError.message}`);
        }

        savingsAccountId = newAccount[0].id;
        console.log('[FEDAPAY_SAVINGS] Compte d\'épargne créé:', newAccount[0]);
      }
    } catch (error) {
      console.error('[FEDAPAY_SAVINGS] Erreur lors de la gestion du compte d\'épargne:', error);
      throw new Error(`Erreur gestion compte d'épargne: ${error.message}`);
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

    const { data: planData, error: planError } = await supabase
      .rpc('create_savings_plan', {
        user_id_param: user_id,
        savings_account_id_param: savingsAccountId,
        plan_name_param: savingsPlanData.plan_name,
        fixed_amount_param: savingsPlanData.fixed_amount,
        frequency_days_param: savingsPlanData.frequency_days,
        duration_months_param: savingsPlanData.duration_months,
        total_deposits_required_param: savingsPlanData.total_deposits_required,
        total_amount_target_param: savingsPlanData.total_amount_target,
        completed_deposits_param: savingsPlanData.completed_deposits,
        current_balance_param: savingsPlanData.current_balance,
        total_deposited_param: savingsPlanData.total_deposited,
        start_date_param: savingsPlanData.start_date,
        end_date_param: savingsPlanData.end_date,
        next_deposit_date_param: savingsPlanData.next_deposit_date,
        status_param: savingsPlanData.status,
        completion_percentage_param: savingsPlanData.completion_percentage
      });

    if (planError) {
      console.error('[FEDAPAY_SAVINGS] Erreur création plan d\'épargne:', planError);
      throw new Error(`Erreur création plan d'épargne: ${planError.message}`);
    }

    console.log('[FEDAPAY_SAVINGS] Plan d\'épargne créé:', planData[0]);

    // 4. Créer la transaction d'épargne pour les frais de création
    const { data: transactionData, error: transactionError } = await supabase
      .rpc('create_savings_transaction', {
        user_id_param: user_id,
        savings_account_id_param: savingsAccountId,
        savings_plan_id_param: planData[0].id,
        type_param: 'account_creation_fee',
        amount_param: 1000.00, // Frais de création
        description_param: 'Frais de création de compte épargne',
        payment_method_param: payment_method || 'mobile_money',
        payment_reference_param: transaction_id,
        payment_status_param: 'completed'
      });

    if (transactionError) {
      console.error('[FEDAPAY_SAVINGS] Erreur création transaction d\'épargne:', transactionError);
      // Ne pas faire échouer le processus, juste logger l'erreur
    } else {
      console.log('[FEDAPAY_SAVINGS] Transaction d\'épargne créée:', transactionData[0]);
    }

    // 5. Mettre à jour le compte d'épargne avec les frais payés ET le balance
    const { data: updatedAccount, error: updateError } = await supabase
      .from('savings_accounts')
      .update({
        account_creation_fee_paid: true,
        balance: 1000.00, // CRUCIAL: Mettre le balance à 1000 pour que le frontend détecte le plan
        updated_at: new Date().toISOString()
      })
      .eq('id', savingsAccountId)
      .select()
      .single();

    if (updateError) {
      console.error('[FEDAPAY_SAVINGS] Erreur mise à jour compte d\'épargne:', updateError);
    } else {
      console.log('[FEDAPAY_SAVINGS] Compte d\'épargne mis à jour:', updatedAccount[0]);
    }

    console.log('[FEDAPAY_SAVINGS] ✅ Plan d\'épargne créé avec succès');

    return {
      success: true,
      data: {
        plan_id: planData.id,
        account_id: savingsAccountId,
        user_id: user_id,
        amount: 1000.00, // Frais de création
        transaction_id: transaction_id
      }
    };

  } catch (error) {
    console.error('[FEDAPAY_SAVINGS] Erreur lors de la création du plan d\'épargne:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la création du plan d\'épargne'
    };
  }
};

module.exports = {
  processFedaPayLoanRepayment,
  processFedaPaySavingsPlanCreation
};