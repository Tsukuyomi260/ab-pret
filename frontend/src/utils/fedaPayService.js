// Service FedaPay pour les remboursements de prêts
// Configuration FedaPay
const FEDAPAY_CONFIG = {
  // Remplacez par vos vraies clés FedaPay
  publicKey: process.env.REACT_APP_FEDAPAY_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxfgxxxxxxxxxxxx',
  secretKey: process.env.REACT_APP_FEDAPAY_SECRET_KEY || 'sk_test_xxxxxxxxxxxxxxxxxgfxxxxxxxxxxxx',
  baseUrl: process.env.REACT_APP_FEDAPAY_BASE_URL || 'https://api.fedapay.com/v1',
  currency: 'XOF', // Franc CFA
  country: 'BJ' // Bénin
};

// Log de la configuration pour débogage
console.log('[FEDAPAY_CONFIG] Configuration chargée:', {
  publicKey: FEDAPAY_CONFIG.publicKey ? `${FEDAPAY_CONFIG.publicKey.substring(0, 10)}...` : 'NON CONFIGURÉE',
  secretKey: FEDAPAY_CONFIG.secretKey ? `${FEDAPAY_CONFIG.secretKey.substring(0, 10)}...` : 'NON CONFIGURÉE',
  baseUrl: FEDAPAY_CONFIG.baseUrl,
  currency: FEDAPAY_CONFIG.currency,
  country: FEDAPAY_CONFIG.country
});

// ===== FONCTIONS FEDAPAY =====

/**
 * Initialise un paiement FedaPay embarqué
 * @param {Object} paymentData - Données du paiement
 * @param {number} paymentData.amount - Montant en centimes
 * @param {string} paymentData.currency - Devise (XOF)
 * @param {string} paymentData.description - Description du paiement
 * @param {string} paymentData.customer_email - Email du client
 * @param {string} paymentData.customer_phone - Téléphone du client
 * @param {Object} paymentData.metadata - Métadonnées (loan_id, user_id, etc.)
 * @returns {Promise<Object>} Résultat du paiement
 */
export const initiateFedaPayPayment = async (paymentData) => {
  try {
    console.log('[FEDAPAY] Initialisation du paiement embarqué:', paymentData);

    // Validation des données
    if (!paymentData.amount || paymentData.amount <= 0) {
      throw new Error('Montant invalide');
    }

    if (!paymentData.customer_phone) {
      throw new Error('Numéro de téléphone requis');
    }

    // Préparer les données pour FedaPay
    const fedapayData = {
      amount: paymentData.amount, // Montant en centimes
      currency: paymentData.currency || FEDAPAY_CONFIG.currency,
      description: paymentData.description || 'Remboursement de prêt AB Pret',
      callback_url: `${window.location.origin}/payment-callback`,
      customer: {
        email: paymentData.customer_email || `user@abpret.com`,
        firstname: paymentData.customer_firstname || 'Client',
        lastname: paymentData.customer_lastname || 'AB Pret',
        phone_number: paymentData.customer_phone
      },
      metadata: {
        loan_id: paymentData.loan_id,
        user_id: paymentData.user_id,
        payment_type: 'loan_repayment',
        app_source: 'ab_pret_web'
      }
    };

    console.log('[FEDAPAY] Données envoyées à FedaPay:', fedapayData);

    // Appel à l'API FedaPay pour créer la transaction
    const response = await fetch(`${FEDAPAY_CONFIG.baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FEDAPAY_CONFIG.publicKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(fedapayData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[FEDAPAY] Erreur API FedaPay:', errorData);
      throw new Error(errorData.message || 'Erreur lors de l\'initialisation du paiement');
    }

    const result = await response.json();
    console.log('[FEDAPAY] Réponse FedaPay:', result);

    return {
      success: true,
      data: {
        transaction_id: result.id,
        payment_url: result.payment_url,
        status: result.status,
        amount: result.amount,
        currency: result.currency,
        fedapay_data: result,
        // Données pour l'intégration embarquée
        embed_url: result.embed_url || `${FEDAPAY_CONFIG.baseUrl}/embed/${result.id}`,
        public_key: FEDAPAY_CONFIG.publicKey
      }
    };

  } catch (error) {
    console.error('[FEDAPAY] Erreur lors de l\'initialisation du paiement:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de l\'initialisation du paiement'
    };
  }
};

/**
 * Vérifie le statut d'un paiement FedaPay
 * @param {string} transactionId - ID de la transaction FedaPay
 * @returns {Promise<Object>} Statut du paiement
 */
export const checkFedaPayPaymentStatus = async (transactionId) => {
  try {
    console.log('[FEDAPAY] Vérification du statut:', transactionId);

    const response = await fetch(`${FEDAPAY_CONFIG.baseUrl}/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FEDAPAY_CONFIG.secretKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la vérification du statut');
    }

    const result = await response.json();
    console.log('[FEDAPAY] Statut du paiement:', result);

    return {
      success: true,
      data: {
        transaction_id: result.id,
        status: result.status,
        amount: result.amount,
        currency: result.currency,
        paid_at: result.paid_at,
        fedapay_data: result
      }
    };

  } catch (error) {
    console.error('[FEDAPAY] Erreur lors de la vérification du statut:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la vérification du statut'
    };
  }
};

/**
 * Simule un paiement FedaPay (pour les tests)
 * @param {Object} paymentData - Données du paiement
 * @returns {Promise<Object>} Résultat simulé
 */
export const simulateFedaPayPayment = async (paymentData) => {
  try {
    console.log('[FEDAPAY] Simulation du paiement:', paymentData);

    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Générer un ID de transaction simulé
    const transactionId = `fedapay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Simuler un paiement réussi
    const result = {
      success: true,
      data: {
        transaction_id: transactionId,
        payment_url: `https://fedapay.com/pay/${transactionId}`,
        status: 'pending',
        amount: paymentData.amount,
        currency: paymentData.currency || FEDAPAY_CONFIG.currency,
        fedapay_data: {
          id: transactionId,
          status: 'pending',
          amount: paymentData.amount,
          currency: paymentData.currency || FEDAPAY_CONFIG.currency,
          description: paymentData.description,
          customer: paymentData.customer,
          metadata: paymentData.metadata
        }
      }
    };

    console.log('[FEDAPAY] Simulation réussie:', result);
    return result;

  } catch (error) {
    console.error('[FEDAPAY] Erreur lors de la simulation:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la simulation du paiement'
    };
  }
};

/**
 * Simule la vérification du statut d'un paiement (pour les tests)
 * @param {string} transactionId - ID de la transaction
 * @returns {Promise<Object>} Statut simulé
 */
export const simulateFedaPayStatusCheck = async (transactionId) => {
  try {
    console.log('[FEDAPAY] Simulation de vérification du statut:', transactionId);

    // Simuler un délai
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simuler un paiement réussi
    const result = {
      success: true,
      data: {
        transaction_id: transactionId,
        status: 'approved',
        amount: 50000, // 500 FCFA en centimes
        currency: FEDAPAY_CONFIG.currency,
        paid_at: new Date().toISOString(),
        fedapay_data: {
          id: transactionId,
          status: 'approved',
          amount: 50000,
          currency: FEDAPAY_CONFIG.currency,
          paid_at: new Date().toISOString()
        }
      }
    };

    console.log('[FEDAPAY] Statut simulé:', result);
    return result;

  } catch (error) {
    console.error('[FEDAPAY] Erreur lors de la simulation de vérification:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la vérification simulée'
    };
  }
};

// ===== UTILITAIRES =====

/**
 * Convertit un montant en FCFA vers les centimes
 * @param {number} amountFCFA - Montant en FCFA
 * @returns {number} Montant en centimes
 */
export const convertToCentimes = (amountFCFA) => {
  return Math.round(amountFCFA * 100);
};

/**
 * Convertit un montant en centimes vers les FCFA
 * @param {number} amountCentimes - Montant en centimes
 * @returns {number} Montant en FCFA
 */
export const convertFromCentimes = (amountCentimes) => {
  return amountCentimes / 100;
};

/**
 * Formate un montant pour l'affichage
 * @param {number} amount - Montant
 * @param {string} currency - Devise
 * @returns {string} Montant formaté
 */
export const formatAmount = (amount, currency = 'XOF') => {
  return new Intl.NumberFormat('fr-CI', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// ===== GESTION DES ERREURS =====

/**
 * Traite les erreurs FedaPay courantes
 * @param {string} errorCode - Code d'erreur
 * @returns {string} Message d'erreur traduit
 */
export const getFedaPayErrorMessage = (errorCode) => {
  const errorMessages = {
    'insufficient_funds': 'Fonds insuffisants sur votre compte',
    'invalid_phone': 'Numéro de téléphone invalide',
    'transaction_failed': 'Transaction échouée',
    'network_error': 'Erreur de réseau, veuillez réessayer',
    'timeout': 'Délai d\'attente dépassé',
    'invalid_amount': 'Montant invalide',
    'unauthorized': 'Accès non autorisé',
    'default': 'Une erreur est survenue lors du paiement'
  };

  return errorMessages[errorCode] || errorMessages.default;
};

export default {
  initiateFedaPayPayment,
  checkFedaPayPaymentStatus,
  simulateFedaPayPayment,
  simulateFedaPayStatusCheck,
  convertToCentimes,
  convertFromCentimes,
  formatAmount,
  getFedaPayErrorMessage
};
