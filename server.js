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
    let paymentType = transaction.metadata?.type || transaction.custom_metadata?.type || transaction.custom_metadata?.paymentType || transaction.custom_metadata?.payment_type;
    
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
        // Pattern pour prêt: "Remboursement prêt #UUID" (sans user ID)
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
    
    console.log('[FEDAPAY_WEBHOOK] 🔍 Metadata finale:', { loanId, userId, paymentType });
    
    // Traiter tous les webhooks FedaPay
    console.log(`[FEDAPAY_WEBHOOK] 📊 Traitement webhook: ${transaction.status}`);
    
    if (transaction.status === 'transferred' || transaction.status === 'approved') {
      if (paymentType === 'loan_repayment' && loanId && userId) {
        console.log(`[FEDAPAY_WEBHOOK] 🎯 Paiement confirmé pour le prêt #${loanId}`);
        
        try {
          // Traiter le remboursement avec Supabase directement
          const { supabase } = require('./src/utils/supabaseClient-server');
          
          if (!supabase) {
            throw new Error('Configuration Supabase manquante');
          }

          console.log('[FEDAPAY_WEBHOOK] 🔄 Traitement remboursement:', {
            loan_id: loanId,
            user_id: userId,
            amount: transaction.amount,
            transaction_id: transaction.id
          });

          // Vérifier le rôle Supabase
          const { data: { user: supabaseUser } } = await supabase.auth.getUser();
          console.log('[FEDAPAY_WEBHOOK] 🔑 Rôle Supabase:', supabaseUser?.role || 'anon');
          
          // Vérifier la configuration du client
          console.log('[FEDAPAY_WEBHOOK] 🔧 Configuration client:', {
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
            supabaseUrl: process.env.REACT_APP_SUPABASE_URL ? 'Configurée' : 'Manquante'
          });

          // 1. Créer l'enregistrement de paiement
          const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .insert([{
              loan_id: loanId,
              user_id: userId,
              amount: transaction.amount,
              method: 'mobile_money', // Valeur par défaut simple
              status: 'completed',
              transaction_id: transaction.id,
              payment_date: new Date().toISOString(),
              description: `Remboursement complet du prêt #${loanId}`,
              metadata: {
                fedapay_data: {
                  transaction_id: transaction.id,
                  amount: transaction.amount,
                  payment_date: new Date().toISOString(),
                  payment_method: transaction.payment_method
                },
                payment_type: 'loan_repayment',
                app_source: 'ab_pret_web'
              }
            }])
            .select()
            .single();

          if (paymentError) {
            console.error('[FEDAPAY_WEBHOOK] ❌ Erreur création paiement:', paymentError);
            throw paymentError;
          }

          console.log('[FEDAPAY_WEBHOOK] ✅ Paiement créé:', paymentData);

          // 2. Mettre à jour le statut du prêt
          console.log('[FEDAPAY_WEBHOOK] 🔄 Mise à jour prêt:', { loanId, newStatus: 'completed' });
          
          const { data: updatedLoan, error: loanError } = await supabase
            .from('loans')
            .update({
              status: 'completed',
              updated_at: new Date().toISOString()
            })
            .eq('id', loanId)
            .select()
            .single();

          if (loanError) {
            console.error('[FEDAPAY_WEBHOOK] ❌ Erreur mise à jour prêt:', loanError);
            throw loanError;
          }

          console.log('[FEDAPAY_WEBHOOK] ✅ Prêt mis à jour:', updatedLoan);

          console.log('[FEDAPAY_WEBHOOK] ✅ Prêt mis à jour - Statut: remboursé');

          // 3. Envoyer une notification SMS de confirmation (optionnel)
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('phone_number, first_name')
              .eq('id', userId)
              .single();

            if (userData?.phone_number) {
              const message = `CAMPUS FINANCE\n\nBonjour ${userData.first_name || 'Client'},\n\nVotre remboursement de ${new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF' }).format(transaction.amount / 100)} a été traité avec succès.\n\nMerci pour votre confiance !\n\nCampus Finance`;
              
              // Note: SMS service would be called here if needed
              console.log('[FEDAPAY_WEBHOOK] 📱 SMS de confirmation préparé pour:', userData.phone_number);
            }
          } catch (smsError) {
            console.warn('[FEDAPAY_WEBHOOK] ⚠️ Erreur préparation SMS:', smsError.message);
          }

          console.log('[FEDAPAY_WEBHOOK] ✅ Remboursement traité avec succès - Prêt mis à jour');
          
        } catch (error) {
          console.error('[FEDAPAY_WEBHOOK] ❌ Erreur lors du traitement du remboursement:', error);
        }
      } else if (paymentType === 'savings_plan_creation' && userId) {
        console.log(`[FEDAPAY_WEBHOOK] 🎯 Paiement confirmé pour création plan d'épargne - User: ${userId}`);
        
        try {
          const { supabase } = require('./src/utils/supabaseClient-server');
          
          // Extraire les paramètres du plan depuis custom_metadata
          const fixedAmount = parseInt(transaction.custom_metadata?.fixed_amount, 10) || 1000;
          const frequencyDays = parseInt(transaction.custom_metadata?.frequency_days, 10) || 10;
          const durationMonths = parseInt(transaction.custom_metadata?.duration_months, 10) || 3;
          
          // Calculs des champs obligatoires
          const totalDepositsRequired = Math.ceil((durationMonths * 30) / frequencyDays);
          const totalAmountTarget = fixedAmount * totalDepositsRequired;
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(startDate.getMonth() + durationMonths);
          
          console.log('[FEDAPAY_WEBHOOK] 📋 Paramètres du plan:', {
            userId,
            fixedAmount,
            frequencyDays,
            durationMonths,
            totalDepositsRequired,
            totalAmountTarget,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            transactionReference: transaction.reference
          });
          
          // Créer ou mettre à jour le compte d'épargne
          const { data: account, error: accErr } = await supabase
            .from('savings_accounts')
            .upsert({
              user_id: userId,
              balance: 0,
              account_creation_fee_paid: true,
              account_creation_fee_amount: 1000,
              is_active: true,
              interest_rate: 5,           // 👈 taux d'intérêt par mois
              total_interest_earned: 0
            }, {
              onConflict: 'user_id'
            })
            .select()
            .single();

          if (accErr) {
            console.error('[FEDAPAY_WEBHOOK] ❌ Erreur création compte épargne:', accErr);
            throw accErr;
          }

          console.log('[FEDAPAY_WEBHOOK] ✅ Compte épargne créé/mis à jour:', account);

          // Log des données avant insertion
          console.log('[FEDAPAY_WEBHOOK] 🔍 Données plan à insérer:', {
            userId,
            savings_account_id: account.id,
            fixedAmount,
            frequencyDays,
            durationMonths,
            totalDepositsRequired,
            totalAmountTarget,
            reference: transaction.reference
          });

          // Créer le plan d'épargne
          const { data: plan, error: planErr } = await supabase
            .from('savings_plans')
            .insert({
              user_id: userId,
              savings_account_id: account.id,
              plan_name: 'Plan Épargne',
              fixed_amount: fixedAmount,
              frequency_days: frequencyDays,
              duration_months: durationMonths,
              total_deposits_required: totalDepositsRequired,
              total_amount_target: totalAmountTarget,
              completed_deposits: 0,
              current_balance: 0,
              total_deposited: 0,
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              next_deposit_date: startDate.toISOString(),
              status: 'active',
              completion_percentage: 0,
              transaction_reference: transaction.reference,
              interest_rate: 5,          // 👈 taux d'intérêt par mois
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (planErr) {
            console.error('[FEDAPAY_WEBHOOK] ❌ Erreur création plan épargne:', planErr);
            console.error('[FEDAPAY_WEBHOOK] ❌ Détails erreur:', {
              message: planErr.message,
              details: planErr.details,
              hint: planErr.hint,
              code: planErr.code
            });
            throw planErr;
          }

          console.log('[FEDAPAY_WEBHOOK] 🎉 Plan d\'épargne créé avec succès:', {
            id: plan.id,
            transaction_reference: plan.transaction_reference,
            status: plan.status,
            total_amount_target: plan.total_amount_target
          });
          
        } catch (error) {
          console.error('[FEDAPAY_WEBHOOK] ❌ Erreur lors de la création du plan d\'épargne:', error);
        }
      } else if (paymentType === 'savings_deposit' && userId && transaction.custom_metadata?.plan_id) {
        console.log(`[FEDAPAY_WEBHOOK] 🎯 Dépôt confirmé pour plan d'épargne - User: ${userId}, Plan: ${transaction.custom_metadata.plan_id}`);
        
        try {
          const { supabase } = require('./src/utils/supabaseClient-server');
          const planId = transaction.custom_metadata.plan_id;
          const depositAmount = parseInt(transaction.amount, 10);
          
          // Récupérer le plan actuel
          const { data: currentPlan, error: planError } = await supabase
            .from('savings_plans')
            .select('*')
            .eq('id', planId)
            .eq('user_id', userId)
            .single();
            
          if (planError || !currentPlan) {
            console.error('[FEDAPAY_WEBHOOK] ❌ Plan non trouvé:', planError);
            throw new Error('Plan non trouvé');
          }
          
          // Calculer les nouvelles valeurs
          const newTotalDeposited = (currentPlan.total_deposited || 0) + depositAmount;
          const newCompletedDeposits = (currentPlan.completed_deposits || 0) + 1;
          const newCompletionPercentage = Math.round((newCompletedDeposits / currentPlan.total_deposits_required) * 100);
          const newCurrentBalance = (currentPlan.current_balance || 0) + depositAmount;
          
          // Calculer la prochaine date de dépôt
          // Si c'est le premier dépôt, calculer depuis la date de début
          // Sinon, calculer depuis la prochaine date prévue originale
          let nextDepositDate;
          if (newCompletedDeposits === 1) {
            // Premier dépôt : calculer depuis la date de début + fréquence
            nextDepositDate = new Date(currentPlan.start_date);
            nextDepositDate.setDate(nextDepositDate.getDate() + currentPlan.frequency_days);
          } else {
            // Dépôts suivants : calculer depuis la prochaine date prévue + fréquence
            const lastScheduledDate = new Date(currentPlan.next_deposit_date);
            nextDepositDate = new Date(lastScheduledDate);
            nextDepositDate.setDate(nextDepositDate.getDate() + currentPlan.frequency_days);
          }
          
          // Mettre à jour le plan
          const { data: updatedPlan, error: updateError } = await supabase
            .from('savings_plans')
            .update({
              total_deposited: newTotalDeposited,
              completed_deposits: newCompletedDeposits,
              completion_percentage: newCompletionPercentage,
              current_balance: newCurrentBalance,
              next_deposit_date: nextDepositDate.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', planId)
            .select()
            .single();
            
          if (updateError) {
            console.error('[FEDAPAY_WEBHOOK] ❌ Erreur mise à jour plan:', updateError);
            throw updateError;
          }
          
          // Mettre à jour le compte épargne
          const { error: accountError } = await supabase
            .from('savings_accounts')
            .update({
              balance: newCurrentBalance,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
            
          if (accountError) {
            console.error('[FEDAPAY_WEBHOOK] ❌ Erreur mise à jour compte:', accountError);
          }
          
          // Créer une entrée dans savings_transactions
          const { error: transactionError } = await supabase
            .from('savings_transactions')
            .insert({
              user_id: userId,
              savings_plan_id: planId,
              transaction_type: 'deposit',
              amount: depositAmount,
              transaction_reference: transaction.reference,
              status: 'completed',
              created_at: new Date().toISOString()
            });
            
          if (transactionError) {
            console.error('[FEDAPAY_WEBHOOK] ❌ Erreur création transaction:', transactionError);
          }
          
          console.log('[FEDAPAY_WEBHOOK] 🎉 Dépôt traité avec succès:', {
            planId,
            depositAmount,
            newTotalDeposits,
            newCompletedDeposits,
            newCompletionPercentage,
            newCurrentBalance,
            nextDepositDate: nextDepositDate.toISOString(),
            isFirstDeposit: newCompletedDeposits === 1
          });
          
        } catch (error) {
          console.error('[FEDAPAY_WEBHOOK] ❌ Erreur lors du traitement du dépôt:', error);
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

// Endpoint pour créer une transaction de dépôt
app.post('/api/create-savings-deposit', async (req, res) => {
  try {
    const { user_id, plan_id, amount } = req.body;
    
    if (!user_id || !plan_id || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'user_id, plan_id et amount requis' 
      });
    }

    console.log('[SAVINGS_DEPOSIT] 🔑 Clé secrète FedaPay:', process.env.FEDAPAY_SECRET_KEY ? 'Configurée' : 'MANQUANTE');
    console.log('[SAVINGS_DEPOSIT] 🚀 Création transaction dépôt:', { user_id, plan_id, amount });

    // Appel à FedaPay API
    const response = await fetch("https://sandbox-api.fedapay.com/v1/transactions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: `Dépôt plan épargne - ${amount} F`,
        amount: parseInt(amount),
        currency: { iso: "XOF" },
        callback_url: "http://localhost:3000/ab-epargne/depot-retour",
        custom_metadata: {
          paymentType: "savings_deposit",
          user_id: user_id,
          plan_id: plan_id,
          amount: amount
        },
      }),
    });

    const data = await response.json();
    console.log("[SAVINGS_DEPOSIT] Réponse FedaPay:", data);

    if (data && data['v1/transaction'] && data['v1/transaction'].payment_url) {
      return res.json({ success: true, transactionUrl: data['v1/transaction'].payment_url });
    }
    
    res.status(500).json({ success: false, error: data });
  } catch (err) {
    console.error("[SAVINGS_DEPOSIT] ❌ Erreur création transaction:", err);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// Endpoint pour créer une transaction de remboursement
app.post('/api/create-loan-repayment', async (req, res) => {
  try {
    console.log('[LOAN_REPAYMENT] 📥 Body reçu:', req.body);
    const { user_id, loan_id, amount } = req.body;
    
    if (!user_id || !loan_id || !amount) {
      console.error('[LOAN_REPAYMENT] ❌ Paramètres manquants:', { user_id, loan_id, amount });
      return res.status(400).json({ 
        success: false, 
        error: 'user_id, loan_id et amount requis' 
      });
    }

    console.log('[LOAN_REPAYMENT] 🔑 Clé secrète FedaPay:', process.env.FEDAPAY_SECRET_KEY ? 'Configurée' : 'MANQUANTE');
    console.log('[LOAN_REPAYMENT] 🚀 Création transaction remboursement:', { user_id, loan_id, amount });
    
    if (!process.env.FEDAPAY_SECRET_KEY) {
      console.error('[LOAN_REPAYMENT] ❌ FEDAPAY_SECRET_KEY manquante !');
      return res.status(500).json({ 
        success: false, 
        error: 'Configuration FedaPay manquante' 
      });
    }

    // Appel à FedaPay API
    const response = await fetch("https://sandbox-api.fedapay.com/v1/transactions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: `Remboursement prêt - ${amount} F`,
        amount: parseInt(amount),
        currency: { iso: "XOF" },
        callback_url: "http://localhost:3000/remboursement-retour",
        custom_metadata: {
          paymentType: "loan_repayment",
          user_id: user_id,
          loan_id: loan_id,
          amount: amount
        },
      }),
    });

    const data = await response.json();
    console.log("[LOAN_REPAYMENT] Réponse FedaPay:", data);

    if (data && data['v1/transaction'] && data['v1/transaction'].payment_url) {
      return res.json({ success: true, transactionUrl: data['v1/transaction'].payment_url });
    }
    
    res.status(500).json({ success: false, error: data });
  } catch (err) {
    console.error("[LOAN_REPAYMENT] ❌ Erreur création transaction:", err);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// Endpoint pour vérifier le statut d'un remboursement
app.get('/api/loans/repayment-status', async (req, res) => {
  try {
    const { reference, id, txId } = req.query;
    const transactionId = reference || id || txId;
    
    if (!transactionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'ID de transaction manquant' 
      });
    }

    console.log('[LOAN_REPAYMENT_STATUS] 🔍 Vérification transaction:', transactionId);

    const { supabase } = require('./src/utils/supabaseClient-server');
    
    // Chercher le paiement dans la table payments
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('loan_id, user_id, amount, status')
      .eq('transaction_id', transactionId)
      .maybeSingle();

    if (paymentError) {
      console.error('[LOAN_REPAYMENT_STATUS] ❌ Erreur récupération paiement:', paymentError);
      return res.status(500).json({ success: false, error: 'Erreur base de données' });
    }

    if (!payment) {
      console.log('[LOAN_REPAYMENT_STATUS] ⏳ Paiement pas encore traité');
      return res.status(404).json({ success: false, error: 'Paiement non trouvé' });
    }

    // Récupérer les détails du prêt
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('id, status, amount')
      .eq('id', payment.loan_id)
      .single();

    if (loanError) {
      console.error('[LOAN_REPAYMENT_STATUS] ❌ Erreur récupération prêt:', loanError);
      return res.status(500).json({ success: false, error: 'Erreur base de données' });
    }

    console.log('[LOAN_REPAYMENT_STATUS] ✅ Remboursement trouvé:', { payment, loan });
    
    return res.json({ 
      success: true, 
      loan: {
        id: loan.id,
        status: loan.status,
        amount: loan.amount
      },
      payment: {
        amount: payment.amount,
        status: payment.status
      }
    });

  } catch (error) {
    console.error('[LOAN_REPAYMENT_STATUS] ❌ Erreur:', error);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Endpoint pour vérifier le statut d'un dépôt
app.get('/api/savings/deposit-status', async (req, res) => {
  try {
    const { reference, id, txId } = req.query;
    const transactionId = reference || id || txId;
    
    if (!transactionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'ID de transaction manquant' 
      });
    }

    console.log('[SAVINGS_DEPOSIT_STATUS] 🔍 Vérification dépôt:', transactionId);

    const { supabase } = require('./src/utils/supabaseClient-server');
    
    // Chercher directement dans savings_plans avec la transaction_reference
    const { data: plan, error: planError } = await supabase
      .from('savings_plans')
      .select(`
        id, 
        status, 
        plan_name, 
        fixed_amount, 
        frequency_days,
        duration_months,
        total_amount_target, 
        completion_percentage, 
        transaction_reference,
        start_date,
        end_date,
        next_deposit_date,
        completed_deposits,
        current_balance,
        total_deposited,
        interest_rate,
        created_at,
        updated_at
      `)
      .eq('transaction_reference', transactionId)
      .maybeSingle();

    if (planError) {
      console.error('[SAVINGS_DEPOSIT_STATUS] ❌ Erreur récupération plan:', planError);
      return res.status(500).json({ success: false, error: 'Erreur base de données' });
    }

    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan non trouvé' });
    }

    console.log('[SAVINGS_DEPOSIT_STATUS] ✅ Plan trouvé:', plan);
    return res.json({ success: true, plan });
  } catch (error) {
    console.error('[SAVINGS_DEPOSIT_STATUS] ❌ Erreur:', error);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Route pour vérifier le statut d'un plan d'épargne
app.get('/api/savings/plan-status', async (req, res) => {
  try {
    const reference = req.query.reference || req.query.id;
    const userId = req.query.userId;
    const planId = req.query.planId;

    if (!reference && !userId && !planId) {
      return res.status(400).json({ success: false, error: 'reference, userId ou planId manquant' });
    }

    const { supabase } = require('./src/utils/supabaseClient-server');
    
    let query = supabase
      .from('savings_plans')
      .select(`
        id, 
        status, 
        plan_name, 
        fixed_amount, 
        frequency_days,
        duration_months,
        total_amount_target, 
        completion_percentage, 
        transaction_reference,
        start_date,
        end_date,
        next_deposit_date,
        completed_deposits,
        current_balance,
        total_deposited,
        interest_rate,
        created_at,
        updated_at
      `);
    
    if (planId) {
      // Chercher directement par ID du plan
      query = query.eq('id', planId);
    } else if (userId) {
      // Chercher le dernier plan créé pour cet utilisateur (tous les statuts)
      query = query.eq('user_id', userId).order('created_at', { ascending: false }).limit(1);
    } else {
      // Chercher par transaction_reference
      query = query.eq('transaction_reference', reference);
    }
    
    const { data: plan, error } = await query.maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, error: 'Erreur DB' });
    }

    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan non trouvé' });
    }

    return res.json({ success: true, plan });
    
  } catch (error) {
    console.error('[SAVINGS_API] ❌ Erreur:', error);
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