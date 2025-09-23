const express = require('express');
const cors = require('cors');
const app = express();

// Load env from .env.local first, then .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Configuration des URLs selon l'environnement
const getFrontendUrl = () => {
  // En production, utiliser l'URL de production
  if (process.env.NODE_ENV === 'production') {
    return process.env.FRONTEND_URL || 'https://ab-cf1.vercel.app';
  }
  // En développement, utiliser localhost:3001
  return process.env.FRONTEND_URL || 'http://localhost:3001';
};

console.log('[CONFIG] Frontend URL:', getFrontendUrl());

// Import web-push configuration AFTER loading env variables
const webPush = require('./config/push');

// Import Supabase client
const { supabase } = require('./utils/supabaseClient-server');
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

// ===== WEB PUSH NOTIFICATIONS =====

// Route pour s'abonner aux notifications push
app.post("/api/save-subscription", async (req, res) => {
  try {
    const { subscription, userId } = req.body;

    if (!subscription) {
      return res.status(400).json({ success: false, error: "Subscription manquante" });
    }

    if (!userId) {
      return res.status(400).json({ success: false, error: "userId manquant" });
    }

    console.log('[SAVE_SUBSCRIPTION] Sauvegarde de l\'abonnement pour l\'utilisateur:', userId);
    
    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      console.error('[SAVE_SUBSCRIPTION] Utilisateur non trouvé:', userError);
      return res.status(404).json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      });
    }
    
    // Supprimer tous les anciens abonnements de cet utilisateur
    const { error: deleteError } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error('[SAVE_SUBSCRIPTION] Erreur suppression anciens abonnements:', deleteError);
    } else {
      console.log('[SAVE_SUBSCRIPTION] Anciens abonnements supprimés pour', user.first_name, user.last_name);
    }
    
    // Créer le nouvel abonnement
    const { error: insertError } = await supabase
      .from('push_subscriptions')
      .insert({
        user_id: userId,
        subscription: subscription,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('[SAVE_SUBSCRIPTION] Erreur insertion:', insertError);
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la sauvegarde de l\'abonnement' 
      });
    }
    
    console.log('[SAVE_SUBSCRIPTION] ✅ Nouvel abonnement créé pour', user.first_name, user.last_name);
    
    res.json({ 
      success: true, 
      message: 'Abonnement sauvegardé avec succès' 
    });
    
  } catch (err) {
    console.error("[SAVE_SUBSCRIPTION] Erreur lors de la sauvegarde:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fonction utilitaire pour envoyer une notification à tous les utilisateurs abonnés
async function sendNotificationToAllUsers(title, body, data = {}) {
  try {
    // Récupérer tous les abonnements
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('subscription, user_id');

    if (error) {
      console.error('[PUSH] Erreur lors de la récupération des abonnements:', error);
      return false;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('[PUSH] Aucun utilisateur abonné');
      return false;
    }

    const payload = JSON.stringify({
      title,
      body,
      data: {
        ...data,
        url: '/', // Ouvrir l'app au clic
        icon: '/logo192.png',
        badge: '/logo192.png'
      }
    });

    let successCount = 0;
    let errorCount = 0;

    // Envoyer à tous les abonnements
    for (let sub of subscriptions) {
      try {
        await webPush.sendNotification(sub.subscription, payload);
        successCount++;
        console.log(`[PUSH] Notification envoyée à l'utilisateur ${sub.user_id}`);
      } catch (err) {
        errorCount++;
        console.error(`[PUSH] Erreur envoi à l'utilisateur ${sub.user_id}:`, err);
      }
    }

    console.log(`[PUSH] Notifications envoyées: ${successCount} succès, ${errorCount} erreurs`);
    return successCount > 0;
  } catch (error) {
    console.error('[PUSH] Erreur lors de l\'envoi des notifications:', error);
    return false;
  }
}

// Route pour envoyer une notification push à un utilisateur spécifique
app.post('/api/send-notification', async (req, res) => {
  try {
    const { title, body, userId } = req.body;

    // Récupérer l'abonnement du user depuis la DB
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId);

    for (let sub of subscriptions) {
      await webPush.sendNotification(sub.subscription, JSON.stringify({
        title,
        body,
        data: {
          url: '/',
          icon: '/logo192.png',
          badge: '/logo192.png'
        }
      })).catch(err => console.error('[PUSH] Erreur envoi:', err));
    }

    console.log('[PUSH] Notification envoyée:', { userId, title, subscriptionsCount: subscriptions.length });
    
    res.json({ success: true });
  } catch (error) {
    console.error('[PUSH] Erreur lors de l\'envoi de la notification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de l\'envoi' 
    });
  }
});

// Route pour envoyer une notification à tous les utilisateurs abonnés
app.post('/api/send-notification-all', async (req, res) => {
  try {
    const { title, body, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title et body requis' 
      });
    }

    const success = await sendNotificationToAllUsers(title, body, data);
    
    if (success) {
      res.json({ success: true, message: 'Notifications envoyées à tous les utilisateurs abonnés' });
    } else {
      res.status(500).json({ success: false, error: 'Aucune notification envoyée' });
    }
  } catch (error) {
    console.error('[PUSH] Erreur lors de l\'envoi des notifications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de l\'envoi' 
    });
  }
});

// Route pour envoyer une notification de dépôt d'épargne
app.post('/api/notify-savings-deposit', async (req, res) => {
  try {
    const { clientName, amount, userId } = req.body;

    if (!clientName || !amount || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'clientName, amount et userId requis' 
      });
    }

    const title = "AB Campus Finance - Dépôt d'épargne confirmé";
    const body = `Bonjour ${clientName}, votre compte épargne a été crédité de ${amount}. Keep Going !`;

    // Récupérer les abonnements de l'utilisateur spécifique
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId);

    if (error) {
      console.error('[PUSH] Erreur lors de la récupération des abonnements:', error);
      return res.status(500).json({ success: false, error: 'Erreur base de données' });
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`[PUSH] Aucun abonnement trouvé pour l'utilisateur ${userId}`);
      return res.json({ success: true, message: 'Utilisateur non abonné aux notifications' });
    }

    let successCount = 0;
    let errorCount = 0;

    // Envoyer la notification à tous les appareils de l'utilisateur
    for (let sub of subscriptions) {
      try {
        await webPush.sendNotification(sub.subscription, JSON.stringify({
          title,
          body,
          data: {
            url: '/',
            icon: '/logo192.png',
            badge: '/logo192.png',
            type: 'savings_deposit',
            amount: amount,
            clientName: clientName
          },
          vibrate: [200, 50, 100]
        }));
        successCount++;
        console.log(`[PUSH] Notification de dépôt envoyée à l'utilisateur ${userId}`);
      } catch (err) {
        errorCount++;
        console.error(`[PUSH] Erreur envoi à l'utilisateur ${userId}:`, err);
      }
    }

    if (successCount > 0) {
      res.json({ 
        success: true, 
        message: `Notification envoyée à ${successCount} appareil(s) de l'utilisateur`,
        sent: successCount,
        errors: errorCount
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Aucune notification envoyée',
        errors: errorCount
      });
    }
  } catch (error) {
    console.error('[PUSH] Erreur lors de l\'envoi de la notification de dépôt:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de l\'envoi' 
    });
  }
});

// Route pour obtenir la clé publique VAPID
app.get('/api/push/vapid-public-key', (req, res) => {
  res.json({ 
    publicKey: process.env.VAPID_PUBLIC_KEY || 'your_vapid_public_key_here'
  });
});

// Route pour tester la validité d'un abonnement
app.post('/api/test-subscription', async (req, res) => {
  try {
    const { subscription, userId } = req.body;
    
    if (!subscription || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'subscription et userId sont requis' 
      });
    }
    
    console.log('[TEST_SUBSCRIPTION] Test de l\'abonnement pour l\'utilisateur:', userId);
    
    // Envoyer une notification de test silencieuse
    try {
      await webPush.sendNotification(subscription, JSON.stringify({
        title: 'Test de validité',
        body: 'Votre abonnement aux notifications est valide',
        data: {
          url: '/',
          icon: '/logo192.png',
          badge: '/logo192.png',
          type: 'subscription_test',
          silent: true // Notification silencieuse pour le test
        },
        vibrate: [200, 50, 100]
      }));
      
      console.log('[TEST_SUBSCRIPTION] ✅ Abonnement valide');
      res.json({ 
        success: true, 
        message: 'Abonnement valide' 
      });
    } catch (pushError) {
      console.log('[TEST_SUBSCRIPTION] ❌ Abonnement invalide:', pushError.message);
      res.json({ 
        success: false, 
        message: 'Abonnement invalide ou expiré' 
      });
    }
    
  } catch (error) {
    console.error('[TEST_SUBSCRIPTION] Erreur lors du test:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors du test' 
    });
  }
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
    // Utiliser le port 3001 pour les redirections frontend
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
              const { supabase } = require('./utils/supabaseClient-server');
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
          const { supabase } = require('./utils/supabaseClient-server');
          
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

          // Vérifier et notifier l'atteinte du score de fidélité maximum
          try {
            await checkAndNotifyLoyaltyAchievement(userId);
          } catch (loyaltyError) {
            console.error('[FEDAPAY_WEBHOOK] Erreur vérification fidélité:', loyaltyError);
            // Ne pas faire échouer le webhook pour cette erreur
          }

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
          const { supabase } = require('./utils/supabaseClient-server');
          
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
          const { supabase } = require('./utils/supabaseClient-server');
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
              transaction_reference: transaction.reference,
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
          
          // Envoyer une notification push à l'utilisateur
          try {
            // Récupérer les informations de l'utilisateur
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('first_name, last_name')
              .eq('id', userId)
              .single();
              
            if (!userError && userData) {
              const clientName = `${userData.first_name} ${userData.last_name}`;
              const amountFormatted = `${depositAmount.toLocaleString()} FCFA`;
              
              // Envoyer la notification
              const notificationResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/notify-savings-deposit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  clientName,
                  amount: amountFormatted,
                  userId
                })
              });
              
              if (notificationResponse.ok) {
                console.log('[FEDAPAY_WEBHOOK] 📱 Notification de dépôt envoyée avec succès');
              } else {
                console.error('[FEDAPAY_WEBHOOK] ❌ Erreur envoi notification:', await notificationResponse.text());
              }
            } else {
              console.error('[FEDAPAY_WEBHOOK] ❌ Impossible de récupérer les données utilisateur:', userError);
            }
          } catch (notificationError) {
            console.error('[FEDAPAY_WEBHOOK] ❌ Erreur lors de l\'envoi de la notification:', notificationError);
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
        callback_url: `${getFrontendUrl()}/ab-epargne/depot-retour`,
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
        callback_url: `${getFrontendUrl()}/remboursement-retour`,
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

    const { supabase } = require('./utils/supabaseClient-server');
    
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

    const { supabase } = require('./utils/supabaseClient-server');
    
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

    const { supabase } = require('./utils/supabaseClient-server');
    
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

// Fonction pour envoyer des notifications de rappel de dépôt d'épargne
async function sendSavingsDepositReminderNotifications() {
  try {
    console.log('[SAVINGS_REMINDER] Vérification des dépôts d\'épargne (aujourd\'hui et dans les 3 prochains jours)...');
    
    // Calculer les dates pour les 3 prochains jours
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    // Récupérer les plans d'épargne actifs avec dépôt dans les 3 prochains jours
    const { data: savingsPlans, error } = await supabase
      .from('savings_plans')
      .select(`
        id,
        user_id,
        plan_name,
        fixed_amount,
        next_deposit_date,
        status
      `)
      .eq('status', 'active')
      .not('next_deposit_date', 'is', null)
      .lte('next_deposit_date', threeDaysFromNow.toISOString().split('T')[0])
      .gte('next_deposit_date', today.toISOString().split('T')[0]);
    
    if (error) {
      console.error('[SAVINGS_REMINDER] Erreur lors de la récupération des plans:', error);
      return false;
    }
    
    if (!savingsPlans || savingsPlans.length === 0) {
      console.log('[SAVINGS_REMINDER] Aucun dépôt d\'épargne aujourd\'hui ou dans les 3 prochains jours');
      return true;
    }
    
    console.log(`[SAVINGS_REMINDER] ${savingsPlans.length} plan(s) d'épargne trouvé(s) avec dépôt en approche`);
    
    let notificationsSent = 0;
    let errors = 0;
    
    for (const plan of savingsPlans) {
      try {
        const depositDate = new Date(plan.next_deposit_date);
        const daysRemaining = Math.ceil((depositDate - today) / (1000 * 60 * 60 * 24));
        
        // Envoyer une notification si c'est exactement 3, 2, 1 jour(s) restant(s) ou aujourd'hui (0 jour)
        if (daysRemaining >= 0 && daysRemaining <= 3) {
          // Récupérer les informations de l'utilisateur
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('first_name, last_name')
            .eq('id', plan.user_id)
            .single();

          if (userError || !userData) {
            console.error(`[SAVINGS_REMINDER] ❌ Impossible de récupérer les données utilisateur pour le plan ${plan.id}:`, userError);
            continue;
          }

          const clientName = `${userData.first_name} ${userData.last_name}`;
          const amountFormatted = `${parseInt(plan.fixed_amount).toLocaleString()} FCFA`;
          
          let title, body;
          
          if (daysRemaining === 0) {
            // Message spécial pour le jour même
            title = "AB Campus Finance - Dépôt d'épargne aujourd'hui !";
            body = `Bonjour ${clientName}, c'est aujourd'hui que vous devez effectuer votre dépôt d'épargne de ${amountFormatted}. Si vous ne le faites pas aujourd'hui, vous pourriez perdre tous les intérêts que vous avez accumulés jusqu'à présent.`;
          } else {
            // Messages pour les jours précédents
            const daysText = daysRemaining === 1 ? '24h' : `${daysRemaining} jours`;
            title = "AB Campus Finance - Rappel de dépôt d'épargne";
            body = `Bonjour ${clientName}, votre prochain dépôt sur votre compte épargne est dans ${daysText}. Effectuer votre dépôt pour ne pas perdre les intérêts cumulés à ce jour.`;
          }
          
          // Récupérer les abonnements de l'utilisateur
          const { data: subscriptions } = await supabase
            .from('push_subscriptions')
            .select('subscription')
            .eq('user_id', plan.user_id);
          
          if (subscriptions && subscriptions.length > 0) {
            for (const sub of subscriptions) {
              try {
                await webPush.sendNotification(sub.subscription, JSON.stringify({
                  title,
                  body,
                  data: {
                    url: '/ab-epargne',
                    icon: '/logo192.png',
                    badge: '/logo192.png',
                    type: 'savings_deposit_reminder',
                    planId: plan.id,
                    daysRemaining: daysRemaining,
                    amount: amountFormatted,
                    planName: plan.plan_name
                  },
                  vibrate: [200, 50, 100]
                }));
                notificationsSent++;
                const logText = daysRemaining === 0 ? 'aujourd\'hui' : `${daysRemaining === 1 ? '24h' : `${daysRemaining} jours`} restant(s)`;
                console.log(`[SAVINGS_REMINDER] Notification envoyée à ${clientName} - ${logText}`);
              } catch (pushError) {
                console.error(`[SAVINGS_REMINDER] Erreur envoi notification à ${clientName}:`, pushError);
                errors++;
              }
            }
          } else {
            console.log(`[SAVINGS_REMINDER] Utilisateur ${clientName} non abonné aux notifications`);
          }
        }
      } catch (planError) {
        console.error(`[SAVINGS_REMINDER] Erreur traitement plan ${plan.id}:`, planError);
        errors++;
      }
    }
    
    console.log(`[SAVINGS_REMINDER] Terminé: ${notificationsSent} notifications envoyées, ${errors} erreurs`);
    return notificationsSent > 0;
    
  } catch (error) {
    console.error('[SAVINGS_REMINDER] Erreur générale:', error);
    return false;
  }
}

// Fonction pour notifier l'admin qu'un utilisateur a atteint le score de fidélité maximum
async function notifyAdminLoyaltyAchievement(clientName, userId) {
  try {
    console.log('[ADMIN_LOYALTY] Notification admin pour score de fidélité:', { clientName, userId });
    
    // Récupérer l'admin
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('role', 'admin')
      .single();

    if (adminError || !adminData) {
      console.error('[ADMIN_LOYALTY] Aucun admin trouvé:', adminError);
      return false;
    }

    const adminName = adminData.first_name || 'Admin';
    
    const title = "🏆 AB Campus Finance - Score de fidélité atteint";
    const body = `L'utilisateur ${clientName} a rempli son score de fidélité (5/5). Il attend sa récompense. Contactez-le pour organiser la remise de sa récompense.`;

    // Récupérer les abonnements de l'admin
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', adminData.id);

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`[ADMIN_LOYALTY] Admin ${adminName} non abonné aux notifications`);
      return false;
    }

    let notificationsSent = 0;
    let errors = 0;

    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(sub.subscription, JSON.stringify({
          title,
          body,
          data: {
            url: '/admin/users',
            icon: '/logo192.png',
            badge: '/logo192.png',
            type: 'loyalty_achievement_admin',
            clientName: clientName,
            userId: userId,
            score: 5
          },
          vibrate: [200, 50, 100]
        }));
        notificationsSent++;
        console.log(`[ADMIN_LOYALTY] ✅ Notification envoyée à l'admin ${adminName}`);
      } catch (pushError) {
        errors++;
        console.error(`[ADMIN_LOYALTY] ❌ Erreur envoi notification à l'admin ${adminName}:`, pushError);
      }
    }

    console.log(`[ADMIN_LOYALTY] Notifications admin envoyées: ${notificationsSent} succès, ${errors} erreurs`);
    return notificationsSent > 0;

  } catch (error) {
    console.error('[ADMIN_LOYALTY] Erreur lors de la notification admin:', error);
    return false;
  }
}

// Fonction pour vérifier et notifier l'atteinte du score de fidélité maximum
async function checkAndNotifyLoyaltyAchievement(userId) {
  try {
    console.log('[LOYALTY] Vérification du score de fidélité pour l\'utilisateur:', userId);
    
    // Récupérer les prêts et paiements de l'utilisateur
    const [loansResult, paymentsResult] = await Promise.all([
      supabase.from('loans').select('*').eq('user_id', userId),
      supabase.from('payments').select('*').eq('user_id', userId)
    ]);

    if (loansResult.error || paymentsResult.error) {
      console.error('[LOYALTY] Erreur récupération données:', loansResult.error || paymentsResult.error);
      return false;
    }

    const loans = loansResult.data || [];
    const payments = paymentsResult.data || [];

    // Créer un index des prêts par id
    const loanById = new Map(loans.map(loan => [loan.id, loan]));

    // Filtrer les paiements complétés
    const completedPayments = payments.filter(p => (p.status || '').toLowerCase() === 'completed');

    // Ensemble des prêts remboursés à temps (unique par prêt)
    const onTimeLoanIds = new Set();

    completedPayments.forEach(p => {
      const loan = loanById.get(p.loan_id);
      if (!loan) return;

      const loanCreatedAt = new Date(loan.created_at || new Date());
      const durationDays = parseInt(loan.duration_months || loan.duration || 30, 10);
      const dueDate = new Date(loanCreatedAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

      const paymentDate = new Date(p.payment_date || p.created_at || new Date());
      const isOnTime = paymentDate.getTime() <= dueDate.getTime();

      if (isOnTime) {
        onTimeLoanIds.add(p.loan_id);
      }
    });

    // Calculer le score de fidélité
    const loyaltyScore = Math.max(0, Math.min(5, onTimeLoanIds.size));

    console.log('[LOYALTY] Score calculé:', {
      userId,
      onTimeLoansCount: onTimeLoanIds.size,
      loyaltyScore
    });

    // Si l'utilisateur vient d'atteindre le score maximum (5)
    if (loyaltyScore === 5) {
      // Récupérer les informations de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        console.error('[LOYALTY] Erreur récupération utilisateur:', userError);
        return false;
      }

      const clientName = `${userData.first_name} ${userData.last_name}`;
      
      const title = "🏆 AB Campus Finance - Félicitations !";
      const body = `Bravo ${clientName} ! Vous avez atteint le score de fidélité maximum (5/5) grâce à vos 5 remboursements ponctuels. Votre sérieux et votre fidélité sont remarquables ! Vous serez contacté très bientôt pour recevoir votre récompense.`;

      // Récupérer les abonnements de l'utilisateur
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .eq('user_id', userId);

      if (subscriptions && subscriptions.length > 0) {
        let notificationsSent = 0;
        let errors = 0;

        for (const sub of subscriptions) {
          try {
            await webPush.sendNotification(sub.subscription, JSON.stringify({
              title,
              body,
              data: {
                url: '/loyalty-score',
                icon: '/logo192.png',
                badge: '/logo192.png',
                type: 'loyalty_achievement',
                score: 5,
                clientName: clientName
              },
              vibrate: [200, 50, 100]
            }));
            notificationsSent++;
            console.log(`[LOYALTY] ✅ Notification de fidélité envoyée à ${clientName}`);
          } catch (pushError) {
            errors++;
            console.error(`[LOYALTY] ❌ Erreur envoi notification à ${clientName}:`, pushError);
          }
        }

        console.log(`[LOYALTY] Notifications envoyées: ${notificationsSent} succès, ${errors} erreurs`);
        
        // Envoyer une notification à l'admin
        try {
          await notifyAdminLoyaltyAchievement(clientName, userId);
        } catch (adminError) {
          console.error('[LOYALTY] Erreur notification admin:', adminError);
          // Ne pas faire échouer la fonction pour cette erreur
        }
        
        return notificationsSent > 0;
      } else {
        console.log(`[LOYALTY] Utilisateur ${clientName} non abonné aux notifications`);
        
        // Envoyer quand même la notification à l'admin même si l'utilisateur n'est pas abonné
        try {
          await notifyAdminLoyaltyAchievement(clientName, userId);
        } catch (adminError) {
          console.error('[LOYALTY] Erreur notification admin:', adminError);
        }
        
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error('[LOYALTY] Erreur lors de la vérification de fidélité:', error);
    return false;
  }
}

// Fonction pour envoyer des notifications de rappel d'échéance de prêt
async function sendLoanReminderNotifications() {
  try {
    console.log('[LOAN_REMINDER] Vérification des prêts en échéance...');
    
    // Calculer les dates pour les 3 prochains jours
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    // Récupérer les prêts en cours
    const { data: loans, error } = await supabase
      .from('loans')
      .select(`
        id,
        user_id,
        amount,
        duration,
        approved_at,
        status,
        users!inner(first_name, last_name)
      `)
      .eq('status', 'active')
      .not('approved_at', 'is', null);
    
    if (error) {
      console.error('[LOAN_REMINDER] Erreur lors de la récupération des prêts:', error);
      return false;
    }
    
    if (!loans || loans.length === 0) {
      console.log('[LOAN_REMINDER] Aucun prêt en échéance dans les 3 prochains jours');
      return true;
    }
    
    console.log(`[LOAN_REMINDER] ${loans.length} prêt(s) trouvé(s) en échéance`);
    
    let notificationsSent = 0;
    let errors = 0;
    
    for (const loan of loans) {
      try {
        // Calculer la date d'échéance à partir de la date d'approbation et de la durée
        const approvedDate = new Date(loan.approved_at);
        const dueDate = new Date(approvedDate);
        dueDate.setMonth(dueDate.getMonth() + loan.duration);
        
        const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        // Envoyer une notification seulement si c'est exactement 3, 2 ou 1 jour(s) restant(s)
        if (daysRemaining >= 1 && daysRemaining <= 3) {
          const clientName = `${loan.users.first_name} ${loan.users.last_name}`;
          const amountFormatted = `${parseInt(loan.amount).toLocaleString()} FCFA`;
          const daysText = daysRemaining === 1 ? '1 jour' : `${daysRemaining} jours`;
          
          const title = "AB Campus Finance - Rappel d'échéance";
          const body = `Bonjour ${clientName}, votre prêt de ${amountFormatted} arrive à échéance dans ${daysText}. Rembourser maintenant pour éviter toute pénalité !`;
          
          // Récupérer les abonnements de l'utilisateur
          const { data: subscriptions } = await supabase
            .from('push_subscriptions')
            .select('subscription')
            .eq('user_id', loan.user_id);
          
          if (subscriptions && subscriptions.length > 0) {
            for (const sub of subscriptions) {
              try {
                await webPush.sendNotification(sub.subscription, JSON.stringify({
                  title,
                  body,
                  data: {
                    url: '/repayment',
                    icon: '/logo192.png',
                    badge: '/logo192.png',
                    type: 'loan_reminder',
                    loanId: loan.id,
                    daysRemaining: daysRemaining,
                    amount: amountFormatted
                  },
                  vibrate: [200, 50, 100]
                }));
                notificationsSent++;
                console.log(`[LOAN_REMINDER] Notification envoyée à ${clientName} - ${daysText} restant(s)`);
              } catch (pushError) {
                console.error(`[LOAN_REMINDER] Erreur envoi notification à ${clientName}:`, pushError);
                errors++;
              }
            }
          } else {
            console.log(`[LOAN_REMINDER] Utilisateur ${clientName} non abonné aux notifications`);
          }
        }
      } catch (loanError) {
        console.error(`[LOAN_REMINDER] Erreur traitement prêt ${loan.id}:`, loanError);
        errors++;
      }
    }
    
    console.log(`[LOAN_REMINDER] Terminé: ${notificationsSent} notifications envoyées, ${errors} erreurs`);
    return notificationsSent > 0;
    
  } catch (error) {
    console.error('[LOAN_REMINDER] Erreur générale:', error);
    return false;
  }
}

// Route pour déclencher manuellement les rappels de dépôt d'épargne
app.post('/api/trigger-savings-reminders', async (req, res) => {
  try {
    const success = await sendSavingsDepositReminderNotifications();
    
    if (success) {
      res.json({ success: true, message: 'Rappels de dépôt d\'épargne traités avec succès' });
    } else {
      res.json({ success: false, message: 'Aucun rappel de dépôt d\'épargne envoyé' });
    }
  } catch (error) {
    console.error('[SAVINGS_REMINDER] Erreur lors du déclenchement des rappels:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors du traitement des rappels de dépôt d\'épargne' 
    });
  }
});

// Route pour déclencher manuellement la vérification de fidélité
app.post('/api/trigger-loyalty-check', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId requis' 
      });
    }
    
    console.log('[LOYALTY] Déclenchement manuel de la vérification de fidélité pour:', userId);
    
    const success = await checkAndNotifyLoyaltyAchievement(userId);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Vérification de fidélité effectuée avec succès' 
      });
    } else {
      res.json({ 
        success: true, 
        message: 'Vérification effectuée - aucun score maximum atteint' 
      });
    }
  } catch (error) {
    console.error('[LOYALTY] Erreur lors de la vérification manuelle:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de la vérification de fidélité' 
    });
  }
});

// Route pour déclencher manuellement la notification admin de fidélité
app.post('/api/trigger-admin-loyalty-notification', async (req, res) => {
  try {
    const { clientName, userId } = req.body;
    
    if (!clientName || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'clientName et userId requis' 
      });
    }
    
    console.log('[ADMIN_LOYALTY] Déclenchement manuel de la notification admin pour:', { clientName, userId });
    
    const success = await notifyAdminLoyaltyAchievement(clientName, userId);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Notification admin de fidélité envoyée avec succès' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Aucune notification admin envoyée' 
      });
    }
  } catch (error) {
    console.error('[ADMIN_LOYALTY] Erreur lors de la notification manuelle:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de la notification admin' 
    });
  }
});

// Route pour déclencher manuellement les rappels de prêt
app.post('/api/trigger-loan-reminders', async (req, res) => {
  try {
    const success = await sendLoanReminderNotifications();
    
    if (success) {
      res.json({ success: true, message: 'Rappels de prêt traités avec succès' });
    } else {
      res.json({ success: false, message: 'Aucun rappel envoyé' });
    }
  } catch (error) {
    console.error('[LOAN_REMINDER] Erreur lors du déclenchement des rappels:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors du traitement des rappels' 
    });
  }
});

// Route pour notifier l'admin d'une nouvelle demande de prêt
app.post('/api/notify-admin-new-loan', async (req, res) => {
  try {
    const { loanAmount, clientName, loanId } = req.body;
    
    if (!loanAmount || !clientName || !loanId) {
      return res.status(400).json({ 
        success: false, 
        error: 'loanAmount, clientName et loanId sont requis' 
      });
    }
    
    console.log('[ADMIN_NOTIFICATION] Nouvelle demande de prêt:', { loanAmount, clientName, loanId });
    
    // Récupérer l'UUID de l'admin (vous pouvez me donner l'UUID si vous en avez un spécifique)
    // Pour l'instant, je vais chercher un utilisateur avec le rôle admin
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('id, first_name, last_name, role')
      .eq('role', 'admin')
      .single();

    if (adminError || !adminData) {
      console.error('[ADMIN_NOTIFICATION] ❌ Aucun admin trouvé:', adminError);
      return res.status(404).json({ 
        success: false, 
        error: 'Aucun administrateur trouvé' 
      });
    }

    console.log('[ADMIN_NOTIFICATION] Admin trouvé:', {
      id: adminData.id,
      name: `${adminData.first_name} ${adminData.last_name}`,
      role: adminData.role
    });

    const adminName = adminData.first_name || 'Admin';
    const amountFormatted = `${parseInt(loanAmount).toLocaleString()} FCFA`;
    
    const title = "AB Campus Finance - Nouvelle demande de prêt";
    const body = `Hello ${adminName}, vous avez reçu une nouvelle demande de prêt de ${amountFormatted} de ${clientName}. Cliquer ici pour l'afficher.`;
    
    // Récupérer les abonnements de l'admin
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription, user_id')
      .eq('user_id', adminData.id);
    
    console.log('[ADMIN_NOTIFICATION] Abonnements trouvés pour l\'admin:', {
      adminId: adminData.id,
      subscriptionsCount: subscriptions?.length || 0,
      subscriptions: subscriptions?.map(sub => ({ user_id: sub.user_id }))
    });
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log(`[ADMIN_NOTIFICATION] Admin ${adminName} non abonné aux notifications`);
      return res.json({ 
        success: true, 
        message: 'Nouvelle demande reçue mais admin non abonné aux notifications' 
      });
    }
    
    let notificationsSent = 0;
    let errors = 0;
    
    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(sub.subscription, JSON.stringify({
          title,
          body,
          data: {
            url: '/admin/loans',
            icon: '/logo192.png',
            badge: '/logo192.png',
            type: 'new_loan_request',
            loanId: loanId,
            amount: amountFormatted,
            clientName: clientName
          },
          vibrate: [200, 50, 100]
        }));
        notificationsSent++;
        console.log(`[ADMIN_NOTIFICATION] ✅ Notification envoyée à l'admin ${adminName}`);
      } catch (pushError) {
        console.error(`[ADMIN_NOTIFICATION] ❌ Erreur envoi notification à l'admin ${adminName}:`, pushError);
        errors++;
      }
    }
    
    if (notificationsSent > 0) {
      res.json({ 
        success: true, 
        message: `Notification envoyée à l'admin ${adminName}`,
        notificationsSent,
        errors
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Aucune notification envoyée à l\'admin' 
      });
    }
    
  } catch (error) {
    console.error('[ADMIN_NOTIFICATION] Erreur lors de l\'envoi de la notification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de l\'envoi de la notification' 
    });
  }
});

// Route pour notifier l'approbation d'un prêt
app.post('/api/notify-loan-approval', async (req, res) => {
  try {
    const { userId, loanAmount, loanId } = req.body;
    
    if (!userId || !loanAmount || !loanId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId, loanAmount et loanId sont requis' 
      });
    }
    
    console.log('[LOAN_APPROVAL] Envoi notification d\'approbation:', { userId, loanAmount, loanId });
    
    // Récupérer les informations de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('[LOAN_APPROVAL] ❌ Impossible de récupérer les données utilisateur:', userError);
      return res.status(404).json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      });
    }

    const clientName = `${userData.first_name} ${userData.last_name}`;
    const amountFormatted = `${parseInt(loanAmount).toLocaleString()} FCFA`;
    
    const title = "AB Campus Finance - Prêt approuvé !";
    const body = `Félicitations ${clientName} ! Votre demande de prêt de ${amountFormatted} a été approuvée. Les fonds seront transférés sous 24h.`;
    
    // Récupérer les abonnements de l'utilisateur
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId);
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log(`[LOAN_APPROVAL] Utilisateur ${clientName} non abonné aux notifications`);
      return res.json({ 
        success: true, 
        message: 'Prêt approuvé mais utilisateur non abonné aux notifications' 
      });
    }
    
    let notificationsSent = 0;
    let errors = 0;
    
    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(sub.subscription, JSON.stringify({
          title,
          body,
          data: {
            url: '/loans',
            icon: '/logo192.png',
            badge: '/logo192.png',
            type: 'loan_approval',
            loanId: loanId,
            amount: amountFormatted
          },
          vibrate: [200, 50, 100]
        }));
        notificationsSent++;
        console.log(`[LOAN_APPROVAL] ✅ Notification envoyée à ${clientName}`);
      } catch (pushError) {
        console.error(`[LOAN_APPROVAL] ❌ Erreur envoi notification à ${clientName}:`, pushError);
        errors++;
      }
    }
    
    if (notificationsSent > 0) {
      res.json({ 
        success: true, 
        message: `Notification d'approbation envoyée à ${clientName}`,
        notificationsSent,
        errors
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Aucune notification envoyée' 
      });
    }
    
  } catch (error) {
    console.error('[LOAN_APPROVAL] Erreur lors de l\'envoi de la notification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de l\'envoi de la notification' 
    });
  }
});

// Fonction pour programmer les rappels de prêt et d'épargne à 11h chaque jour
function scheduleReminders() {
  const now = new Date();
  const next11AM = new Date();
  next11AM.setHours(11, 0, 0, 0);
  
  // Si 11h est déjà passé aujourd'hui, programmer pour demain
  if (now >= next11AM) {
    next11AM.setDate(next11AM.getDate() + 1);
  }
  
  const timeUntil11AM = next11AM.getTime() - now.getTime();
  
  console.log(`[SCHEDULER] Prochains rappels programmés pour: ${next11AM.toLocaleString()}`);
  
  setTimeout(() => {
    console.log('[SCHEDULER] Exécution des rappels...');
    
    // Exécuter les rappels de prêt et d'épargne en parallèle
    Promise.all([
      sendLoanReminderNotifications(),
      sendSavingsDepositReminderNotifications()
    ]).then(([loanResults, savingsResults]) => {
      console.log('[SCHEDULER] Rappels terminés:', {
        loans: loanResults ? 'Envoyés' : 'Aucun',
        savings: savingsResults ? 'Envoyés' : 'Aucun'
      });
    }).catch(error => {
      console.error('[SCHEDULER] Erreur lors de l\'exécution des rappels:', error);
    });
    
    // Programmer le prochain rappel pour demain à 11h
    scheduleReminders();
  }, timeUntil11AM);
}

// Démarrer le scheduler des rappels
scheduleReminders();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
  console.log(`SMS Mode: ${SMS_MODE}`);
  console.log(`Vonage configured: ${Boolean(process.env.REACT_APP_VONAGE_API_KEY && process.env.REACT_APP_VONAGE_API_SECRET)}`);
});