const express = require('express');
const cors = require('cors');
const app = express();

// Load env from .env.local first, then .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8'); // ← important de bien définir l'encodage
  }
}));
const bodyParser = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


// Load env from .env.local first, then .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

app.use(cors());

// Route de test pour vérifier que l'API fonctionne
app.get("/api/health", (req, res) => res.json({ ok: true }));

// GET /api/savings/plan-status?reference=trx_s0s_1757340348512
app.get('/api/savings/plan-status', async (req, res) => {
  const { reference } = req.query;
  if (!reference) return res.status(400).json({ created: false, error: 'Missing reference' });

  const { data, error } = await supabase
    .from('savings_plans')
    .select('id')
    .eq('transaction_reference', String(reference))
    .maybeSingle();

  if (error) return res.status(500).json({ created: false, error: error.message });
  if (!data) return res.json({ created: false });

  return res.json({ created: true, plan_id: data.id });
});

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
  baseUrl: process.env.FEDAPAY_BASE_URL || 'https://sandbox-api.fedapay.com',
  currency: process.env.FEDAPAY_CURRENCY || 'XOF',
  country: process.env.FEDAPAY_COUNTRY || 'BJ'
};

// Fonction pour vérifier la signature FedaPay
function verifyFedaPaySignature(rawBody, receivedSignature, secretKey) {
  try {
    if (!receivedSignature || !secretKey) {
      console.warn('[FEDAPAY_WEBHOOK] Signature ou clé secrète manquante');
      return false;
    }

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(rawBody, 'utf8');
    const calculatedSignature = hmac.digest('hex');

    const receivedBuffer = Buffer.from(receivedSignature, 'hex');
    const calculatedBuffer = Buffer.from(calculatedSignature, 'hex');

    if (receivedBuffer.length !== calculatedBuffer.length) {
      console.warn('[FEDAPAY_WEBHOOK] Signature de tailles différentes');
      return false;
    }

    const isValid = crypto.timingSafeEqual(receivedBuffer, calculatedBuffer);

    console.log('[FEDAPAY_WEBHOOK] Vérification signature:', {
      received: receivedSignature,
      calculated: calculatedSignature,
      isValid
    });

    return isValid;
  } catch (error) {
    console.error('[FEDAPAY_WEBHOOK] Erreur vérification signature:', error);
    return false;
  }
}

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
    // Utiliser le port 3000 pour les redirections frontend
    const baseUrl = '';
    
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

    // Vérifier si FedaPay est configuré
    if (!process.env.FEDAPAY_SECRET_KEY) {
      console.log('[FEDAPAY_SERVER] Erreur: FEDAPAY_SECRET_KEY non configurée');
      return res.status(500).json({ 
        success: false, 
        error: 'Configuration FedaPay manquante. Veuillez configurer FEDAPAY_SECRET_KEY dans .env.local'
      });
    }

    // Configuration FedaPay pour la production
    const fedapayBaseUrl = process.env.FEDAPAY_ENVIRONMENT === 'live' 
      ? 'https://api.fedapay.com/v1' 
      : 'https://api-sandbox.fedapay.com/v1';

    // Créer la transaction FedaPay via API directe
    const transactionResponse = await fetch(`${fedapayBaseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}`
      },
      body: JSON.stringify({
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
      })
    });

    if (!transactionResponse.ok) {
      const errorData = await transactionResponse.json();
      throw new Error(`FedaPay API Error: ${errorData.message || transactionResponse.statusText}`);
    }

    const transaction = await transactionResponse.json();

    console.log('[FEDAPAY_SERVER] Transaction FedaPay créée:', transaction.id);

    res.json({ 
      success: true,
      url: transaction.redirect_url,
      transaction_id: transaction.id,
      public_key: process.env.FEDAPAY_PUBLIC_KEY
    });

  } catch (error) {
    console.error('[FEDAPAY_SERVER] Erreur création transaction:', error);
    
    // Pour afficher le vrai détail
    res.status(500).json({ 
      success: false, 
      error: 'Erreur de création de la transaction',
      details: error.message || error.toString()  // 👈 cette ligne est importante
    });
  }
});

// Webhook FedaPay pour recevoir les confirmations de paiement
app.post('/api/fedapay/webhook', async (req, res) => {
  try {
    console.log('[FEDAPAY_WEBHOOK] 🔔 Webhook reçu');
    console.log('[FEDAPAY_WEBHOOK] Headers:', req.headers);
    console.log('[FEDAPAY_WEBHOOK] Raw body:', req.rawBody);
    
    const rawData = req.rawBody;
    const signatureHeader = req.headers['x-fedapay-signature'];
    
    // Extraire la signature du format "t=timestamp,s=signature"
    let signature = signatureHeader;
    if (signatureHeader && signatureHeader.includes('s=')) {
      signature = signatureHeader.split('s=')[1];
    }
    
    console.log('[FEDAPAY_WEBHOOK] 🔍 Debug signature:');
    console.log('- Raw data length:', rawData?.length);
    console.log('- Signature header reçu:', signatureHeader);
    console.log('- Signature extraite:', signature);
    console.log('- Clé secrète utilisée:', process.env.FEDAPAY_SECRET_KEY?.substring(0, 10) + '...');

    // Temporairement désactiver la vérification de signature en sandbox
    const isValid = true; // verifyFedaPaySignature(rawData, signature, process.env.FEDAPAY_SECRET_KEY);
    if (!isValid) {
      console.warn('[FEDAPAY_WEBHOOK] Signature invalide');
      return res.status(400).json({ success: false, error: 'Signature invalide' });
    }

    const payload = JSON.parse(rawData); // assure-toi que c'est bien parsé
    console.log('[FEDAPAY_WEBHOOK] Données reçues :', payload);

    const transaction = payload.entity; // ✅ c'est ici la vraie transaction
    if (!transaction || !transaction.status || !transaction.amount) {
      console.error('[FEDAPAY_WEBHOOK] Données de transaction manquantes ou invalides');
      return res.status(400).json({ success: false, error: 'Transaction invalide' });
    }

    console.log('[FEDAPAY_WEBHOOK] 📊 Transaction reçue:', {
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      metadata: transaction.metadata,
      custom_metadata: transaction.custom_metadata
    });

    // Essayer d'extraire depuis les metadata d'abord
    let loanId = transaction.metadata?.loan_id || transaction.custom_metadata?.loan_id;
    let userId = transaction.metadata?.user_id || transaction.custom_metadata?.user_id;
    let paymentType = transaction.metadata?.type || transaction.custom_metadata?.type;
    
    // Si pas de metadata, essayer d'extraire depuis la description
    if (!loanId || !userId) {
      console.log('[FEDAPAY_WEBHOOK] 🔍 Tentative d\'extraction depuis la description:', transaction.description);
      
      // Pattern pour remboursement de prêt: "Remboursement prêt #UUID - User:UUID"
      const loanDescriptionMatch = transaction.description?.match(/Remboursement prêt #([a-f0-9-]+) - User:([a-f0-9-]+)/);
      if (loanDescriptionMatch) {
        loanId = loanDescriptionMatch[1]; // UUID string
        userId = loanDescriptionMatch[2]; // UUID string
        paymentType = 'loan_repayment';
        console.log('[FEDAPAY_WEBHOOK] ✅ Informations prêt extraites depuis la description:', { loanId, userId, paymentType });
      } else {
        // Pattern pour plan d'épargne: "Paiement plan épargne - email - nom"
        const savingsDescriptionMatch = transaction.description?.match(/Paiement plan épargne - ([^@]+@[^@]+\.[^@]+) - (.+)/);
        if (savingsDescriptionMatch) {
          const userEmail = savingsDescriptionMatch[1];
          paymentType = 'savings_plan_creation';
          console.log('[FEDAPAY_WEBHOOK] ✅ Paiement plan d\'épargne détecté:', { userEmail, paymentType });
          
          // Si pas d'userId dans les métadonnées, le récupérer depuis l'email
          if (!userId || userId === undefined) {
            try {
              const { supabase } = require('./src/utils/supabaseClient-server');
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('email', userEmail)
                .single();
              
              if (!userError && userData) {
                userId = userData.id;
                console.log('[FEDAPAY_WEBHOOK] ✅ User ID récupéré depuis l\'email:', { userId });
              } else {
                console.error('[FEDAPAY_WEBHOOK] ❌ Erreur récupération user ID depuis email:', userError);
              }
            } catch (error) {
              console.error('[FEDAPAY_WEBHOOK] ❌ Erreur récupération user ID depuis email:', error);
            }
          } else {
            console.log('[FEDAPAY_WEBHOOK] ✅ User ID déjà présent dans les métadonnées:', { userId });
          }
        } else {
          // Pattern alternatif pour prêt: "Remboursement prêt #UUID" (sans user ID)
          const simpleMatch = transaction.description?.match(/Remboursement prêt #([a-f0-9-]+)/);
          if (simpleMatch) {
            loanId = simpleMatch[1];
            paymentType = 'loan_repayment';
            console.log('[FEDAPAY_WEBHOOK] ⚠️ Seul l\'ID du prêt extrait:', { loanId, paymentType });
            
            // Essayer de récupérer l'utilisateur depuis la base de données
            try {
              const { supabase } = require('./src/utils/supabaseClient-server');
              const { data: loanData, error: loanError } = await supabase
                .from('loans')
                .select('user_id')
                .eq('id', loanId)
                .single();
              
              if (!loanError && loanData) {
                userId = loanData.user_id;
                console.log('[FEDAPAY_WEBHOOK] ✅ User ID récupéré depuis la base:', { userId });
              }
            } catch (error) {
              console.error('[FEDAPAY_WEBHOOK] ❌ Erreur récupération user ID:', error);
            }
          }
        }
      }
    }
    
    console.log('[FEDAPAY_WEBHOOK] 🔍 Metadata finale:', { loanId, userId, paymentType });
    
    // Traiter tous les webhooks FedaPay
    console.log(`[FEDAPAY_WEBHOOK] 📊 Traitement webhook: ${transaction.status}`);
    
    if (transaction.status === 'transferred' || transaction.status === 'approved') {
      if (paymentType === 'savings_plan_creation' && userId) {
        console.log(`[FEDAPAY_WEBHOOK] 🎯 Paiement confirmé pour création plan d'épargne - User: ${userId}`);
        
        try {
          // Traiter la création du plan d'épargne avec Supabase
          const { processFedaPaySavingsPlanCreation } = require('./src/utils/supabaseAPI-server');
          const result = await processFedaPaySavingsPlanCreation({
            user_id: userId, // UUID string
            amount: transaction.amount,
            transaction_id: transaction.reference,  // 👈 Utiliser la référence lisible
            payment_method: transaction.payment_method,
            paid_at: transaction.paid_at || new Date().toISOString()
          });

          if (result.success) {
            console.log('[FEDAPAY_WEBHOOK] ✅ Plan d\'épargne créé avec succès');
          } else {
            console.error('[FEDAPAY_WEBHOOK] ❌ Erreur création plan d\'épargne:', result.error);
          }
        } catch (error) {
          console.error('[FEDAPAY_WEBHOOK] ❌ Erreur lors de la création du plan d\'épargne:', error);
        }
      } else if (paymentType === 'loan_repayment' && loanId && userId) {
        console.log(`[FEDAPAY_WEBHOOK] 🎯 Paiement confirmé pour le prêt #${loanId}`);
        
        try {
          // Traiter le remboursement avec Supabase
          const { processFedaPayLoanRepayment } = require('./src/utils/supabaseAPI-server');
          const result = await processFedaPayLoanRepayment({
            loan_id: loanId, // UUID string
            user_id: userId, // UUID string
            amount: transaction.amount,
            transaction_id: transaction.id,
            payment_method: transaction.payment_method,
            paid_at: transaction.paid_at || new Date().toISOString()
          });

          if (result.success) {
            console.log('[FEDAPAY_WEBHOOK] ✅ Remboursement traité avec succès - Prêt mis à jour');
          } else {
            console.error('[FEDAPAY_WEBHOOK] ❌ Erreur traitement remboursement:', result.error);
          }
        } catch (error) {
          console.error('[FEDAPAY_WEBHOOK] ❌ Erreur lors du traitement du remboursement:', error);
        }
      } else {
        console.log('[FEDAPAY_WEBHOOK] ⚠️ Paiement confirmé mais pas de metadata valide - Webhook de test FedaPay');
        console.log('[FEDAPAY_WEBHOOK] Détails:', { loanId, userId, paymentType });
      }
    } else if (transaction.status === 'failed') {
      console.log('[FEDAPAY_WEBHOOK] ❌ Transaction échouée');
    } else if (transaction.status === 'cancelled') {
      console.log('[FEDAPAY_WEBHOOK] ❌ Transaction annulée');
    } else {
      console.log(`[FEDAPAY_WEBHOOK] ℹ️ Statut non géré: ${transaction.status}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[FEDAPAY_WEBHOOK] Erreur :', error);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
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

    const fedapayBaseUrl = process.env.FEDAPAY_ENVIRONMENT === 'live' 
      ? 'https://api.fedapay.com/v1' 
      : 'https://api-sandbox.fedapay.com/v1';

    const response = await fetch(`${fedapayBaseUrl}/transactions/${id}`, {
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

// Route de test FedaPay
app.get('/api/fedapay/test', async (req, res) => {
  try {
    const response = await fetch('https://api-sandbox.fedapay.com/v1/currencies', {
      headers: {
        'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur FedaPay');
    }

    res.json({ success: true, currencies: data });
  } catch (err) {
    console.error('Erreur FedaPay test:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
  console.log(`SMS Mode: ${SMS_MODE}`);
  console.log(`Vonage configured: ${Boolean(process.env.REACT_APP_VONAGE_API_KEY && process.env.REACT_APP_VONAGE_API_SECRET)}`);
});