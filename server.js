const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Load env from .env if present
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configuration FedaPay
if (process.env.FEDAPAY_SECRET_KEY) {
  const FedaPay = require('fedapay');
  FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY);
  FedaPay.setEnvironment(process.env.FEDAPAY_ENVIRONMENT || 'sandbox');
  console.log('[FEDAPAY] Configuration chargée:', {
    environment: process.env.FEDAPAY_ENVIRONMENT || 'sandbox',
    secretKey: process.env.FEDAPAY_SECRET_KEY ? `${process.env.FEDAPAY_SECRET_KEY.substring(0, 10)}...` : 'NON CONFIGURÉE'
  });
} else {
  console.log('[FEDAPAY] Mode simulation - FEDAPAY_SECRET_KEY non configurée');
}

// Mode SMS: 'live' (production) ou 'echo' (développement)
let SMS_MODE = process.env.SMS_MODE || 'echo'; // Utiliser la variable d'environnement ou echo par défaut

// Endpoint pour changer le mode SMS (uniquement en développement)
app.post('/api/admin/sms-mode', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, error: 'Mode production - changement non autorisé' });
  }
  
  const { mode } = req.body;
  if (mode === 'echo' || mode === 'live') {
    SMS_MODE = mode;
    console.log(`[ADMIN] Mode SMS changé vers: ${SMS_MODE}`);
    res.json({ success: true, mode: SMS_MODE });
  } else {
    res.status(400).json({ success: false, error: 'Mode invalide. Utilisez "echo" ou "live"' });
  }
});

// Endpoint pour obtenir le mode SMS actuel
app.get('/api/admin/sms-mode', (req, res) => {
  res.json({ success: true, mode: SMS_MODE, isProduction: process.env.NODE_ENV === 'production' });
});

// Instantiate Vonage on server side only
let vonageClient = null;
function getVonageClient() {
  if (!vonageClient) {
    const apiKey = process.env.REACT_APP_VONAGE_API_KEY || "5991994e";
    const apiSecret = process.env.REACT_APP_VONAGE_API_SECRET || "TXqA0XxEzJQWBtfI";
    if (!apiKey || !apiSecret) {
      throw new Error('Vonage credentials are missing');
    }
    const { Vonage } = require('@vonage/server-sdk');
    vonageClient = new Vonage({ apiKey, apiSecret });
  }
  return vonageClient;
}

// Utility: basic Benin phone formatting
function formatBenin(phone) {
  const clean = String(phone || '').replace(/[\s\-()]/g, '');
  if (clean.startsWith('+229') && clean.length === 12) return clean;
  if (clean.startsWith('229') && clean.length === 11) return `+${clean}`;
  if (clean.startsWith('0') && clean.length === 9) return `+229${clean.substring(1)}`;
  if (clean.length === 8) return `+229${clean}`;
  return null;
}

app.post('/api/sms/send-otp', async (req, res) => {
  try {
    const { phoneNumber, otp, userName } = req.body || {};
    const to = formatBenin(phoneNumber);
    if (!to) return res.status(400).json({ success: false, error: 'Format de numéro invalide' });

    // Echo mode: ne pas appeler Vonage, juste logger et renvoyer succès avec l'OTP
    if (SMS_MODE === 'echo') {
      console.log(`[SMS ECHO] OTP pour ${to}: ${otp} (user=${userName || 'Utilisateur'})`);
      return res.json({ success: true, echo: true, otp });
    }

    const brandName = process.env.REACT_APP_VONAGE_BRAND_NAME || "AB Campus Finance";
    const message = `CAMPUS FINANCE\n\nBonjour ${userName || 'Utilisateur'},\n\nVotre code de vérification est : ${otp}\n\nCe code est valide pendant 15 minutes.\n\nNe partagez jamais ce code.\n\nCampus Finance`;

    const client = getVonageClient();
    const result = await client.sms.send(brandName, to, message);
    
    if (result.messages[0].status === '0') {
      res.json({ success: true, message_id: result.messages[0]['message-id'] });
    } else {
      throw new Error(`SMS failed: ${result.messages[0]['error-text']}`);
    }
  } catch (err) {
    console.error('Erreur SMS OTP:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/sms/send-welcome', async (req, res) => {
  try {
    const { phoneNumber, userName } = req.body || {};
    const to = formatBenin(phoneNumber);
    if (!to) return res.status(400).json({ success: false, error: 'Format de numéro invalide' });

    if (SMS_MODE === 'echo') {
      console.log(`[SMS ECHO] Bienvenue pour ${to}: Bonjour ${userName || 'Utilisateur'}`);
      return res.json({ success: true, echo: true });
    }

    const brandName = process.env.REACT_APP_VONAGE_BRAND_NAME || "AB Campus Finance";
    const message = `CAMPUS FINANCE\n\nBonjour ${userName || 'Utilisateur'},\n\nVotre compte a été créé avec succès !\n\nBienvenue chez Campus Finance.`;

    const client = getVonageClient();
    const result = await client.sms.send(brandName, to, message);
    
    if (result.messages[0].status === '0') {
      res.json({ success: true, message_id: result.messages[0]['message-id'] });
    } else {
      throw new Error(`SMS failed: ${result.messages[0]['error-text']}`);
    }
  } catch (err) {
    console.error('Erreur SMS Welcome:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Nouveaux endpoints pour Vonage Verify
app.post('/api/sms/start-verification', async (req, res) => {
  try {
    const { phoneNumber } = req.body || {};
    const to = formatBenin(phoneNumber);
    if (!to) return res.status(400).json({ success: false, error: 'Format de numéro invalide' });

    if (SMS_MODE === 'echo') {
      const fakeRequestId = 'echo_' + Date.now();
      console.log(`[SMS ECHO] Démarrage vérification pour ${to}: ${fakeRequestId}`);
      return res.json({ success: true, echo: true, request_id: fakeRequestId });
    }

    const brandName = process.env.REACT_APP_VONAGE_BRAND_NAME || "AB Campus Finance";
    const client = getVonageClient();
    const result = await client.verify.start({
      number: to,
      brand: brandName
    });

    res.json({ success: true, request_id: result.request_id });
  } catch (err) {
    console.error('Erreur start verification:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/sms/check-verification', async (req, res) => {
  try {
    const { requestId, code } = req.body || {};
    if (!requestId || !code) {
      return res.status(400).json({ success: false, error: 'Request ID et code requis' });
    }

    if (SMS_MODE === 'echo') {
      console.log(`[SMS ECHO] Vérification code ${code} pour request_id: ${requestId}`);
      return res.json({ success: true, echo: true, status: '0' });
    }

    const client = getVonageClient();
    const result = await client.verify.check(requestId, code);

    res.json({ success: true, status: result.status });
  } catch (err) {
    console.error('Erreur check verification:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Diagnostic: expose only presence/format of envs (no secrets)
app.get('/api/debug/status', (req, res) => {
  res.json({
    success: true,
    hasApiKey: Boolean(process.env.REACT_APP_VONAGE_API_KEY),
    hasApiSecret: Boolean(process.env.REACT_APP_VONAGE_API_SECRET),
    hasBrandName: Boolean(process.env.REACT_APP_VONAGE_BRAND_NAME),
    smsMode: SMS_MODE
  });
});

// ===== FEDAPAY INTEGRATION =====

// Configuration FedaPay
const FEDAPAY_CONFIG = {
  secretKey: process.env.FEDAPAY_SECRET_KEY,
  baseUrl: process.env.FEDAPAY_BASE_URL || 'https://api.fedapay.com/v1',
  currency: process.env.FEDAPAY_CURRENCY || 'XOF',
  country: process.env.FEDAPAY_COUNTRY || 'BJ'
};

console.log('[FEDAPAY_SERVER] Configuration chargée:', {
  secretKey: FEDAPAY_CONFIG.secretKey ? `${FEDAPAY_CONFIG.secretKey.substring(0, 10)}...` : 'NON CONFIGURÉE',
  baseUrl: FEDAPAY_CONFIG.baseUrl,
  currency: FEDAPAY_CONFIG.currency,
  country: FEDAPAY_CONFIG.country
});

// Route pour créer une transaction FedaPay
app.post('/api/fedapay/create-transaction', async (req, res) => {
  try {
    const { amount, loanId, userId, description, customerEmail, customerName, customerPhone } = req.body;
    
    if (!amount || !loanId || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Montant, ID du prêt et ID utilisateur requis' 
      });
    }

    // Construire les URLs de callback
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const successUrl = `${baseUrl}/remboursement/success?transaction_id={transaction_id}&amount=${amount}&loan_id=${loanId}&user_id=${userId}`;
    const failureUrl = `${baseUrl}/remboursement/failure?transaction_id={transaction_id}&amount=${amount}&loan_id=${loanId}&user_id=${userId}`;
    const cancelUrl = `${baseUrl}/remboursement/cancel?transaction_id={transaction_id}&amount=${amount}&loan_id=${loanId}&user_id=${userId}`;

    // Préparer les données client
    const customer = {
      firstname: customerName?.split(' ')[0] || 'Client',
      lastname: customerName?.split(' ').slice(1).join(' ') || 'Campus Finance',
      email: customerEmail || 'client@example.com',
      phone: customerPhone || null
    };

    // Préparer les métadonnées
    const metadata = {
      loan_id: loanId,
      user_id: userId,
      type: 'loan_repayment',
      purpose: 'remboursement_pret',
      amount_cents: amount,
      amount_formatted: new Intl.NumberFormat('fr-CI', {
        style: 'currency',
        currency: 'XOF'
      }).format(amount / 100),
      created_at: new Date().toISOString(),
      platform: 'ab_campus_finance',
      version: '1.0.0'
    };

    console.log('[FEDAPAY_SERVER] Création transaction:', {
      amount,
      loanId,
      userId,
      description: description || `Remboursement prêt #${loanId}`,
      customer,
      metadata
    });

    // Mode développement : simulation FedaPay
    if (process.env.NODE_ENV === 'development' || !process.env.FEDAPAY_SECRET_KEY) {
      console.log('[FEDAPAY_SERVER] Mode développement - Simulation FedaPay');
      
      const mockTransaction = {
        id: `mock_${Date.now()}`,
        redirect_url: `https://fedapay.com/checkout/mock_${Date.now()}`,
        status: 'pending'
      };

      console.log('[FEDAPAY_SERVER] Transaction simulée créée:', mockTransaction);

      res.json({ 
        success: true,
        url: mockTransaction.redirect_url,
        transaction_id: mockTransaction.id,
        public_key: process.env.FEDAPAY_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      });
      return;
    }

    // Configuration FedaPay pour la production
    const FedaPay = require('fedapay');
    FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY);
    FedaPay.setEnvironment(process.env.FEDAPAY_ENVIRONMENT || 'sandbox');

    // Créer la transaction FedaPay
    const transaction = await FedaPay.Transaction.create({
      amount,
      description: description || `Remboursement prêt #${loanId}`,
      currency: { iso: "XOF" },
      customer: {
        firstname: customer.firstname,
        lastname: customer.lastname,
        email: customer.email,
        phone_number: customer.phone ? {
          number: customer.phone,
          country: "BJ"
        } : undefined
      },
      metadata,
      callback_url: `${baseUrl}/api/fedapay/webhook`,
      success_url: successUrl,
      failure_url: failureUrl,
      cancel_url: cancelUrl
    });

    console.log('[FEDAPAY_SERVER] Transaction FedaPay créée:', transaction.id);

    res.json({ 
      success: true,
      url: transaction.redirect_url,
      transaction_id: transaction.id,
      public_key: process.env.FEDAPAY_PUBLIC_KEY
    });

  } catch (error) {
    console.error('[FEDAPAY_SERVER] Erreur création transaction:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur de création de la transaction',
      details: error.message
    });
  }
});

// Webhook FedaPay pour recevoir les confirmations de paiement
app.post('/api/fedapay/webhook', async (req, res) => {
  try {
    const { transaction } = req.body;
    
    if (!transaction) {
      console.error('[FEDAPAY_WEBHOOK] Données de transaction manquantes');
      return res.status(400).json({ success: false, error: 'Données invalides' });
    }

    console.log('[FEDAPAY_WEBHOOK] Réception webhook:', {
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      metadata: transaction.metadata
    });

    const { loan_id, user_id, type } = transaction.metadata || {};
    
    if (!loan_id || !user_id) {
      console.error('[FEDAPAY_WEBHOOK] Métadonnées manquantes');
      return res.status(400).json({ success: false, error: 'Métadonnées manquantes' });
    }

    // Gérer les différents statuts de transaction
    switch (transaction.status) {
      case 'approved':
        console.log('[FEDAPAY_WEBHOOK] Transaction approuvée - Traitement du remboursement');
        
        // Traiter le remboursement avec Supabase
        const { processFedaPayLoanRepayment } = require('./src/utils/supabaseAPI');
        
        const result = await processFedaPayLoanRepayment({
          loan_id: parseInt(loan_id),
          user_id: parseInt(user_id),
          amount: transaction.amount,
          transaction_id: transaction.id,
          payment_method: transaction.payment_method,
          paid_at: transaction.paid_at || new Date().toISOString()
        });

        if (result.success) {
          console.log('[FEDAPAY_WEBHOOK] Remboursement traité avec succès');
          res.json({ success: true, message: 'Webhook traité avec succès' });
        } else {
          console.error('[FEDAPAY_WEBHOOK] Erreur traitement remboursement:', result.error);
          res.status(500).json({ success: false, error: result.error });
        }
        break;

      case 'failed':
        console.log('[FEDAPAY_WEBHOOK] Transaction échouée');
        
        // Enregistrer l'échec dans la base de données
        const { recordPaymentFailure } = require('./src/utils/supabaseAPI');
        
        const failureResult = await recordPaymentFailure({
          loan_id: parseInt(loan_id),
          user_id: parseInt(user_id),
          amount: transaction.amount,
          transaction_id: transaction.id,
          failure_reason: transaction.failure_reason || 'Paiement échoué',
          failed_at: new Date().toISOString()
        });

        if (failureResult.success) {
          console.log('[FEDAPAY_WEBHOOK] Échec de paiement enregistré');
          res.json({ success: true, message: 'Échec enregistré' });
        } else {
          console.error('[FEDAPAY_WEBHOOK] Erreur enregistrement échec:', failureResult.error);
          res.status(500).json({ success: false, error: failureResult.error });
        }
        break;

      case 'cancelled':
        console.log('[FEDAPAY_WEBHOOK] Transaction annulée');
        
        // Enregistrer l'annulation dans la base de données
        const { recordPaymentCancellation } = require('./src/utils/supabaseAPI');
        
        const cancelResult = await recordPaymentCancellation({
          loan_id: parseInt(loan_id),
          user_id: parseInt(user_id),
          amount: transaction.amount,
          transaction_id: transaction.id,
          cancelled_at: new Date().toISOString()
        });

        if (cancelResult.success) {
          console.log('[FEDAPAY_WEBHOOK] Annulation enregistrée');
          res.json({ success: true, message: 'Annulation enregistrée' });
        } else {
          console.error('[FEDAPAY_WEBHOOK] Erreur enregistrement annulation:', cancelResult.error);
          res.status(500).json({ success: false, error: cancelResult.error });
        }
        break;

      case 'pending':
        console.log('[FEDAPAY_WEBHOOK] Transaction en attente');
        res.json({ success: true, message: 'Transaction en attente' });
        break;

      default:
        console.log('[FEDAPAY_WEBHOOK] Statut inconnu:', transaction.status);
        res.json({ success: true, message: 'Statut non géré' });
    }

  } catch (error) {
    console.error('[FEDAPAY_WEBHOOK] Erreur traitement webhook:', error);
    res.status(500).json({ success: false, error: 'Erreur interne' });
  }
});

// Route pour vérifier le statut d'une transaction
app.get('/api/fedapay/transaction/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!FEDAPAY_CONFIG.secretKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'Configuration FedaPay manquante' 
      });
    }

    const response = await fetch(`${FEDAPAY_CONFIG.baseUrl}/transactions/${id}`, {
      headers: {
        'Authorization': `Bearer ${FEDAPAY_CONFIG.secretKey}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la vérification de la transaction' 
      });
    }

    res.json({
      success: true,
      transaction: result
    });

  } catch (error) {
    console.error('[FEDAPAY_SERVER] Erreur vérification transaction:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
  console.log(`SMS Mode: ${SMS_MODE}`);
  console.log(`Vonage configured: ${Boolean(process.env.REACT_APP_VONAGE_API_KEY && process.env.REACT_APP_VONAGE_API_SECRET)}`);
});
