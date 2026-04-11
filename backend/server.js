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
    return process.env.FRONTEND_URL || 'https://www.campusab.com';
  }
  // En développement, utiliser localhost:3001
  return process.env.FRONTEND_URL || 'http://localhost:3001';
};

console.log('[CONFIG] Frontend URL:', getFrontendUrl());

// Import web-push configuration AFTER loading env variables
const webPush = require('./config/push');

// Import Supabase client
const { supabase } = require('./utils/supabaseClient-server');
const { requireAuth, requireAdmin } = require('./utils/authMiddleware');

// Import PDF Generator
const pdfGenerator = require('./routes/pdfGenerator');

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

const allowedOrigins = [
  'https://www.campusab.com',
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (ex: Postman, mobile apps, webhooks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origine non autorisée — ${origin}`));
  },
  credentials: true
}));

// Routes PDF
app.use('/api', pdfGenerator);

// Route de test pour vérifier que l'API fonctionne
app.get("/api/health", (req, res) => res.json({ ok: true }));

// ===== FCM (Firebase Cloud Messaging) - Test =====

// Helper pour initialiser Firebase Admin (réutilisable)
function getFirebaseAdmin() {
  let admin;
  try {
    admin = require('firebase-admin');
  } catch (e) {
    throw new Error('Firebase Admin non installé. Dans backend: npm install firebase-admin.');
  }

  if (!admin.apps.length) {
    // Priorité 1 : variable d'environnement base64 (Render / production)
    const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (base64) {
      const serviceAccount = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
      // Priorité 2 : fichier local (développement)
      const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
      const fs = require('fs');
      if (!fs.existsSync(path)) {
        throw new Error(`Service account Firebase introuvable. Configurez FIREBASE_SERVICE_ACCOUNT_BASE64 sur Render ou placez le fichier JSON à ${path}.`);
      }
      const serviceAccount = JSON.parse(fs.readFileSync(path, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
  }

  return admin;
}

/**
 * ⚠️ FONCTION WRAPPER : Vérifie les doublons AVANT d'envoyer une notification FCM
 * Cette fonction garantit qu'une notification n'est envoyée qu'une seule fois
 * @param {string} userId - ID de l'utilisateur
 * @param {string} title - Titre de la notification
 * @param {string} body - Corps du message
 * @param {object} data - Données additionnelles (url, type, loanId, payment_id, etc.)
 * @returns {Promise<{success: boolean, error?: string, duplicate?: boolean}>}
 */
async function sendFCMNotificationWithDuplicateCheck(userId, title, body, data = {}) {
  try {
    // ⚠️ PROTECTION CONTRE LES DOUBLONS : Vérification rapide avec timeout
    // Si la vérification prend trop de temps (> 2 secondes), on envoie quand même pour éviter de bloquer
    const duplicateCheckPromise = (async () => {
      try {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        let existingNotif = null;
        
    if (data.transaction_id) {
      // Vérifier par transaction_id (le plus fiable)
      const { data: notif1, error: err1 } = await supabase
        .from('notifications')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('type', data.type || 'loan_repayment')
        .filter('data->>transaction_id', 'eq', data.transaction_id)
        .gte('created_at', tenMinutesAgo.toISOString())
        .limit(1);
      if (!err1) existingNotif = notif1;
      
      if (!existingNotif || existingNotif.length === 0) {
        const { data: notif2, error: err2 } = await supabase
          .from('notifications')
          .select('id, created_at')
          .eq('user_id', userId)
          .eq('type', data.type || 'loan_repayment')
          .contains('data', { transaction_id: data.transaction_id })
          .gte('created_at', tenMinutesAgo.toISOString())
          .limit(1);
        if (!err2 && notif2 && notif2.length > 0) existingNotif = notif2;
      }
    } else if (data.payment_id) {
      const { data: notif1, error: err1 } = await supabase
        .from('notifications')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('type', data.type || 'loan_repayment')
        .filter('data->>payment_id', 'eq', data.payment_id)
        .gte('created_at', tenMinutesAgo.toISOString())
        .limit(1);
      if (!err1) existingNotif = notif1;
        } else if (data.loanId || data.loan_id) {
          const loanId = data.loanId || data.loan_id;
          const { data: notif1, error: err1 } = await supabase
            .from('notifications')
            .select('id, created_at')
            .eq('user_id', userId)
            .eq('type', data.type || 'loan_approval')
            .filter('data->>loanId', 'eq', loanId)
            .gte('created_at', tenMinutesAgo.toISOString())
            .limit(1);
          
          if (!err1 && notif1 && notif1.length > 0) {
            existingNotif = notif1;
          } else {
            const { data: notif2, error: err2 } = await supabase
              .from('notifications')
              .select('id, created_at')
              .eq('user_id', userId)
              .eq('type', data.type || 'loan_approval')
              .filter('data->>loan_id', 'eq', loanId)
              .gte('created_at', tenMinutesAgo.toISOString())
              .limit(1);
            if (!err2) existingNotif = notif2;
          }
        } else if (data.plan_id) {
          const { data: notif1, error: err1 } = await supabase
            .from('notifications')
            .select('id, created_at')
            .eq('user_id', userId)
            .eq('type', data.type || 'savings_deposit')
            .filter('data->>plan_id', 'eq', data.plan_id)
            .gte('created_at', tenMinutesAgo.toISOString())
            .limit(1);
          if (!err1) existingNotif = notif1;
        }
        
        return existingNotif;
      } catch (checkError) {
        console.error('[FCM] Erreur lors de la vérification doublon:', checkError);
        return null; // En cas d'erreur, retourner null pour permettre l'envoi
      }
    })();
    
    // Timeout de 2 secondes pour la vérification
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2000));
    const existingNotif = await Promise.race([duplicateCheckPromise, timeoutPromise]);
    
    // Si une notification existe déjà, ne pas renvoyer
    if (existingNotif && existingNotif.length > 0) {
      console.log(`[FCM] ⚠️ Notification déjà envoyée récemment (évite doublon):`, {
        userId,
        type: data.type,
        existingAt: existingNotif[0].created_at
      });
      return { success: false, error: 'Notification déjà envoyée', duplicate: true };
    }
    
    // Si pas de doublon (ou timeout), appeler la fonction d'envoi originale
    return await sendFCMNotification(userId, title, body, data);
  } catch (error) {
    console.error('[FCM] Erreur vérification doublon (envoi quand même):', error);
    // En cas d'erreur de vérification, envoyer quand même (mieux vaut un doublon qu'une notification manquée)
    return await sendFCMNotification(userId, title, body, data);
  }
}

/**
 * Envoie une notification FCM à un utilisateur spécifique (via fcm_token dans users).
 * ⚠️ NE PAS APPELER DIRECTEMENT - Utiliser sendFCMNotificationWithDuplicateCheck() à la place
 * @param {string} userId - ID de l'utilisateur
 * @param {string} title - Titre de la notification
 * @param {string} body - Corps du message
 * @param {object} data - Données additionnelles (url, type, etc.)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendFCMNotification(userId, title, body, data = {}) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('fcm_token, first_name')
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.warn(`[FCM] Utilisateur ${userId} non trouvé`);
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    if (!user.fcm_token) {
      console.log(`[FCM] Utilisateur ${user.first_name || userId} n'a pas de token FCM`);
      return { success: false, error: 'Pas de token FCM' };
    }

    const admin = getFirebaseAdmin();
    const message = {
      notification: { title, body },
      webpush: {
        notification: {
          title,
          body,
          icon: '/logo192.png',
          badge: '/logo192.png'
        },
        fcmOptions: {
          link: data.url || '/dashboard'
        }
      },
      android: {
        notification: {
          title,
          body,
          sound: 'default',
          icon: 'logo192',
          channelId: 'ab-campus-finance'
        }
      },
      apns: {
        payload: {
          aps: {
            alert: { title, body },
            sound: 'default'
          }
        }
      },
      data: {
        ...data,
        click_action: data.url || '/dashboard'
      },
      token: user.fcm_token
    };

    await admin.messaging().send(message);
    console.log(`[FCM] ✅ Notification envoyée à ${user.first_name || userId}`);
    return { success: true };
  } catch (err) {
    console.error(`[FCM] ❌ Erreur pour ${userId}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Envoie une notification FCM à plusieurs utilisateurs (liste de userIds).
 * @param {string[]} userIds - Liste des IDs utilisateurs
 * @param {string} title - Titre
 * @param {string} body - Corps
 * @param {object} data - Données additionnelles
 * @returns {Promise<{sent: number, errors: number}>}
 */
async function sendFCMNotificationToUsers(userIds, title, body, data = {}) {
  let sent = 0;
  let errors = 0;
  for (const userId of userIds) {
    const result = await sendFCMNotificationWithDuplicateCheck(userId, title, body, data);
    if (result.success) sent++;
    else if (result.duplicate) {
      // Doublon détecté, ne pas compter comme erreur
      console.log(`[FCM] Doublon évité pour utilisateur ${userId}`);
    } else {
      errors++;
    }
  }
  return { sent, errors };
}

/**
 * Envoie une notification FCM à TOUS les utilisateurs avec fcm_token.
 * @param {string} title - Titre
 * @param {string} body - Corps
 * @param {object} data - Données additionnelles
 * @returns {Promise<{sent: number, errors: number}>}
 */
async function sendFCMNotificationToAllUsers(title, body, data = {}) {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, fcm_token')
      .not('fcm_token', 'is', null);

    if (error || !users || users.length === 0) {
      console.log('[FCM] Aucun utilisateur avec token FCM');
      return { sent: 0, errors: 0 };
    }

    const userIds = users.map(u => u.id);
    return await sendFCMNotificationToUsers(userIds, title, body, data);
  } catch (err) {
    console.error('[FCM] Erreur sendFCMNotificationToAllUsers:', err);
    return { sent: 0, errors: 0 };
  }
}

// Envoyer une notification de test à un utilisateur (token FCM depuis users.fcm_token)
app.post('/api/notifications/test-fcm', async (req, res) => {
  try {
    const { userId, fcmToken: tokenFromBody, title, body } = req.body || {};
    let fcmToken = tokenFromBody;

    if (!fcmToken && userId) {
      const { data: user, error } = await supabase
        .from('users')
        .select('fcm_token, first_name')
        .eq('id', userId)
        .single();
      if (error || !user) {
        return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
      }
      fcmToken = user?.fcm_token;
    }

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        error: 'Aucun token FCM. Passez userId (et que users.fcm_token soit rempli) ou fcmToken dans le body.'
      });
    }

    const admin = getFirebaseAdmin();

    const message = {
      notification: {
        title: title || 'Test AB Campus Finance',
        body: body || 'Ceci est une notification de test FCM.'
      },
      webpush: {
        notification: {
          icon: '/logo192.png',
          badge: '/logo192.png',
          sound: 'default'
        },
        fcmOptions: {
          link: '/dashboard'
        }
      },
      android: {
        notification: {
          sound: 'default',
          icon: 'logo192',
          channelId: 'ab-campus-finance'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default'
          }
        }
      },
      token: fcmToken
    };

    const response = await admin.messaging().send(message);
    console.log('[FCM_TEST] Notification envoyée:', response);
    res.json({ success: true, messageId: response });
  } catch (err) {
    console.error('[FCM_TEST] Erreur:', err);
    const statusCode = err.message?.includes('non installé') || err.message?.includes('introuvable') ? 503 : 500;
    res.status(statusCode).json({ success: false, error: err.message || 'Erreur envoi FCM' });
  }
});

// Envoyer une notification de test à TOUS les utilisateurs avec leur nom personnalisé
app.post('/api/notifications/test-fcm-all-users', async (req, res) => {
  try {
    const admin = getFirebaseAdmin();

    // Récupérer tous les utilisateurs avec fcm_token et nom
    const { data: users, error } = await supabase
      .from('users')
      .select('id, fcm_token, first_name, last_name')
      .not('fcm_token', 'is', null);

    if (error) {
      console.error('[FCM_TEST_ALL] Erreur récupération users:', error);
      return res.status(500).json({ success: false, error: 'Erreur récupération utilisateurs' });
    }

    if (!users || users.length === 0) {
      return res.json({ success: true, sent: 0, message: 'Aucun utilisateur avec token FCM trouvé' });
    }

    console.log(`[FCM_TEST_ALL] Envoi à ${users.length} utilisateur(s)...`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Envoyer à chaque utilisateur avec son nom personnalisé
    for (const user of users) {
      try {
        const userName = user.first_name || 'Utilisateur';
        const message = {
          notification: {
            title: 'AB Campus Finance',
            body: `Bonjour ${userName}, ceci est un test ne vous en faites pas, tout est OK!!!`
          },
          webpush: {
            notification: {
              icon: '/logo192.png',
              badge: '/logo192.png',
              sound: 'default'
            },
            fcmOptions: {
              link: '/dashboard'
            }
          },
          android: {
            notification: {
              sound: 'default',
              icon: 'logo192',
              channelId: 'ab-campus-finance'
            }
          },
          apns: {
            payload: {
              aps: {
                sound: 'default'
              }
            }
          },
          token: user.fcm_token
        };

        await admin.messaging().send(message);
        successCount++;
        console.log(`[FCM_TEST_ALL] ✅ Envoyé à ${userName} (${user.id})`);
      } catch (err) {
        errorCount++;
        errors.push({ userId: user.id, name: user.first_name, error: err.message });
        console.error(`[FCM_TEST_ALL] ❌ Erreur pour ${user.first_name || user.id}:`, err.message);
      }
    }

    console.log(`[FCM_TEST_ALL] Terminé: ${successCount} succès, ${errorCount} erreur(s)`);

    res.json({
      success: true,
      sent: successCount,
      errors: errorCount,
      total: users.length,
      details: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('[FCM_TEST_ALL] Erreur:', err);
    const statusCode = err.message?.includes('non installé') || err.message?.includes('introuvable') ? 503 : 500;
    res.status(statusCode).json({ success: false, error: err.message || 'Erreur envoi FCM à tous' });
  }
});

// ===== WEB PUSH NOTIFICATIONS =====

// Route pour s'abonner aux notifications push
app.post("/api/save-subscription", requireAuth, async (req, res) => {
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
    
    // Supprimer d'abord tous les abonnements existants pour cet utilisateur pour éviter les doublons
    const { error: deleteError } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error('[SAVE_SUBSCRIPTION] Erreur suppression abonnements existants:', deleteError);
      // Continuer quand même, on va essayer d'insérer
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
      console.error('[SAVE_SUBSCRIPTION] Erreur création abonnement:', insertError);
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la création de l\'abonnement' 
      });
    }
    
    console.log('[SAVE_SUBSCRIPTION] ✅ Abonnement créé/mis à jour pour', user.first_name, user.last_name);
    
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
// DEPRECATED: Utilisez sendFCMNotificationToAllUsers à la place
async function sendNotificationToAllUsers(title, body, data = {}) {
  console.warn('[DEPRECATED] sendNotificationToAllUsers est dépréciée. Utilisez sendFCMNotificationToAllUsers.');
  const result = await sendFCMNotificationToAllUsers(title, body, data);
  return result.sent > 0;
}

// Route pour tester la validité d'un abonnement
app.post('/api/test-subscription', requireAuth, async (req, res) => {
  try {
    const { subscription, userId } = req.body;

    if (!subscription) {
      return res.status(400).json({ success: false, error: "Subscription manquante" });
    }

    // Envoyer une notification de test silencieuse
    const payload = JSON.stringify({
      title: 'Test de validité',
      body: 'Test de l\'abonnement push',
      data: { 
        test: true,
        silent: true,
        url: '/',
        icon: '/logo192.png',
        badge: '/logo192.png'
      }
    });

    await webPush.sendNotification(subscription, payload);
    console.log('[TEST_SUBSCRIPTION] ✅ Abonnement valide pour l\'utilisateur:', userId);
    
    res.json({ success: true, message: 'Abonnement valide' });
  } catch (error) {
    console.error('[TEST_SUBSCRIPTION] ❌ Abonnement invalide:', error.message);
    res.json({ success: false, error: error.message });
  }
});

// Route pour envoyer une notification push à un utilisateur spécifique (via FCM)
app.post('/api/send-notification', async (req, res) => {
  try {
    const { title, body, userId } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId, title et body sont requis' 
      });
    }

    const result = await sendFCMNotification(userId, title, body, { url: '/' });
    
    if (result.success) {
      res.json({ success: true, message: 'Notification envoyée' });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error || 'Erreur lors de l\'envoi' 
      });
    }
  } catch (error) {
    console.error('[FCM] Erreur lors de l\'envoi de la notification:', error);
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
    const { clientName, amount, userId, planId } = req.body;

    if (!clientName || !amount || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'clientName, amount et userId requis' 
      });
    }

    const title = "Dépôt d'épargne confirmé 💰";
    const body = `Bonjour ${clientName}, votre compte épargne a été crédité de ${amount}. Keep Going !`;

    // 1. CRÉER LA NOTIFICATION DANS LA BASE DE DONNÉES (TOUJOURS)
    try {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: title,
          message: body,
          type: 'savings_deposit',
          data: {
            amount: amount,
            plan_id: planId || null
          },
          read: false
        });

      if (notifError) {
        console.error('[NOTIFY_DEPOSIT] ❌ Erreur création notification DB:', notifError);
      } else {
        console.log('[NOTIFY_DEPOSIT] ✅ Notification in-app créée dans la DB');
      }
    } catch (dbError) {
      console.error('[NOTIFY_DEPOSIT] ❌ Erreur création notification:', dbError);
    }

    // 2. ENVOYER LA NOTIFICATION PUSH (si abonnement disponible)
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId);

    if (error) {
      console.error('[PUSH] Erreur lors de la récupération des abonnements:', error);
      // On retourne quand même un succès car la notification DB est créée
      return res.json({ 
        success: true, 
        message: 'Notification créée dans la base de données',
        push: false
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`[PUSH] Aucun abonnement trouvé pour l'utilisateur ${userId}`);
      return res.json({ 
        success: true, 
        message: 'Notification créée dans la base de données (utilisateur non abonné aux push)',
        push: false
      });
    }

    // FCM : notification push via Firebase
    const fcmResult = await sendFCMNotificationWithDuplicateCheck(userId, title, body, {
      url: '/ab-epargne',
      type: 'savings_deposit',
      amount: amount,
      clientName: clientName,
      plan_id: planId || ''
    });

    res.json({ 
      success: true, 
      message: fcmResult.success ? 'Notification créée et envoyée' : 'Notification créée (utilisateur sans token FCM)',
      push: fcmResult.success
    });
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

// Route pour tester l'envoi de notifications de prêt
app.post('/api/test-loan-notification', requireAdmin, async (req, res) => {
  try {
    const { userId, testType = 'approval' } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId est requis' 
      });
    }
    
    console.log('[TEST_LOAN_NOTIFICATION] Test notification pour utilisateur:', userId, 'Type:', testType);
    
    // Récupérer les informations de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('[TEST_LOAN_NOTIFICATION] Utilisateur non trouvé:', userError);
      return res.status(404).json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      });
    }

    // Récupérer les abonnements push de l'utilisateur
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId);

    if (subError) {
      console.error('[TEST_LOAN_NOTIFICATION] Erreur récupération abonnements:', subError);
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la récupération des abonnements' 
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('[TEST_LOAN_NOTIFICATION] Aucun abonnement trouvé pour l\'utilisateur');
      return res.status(404).json({ 
        success: false, 
        error: 'Aucun abonnement push trouvé pour cet utilisateur' 
      });
    }

    // Données de test
    const testData = {
      approval: {
        title: "🎉 AB Campus Finance - Prêt approuvé !",
        body: `Félicitations ${userData.first_name} ! Votre prêt de 50,000 FCFA a été approuvé. Vous pouvez maintenant procéder au remboursement.`,
        amount: 50000,
        loanId: 'TEST-' + Date.now()
      },
      reminder: {
        title: "⏰ AB Campus Finance - Rappel de remboursement",
        body: `Bonjour ${userData.first_name}, n'oubliez pas que votre prêt de 25,000 FCFA arrive à échéance dans 3 jours.`,
        amount: 25000,
        loanId: 'TEST-REMINDER-' + Date.now()
      },
      overdue: {
        title: "⚠️ AB Campus Finance - Prêt en retard",
        body: `Attention ${userData.first_name}, votre prêt de 30,000 FCFA est en retard. Des pénalités s'appliquent.`,
        amount: 30000,
        loanId: 'TEST-OVERDUE-' + Date.now()
      }
    };

    const notificationData = testData[testType] || testData.approval;

    // FCM : notification push via Firebase
    const fcmResult = await sendFCMNotification(userId, notificationData.title, notificationData.body, {
      url: '/dashboard',
      type: 'loan_' + testType,
      loanId: notificationData.loanId,
      amount: notificationData.amount.toString(),
      timestamp: new Date().toISOString()
    });
    
    const successCount = fcmResult.success ? 1 : 0;
    const errorCount = fcmResult.success ? 0 : 1;

    // Sauvegarder la notification de test dans la base de données
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: notificationData.title,
        message: notificationData.body,
        type: 'loan_' + testType,
        data: {
          loanId: notificationData.loanId,
          amount: notificationData.amount,
          isTest: true,
          testType: testType
        },
        created_at: new Date().toISOString()
      });

    if (notifError) {
      console.error('[TEST_LOAN_NOTIFICATION] Erreur sauvegarde notification:', notifError);
    }

    res.json({ 
      success: true, 
      message: `Notification de test envoyée avec succès`,
      details: {
        user: `${userData.first_name} ${userData.last_name}`,
        email: userData.email,
        testType: testType,
        subscriptionsFound: subscriptions.length,
        notificationsSent: successCount,
        errors: errorCount,
        notificationData: notificationData
      }
    });

  } catch (error) {
    console.error('[TEST_LOAN_NOTIFICATION] Erreur générale:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de l\'envoi de la notification de test' 
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
    const apiKey = process.env.VONAGE_API_KEY;
    const apiSecret = process.env.VONAGE_API_SECRET;
    if (!apiKey || !apiSecret) {
      throw new Error('Vonage credentials are missing (VONAGE_API_KEY / VONAGE_API_SECRET)');
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

/**
 * Envoie un SMS de notification (rappels, alertes) via Vonage.
 * Alternative fiable aux push navigateur : les clients reçoivent le SMS même sans ouvrir l'app.
 * Respecte SMS_MODE : 'echo' = log uniquement, 'live' = envoi réel.
 * @param {string} phoneNumber - Numéro du destinataire (format Bénin accepté)
 * @param {string} message - Texte du SMS (court recommandé pour coût)
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
async function sendNotificationSms(phoneNumber, message) {
  const to = formatBenin(phoneNumber);
  if (!to) {
    console.warn('[SMS_NOTIF] Numéro invalide ou manquant:', phoneNumber ? 'présent' : 'manquant');
    return { success: false, error: 'Numéro invalide' };
  }
  if (SMS_MODE === 'echo') {
    console.log(`[SMS NOTIF ECHO] → ${to}: ${message.substring(0, 80)}${message.length > 80 ? '...' : ''}`);
    return { success: true };
  }
  try {
    const brandName = process.env.VONAGE_BRAND_NAME || 'AB Campus Finance';
    const client = getVonageClient();
    const result = await client.sms.send(brandName, to, message);
    if (result.messages[0].status === '0') {
      console.log('[SMS_NOTIF] ✅ Envoyé à', to);
      return { success: true };
    }
    const errText = result.messages[0]['error-text'] || 'Unknown';
    console.error('[SMS_NOTIF] ❌ Échec Vonage:', errText);
    return { success: false, error: errText };
  } catch (err) {
    console.error('[SMS_NOTIF] ❌ Erreur:', err.message);
    return { success: false, error: err.message };
  }
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

    const brandName = process.env.VONAGE_BRAND_NAME || "AB Campus Finance";
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

    const brandName = process.env.VONAGE_BRAND_NAME || "AB Campus Finance";
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

    const brandName = process.env.VONAGE_BRAND_NAME || "AB Campus Finance";
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
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, error: 'Not found' });
  }
  res.json({
    success: true,
    hasApiKey: Boolean(process.env.VONAGE_API_KEY),
    hasApiSecret: Boolean(process.env.VONAGE_API_SECRET),
    hasBrandName: Boolean(process.env.VONAGE_BRAND_NAME),
    smsMode: SMS_MODE
  });
});

// ===== FEDAPAY INTEGRATION =====

// Configuration FedaPay
const FEDAPAY_CONFIG = {
  secretKey: process.env.FEDAPAY_SECRET_KEY,
  publicKey: process.env.FEDAPAY_PUBLIC_KEY,
  baseUrl: (() => {
    let url = process.env.FEDAPAY_BASE_URL;
    // Si l'URL contient /transactions/ID, extraire seulement la base
    if (url && url.includes('/transactions')) {
      url = url.split('/transactions')[0];
    }
    // Si pas d'URL définie, utiliser les valeurs par défaut
    if (!url) {
      url = process.env.FEDAPAY_ENVIRONMENT === 'sandbox' 
        ? 'https://sandbox-api.fedapay.com/v1' 
        : 'https://api.fedapay.com/v1';
    } else if (!url.endsWith('/v1')) {
      // S'assurer que l'URL se termine par /v1
      url = `${url.replace(/\/+$/, '')}/v1`;
    }
    return url;
  })(),
  environment: process.env.FEDAPAY_ENVIRONMENT || 'live',
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

const fedapayMode = (process.env.FEDAPAY_ENVIRONMENT || 'live').toLowerCase() === 'sandbox' ? 'SANDBOX' : 'LIVE';
console.log('[FEDAPAY_SERVER] Configuration chargée:', {
  mode: fedapayMode,
  secretKey: FEDAPAY_CONFIG.secretKey ? `${FEDAPAY_CONFIG.secretKey.substring(0, 10)}...` : 'NON CONFIGURÉE',
  publicKey: FEDAPAY_CONFIG.publicKey ? `${FEDAPAY_CONFIG.publicKey.substring(0, 10)}...` : 'NON CONFIGURÉE',
  baseUrl: FEDAPAY_CONFIG.baseUrl,
  environment: FEDAPAY_CONFIG.environment,
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
    // BACKEND_URL pour le webhook (ngrok en local, URL prod en production)
    // FRONTEND_URL pour les redirections après paiement
    const backendUrl = process.env.BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5000';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    
    const successUrl = `${frontendUrl}/remboursement/success?transaction_id={transaction_id}&amount=${amount}&loan_id=${loanId}&user_id=${userId}`;
    const failureUrl = `${frontendUrl}/remboursement/failure?transaction_id={transaction_id}&amount=${amount}&loan_id=${loanId}&user_id=${userId}`;
    const cancelUrl = `${frontendUrl}/remboursement/cancel?transaction_id={transaction_id}&amount=${amount}&loan_id=${loanId}&user_id=${userId}`;

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

    // Configuration FedaPay depuis les variables d'environnement
    // Si baseUrl contient déjà /v1, on ne l'ajoute pas
    let fedapayBaseUrl;
    if (FEDAPAY_CONFIG.baseUrl) {
      fedapayBaseUrl = FEDAPAY_CONFIG.baseUrl.endsWith('/v1') 
        ? FEDAPAY_CONFIG.baseUrl 
        : `${FEDAPAY_CONFIG.baseUrl}/v1`;
    } else {
      fedapayBaseUrl = process.env.FEDAPAY_ENVIRONMENT === 'live' 
        ? 'https://api.fedapay.com/v1' 
        : 'https://sandbox-api.fedapay.com/v1';
    }

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
        callback_url: `${backendUrl}/api/fedapay/webhook`,
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
      public_key: FEDAPAY_CONFIG.publicKey || process.env.FEDAPAY_PUBLIC_KEY
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

/**
 * Met à jour le statut d'un prêt à "completed" dans la table loans.
 * À appeler dès que le prêt est entièrement remboursé.
 * Nécessite SUPABASE_SERVICE_ROLE_KEY dans .env pour contourner les politiques RLS.
 */
async function setLoanStatusToCompleted(supabaseClient, loanId) {
  if (!supabaseClient || !loanId) return { ok: false, error: 'Paramètres manquants' };
  // Ne mettre à jour que les colonnes qui existent (pas total_penalty_amount ni last_penalty_calculation)
  const { data, error } = await supabaseClient
    .from('loans')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', loanId)
    .select('id, status')
    .single();
  if (error) {
    console.error('[LOAN_STATUS] ❌ Erreur mise à jour table loans (status=completed):', error.message, error.code);
    return { ok: false, error };
  }
  console.log('[LOAN_STATUS] ✅ Table loans: statut mis à "completed" pour prêt', loanId, '→', data?.status);
  return { ok: true, data };
}

/**
 * Recalcule depuis la DB si le prêt est entièrement remboursé et met à jour le statut en "completed" si oui.
 * Appelé après chaque paiement enregistré pour ce prêt (montants non modifiés, recalcul uniquement).
 */
async function syncLoanStatusToCompletedIfFullyPaid(supabaseClient, loanId) {
  if (!supabaseClient || !loanId) return { ok: false, updated: false };
  const { data: loan, error: loanErr } = await supabaseClient
    .from('loans')
    .select('id, amount, interest_rate, status, approved_at, duration, duration_months')
    .eq('id', loanId)
    .single();
  if (loanErr || !loan) {
    console.warn('[LOAN_STATUS] sync: prêt introuvable', loanId, loanErr?.message);
    return { ok: false, updated: false };
  }
  if ((loan.status || '').toLowerCase() === 'completed') {
    return { ok: true, updated: false };
  }
  const principal = parseFloat(loan.amount) || 0;
  const interest = principal * ((loan.interest_rate || 0) / 100);
  let penalty = 0; // Les pénalités seront recalculées si nécessaire
  if (penalty === 0 && loan.approved_at) {
    const durationDays = loan.duration_months != null ? Number(loan.duration_months) : (loan.duration != null ? Number(loan.duration) : 30);
    const due = new Date(loan.approved_at);
    due.setDate(due.getDate() + durationDays);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const daysOverdue = Math.floor((today - due) / (1000 * 60 * 60 * 24));
    if (daysOverdue > 0) {
      // Taux de pénalité par défaut: 2% tous les 5 jours
      const rate = 2.0;
      const periods5 = Math.floor(daysOverdue / 5);
      if (periods5 > 0) {
        const withPenalties = (principal + interest) * Math.pow(1 + rate / 100, periods5);
        penalty = withPenalties - (principal + interest);
      }
    }
  }
  const totalExpected = principal + interest + penalty;
  const { data: payments, error: payErr } = await supabaseClient
    .from('payments')
    .select('amount')
    .eq('loan_id', loanId)
    .eq('status', 'completed');
  if (payErr) {
    console.warn('[LOAN_STATUS] sync: erreur paiements', payErr.message);
    return { ok: false, updated: false };
  }
  const totalPaid = (payments || []).reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const tolerance = 100;
  const fullyPaid = totalPaid >= totalExpected - tolerance;
  console.log('[LOAN_STATUS] sync:', { loanId, totalExpected, totalPaid, fullyPaid });
  if (!fullyPaid) return { ok: true, updated: false };
  const result = await setLoanStatusToCompleted(supabaseClient, loanId);
  return { ok: result.ok, updated: result.ok };
}

/**
 * Fonction helper pour envoyer les notifications de remboursement (client + admin)
 * Peut être appelée depuis le webhook ou depuis le job de vérification.
 * @param {string} loanId - ID du prêt
 * @param {string} userId - ID de l'utilisateur
 * @param {number} amount - Montant
 * @param {string} [paymentId] - ID du paiement dans la table payments (optionnel). Si fourni, on ne notifie qu'une seule fois par paiement.
 * @param {string} [transactionId] - ID de la transaction FedaPay (optionnel). Plus fiable pour éviter les doublons.
 */
async function sendRepaymentNotifications(loanId, userId, amount, paymentId, transactionId = null) {
  try {
    // ⚠️ PROTECTION RENFORCÉE CONTRE LES DOUBLONS
    
    // PROTECTION 1 : Si transactionId fourni (le plus fiable), vérifier par transaction_id
    if (transactionId) {
      // Vérifier dans la table payments si un paiement avec ce transaction_id existe déjà
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('transaction_id', transactionId)
        .limit(1);
      
      if (existingPayment && existingPayment.length > 0) {
        // Vérifier si une notification existe déjà pour ce paiement
        const paymentDbId = existingPayment[0].id;
        const { data: existingNotif1 } = await supabase
          .from('notifications')
          .select('id, created_at')
          .eq('type', 'loan_repayment')
          .eq('user_id', userId)
          .filter('data->>payment_id', 'eq', paymentDbId)
          .limit(1);
        
        const { data: existingNotif2 } = await supabase
          .from('notifications')
          .select('id, created_at')
          .eq('type', 'loan_repayment')
          .eq('user_id', userId)
          .contains('data', { transaction_id: transactionId })
          .limit(1);
        
        if ((existingNotif1 && existingNotif1.length > 0) || (existingNotif2 && existingNotif2.length > 0)) {
          const found = existingNotif1?.[0] || existingNotif2?.[0];
          console.log('[REPAYMENT_NOTIF] ⚠️ Notification déjà envoyée pour cette transaction (transaction_id)', transactionId.substring(0, 8), 'à', found?.created_at, '(évite doublon)');
          return false;
        }
      }
    }
    
    // PROTECTION 2 : Si paymentId fourni (ID de la table payments), vérifier de manière plus robuste
    if (paymentId) {
      // Méthode 1 : Vérifier avec contains (JSONB)
      const { data: existingByPayment1 } = await supabase
        .from('notifications')
        .select('id, created_at')
        .eq('type', 'loan_repayment')
        .eq('user_id', userId)
        .contains('data', { payment_id: paymentId })
        .limit(1);
      
      // Méthode 2 : Vérifier aussi avec une requête textuelle sur le JSONB (plus robuste)
      const { data: existingByPayment2 } = await supabase
        .from('notifications')
        .select('id, created_at')
        .eq('type', 'loan_repayment')
        .eq('user_id', userId)
        .filter('data->>payment_id', 'eq', paymentId)
        .limit(1);
      
      // Si l'une des deux méthodes trouve une notification, on skip
      if ((existingByPayment1 && existingByPayment1.length > 0) || (existingByPayment2 && existingByPayment2.length > 0)) {
        const found = existingByPayment1?.[0] || existingByPayment2?.[0];
        console.log('[REPAYMENT_NOTIF] ⚠️ Notification déjà envoyée pour ce paiement (payment_id)', paymentId.substring(0, 8), 'à', found?.created_at, '(évite doublon)');
        return false;
      }
    }
    
    // PROTECTION 2 : Sinon, vérifier qu'aucune notif pour ce prêt dans les 10 dernières minutes (augmenté de 5 à 10 min)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    // Vérifier pour le client
    const { data: existingClientNotif } = await supabase
      .from('notifications')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('type', 'loan_repayment')
      .filter('data->>loan_id', 'eq', loanId)
      .gte('created_at', tenMinutesAgo.toISOString())
      .limit(1);
    
    if (existingClientNotif && existingClientNotif.length > 0) {
      console.log('[REPAYMENT_NOTIF] ⚠️ Notification client déjà envoyée récemment pour ce remboursement à', existingClientNotif[0].created_at, '(évite doublon)');
      return false;
    }
    
    const { data: clientData } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();
    
    if (!clientData) {
      console.log('[REPAYMENT_NOTIF] Client non trouvé pour userId:', userId);
      return false;
    }
    
    const clientName = `${clientData.first_name} ${clientData.last_name}`;
    const amountFormatted = `${parseInt(amount).toLocaleString()} FCFA`;
    const clientTitle = 'Remboursement confirmé ✅';
    const clientMessage = `Votre remboursement de ${amountFormatted} pour le prêt #${loanId.substring(0, 8)}... a été confirmé. Merci pour votre confiance !`;
    
    // 1. Notification client (DB + FCM)
    const clientNotifData = {
      loan_id: loanId,
      amount: amount,
      status: 'completed'
    };
    if (paymentId) clientNotifData.payment_id = paymentId;
    if (transactionId) clientNotifData.transaction_id = transactionId;
    
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: clientTitle,
        message: clientMessage,
        type: 'loan_repayment',
        data: clientNotifData,
        read: false
      });
    
    console.log('[REPAYMENT_NOTIF] ✅ Notification client créée dans la DB');
    
    // FCM pour le client
    const clientFcmData = {
      url: '/repayment',
      type: 'loan_repayment',
      loanId: loanId,
      amount: amount.toString(),
      status: 'completed'
    };
    if (paymentId) clientFcmData.payment_id = paymentId;
    if (transactionId) clientFcmData.transaction_id = transactionId;
    
    const clientFcmResult = await sendFCMNotificationWithDuplicateCheck(userId, clientTitle, clientMessage, clientFcmData);
    
    if (clientFcmResult.success) {
      console.log('[REPAYMENT_NOTIF] ✅ Notification FCM client envoyée');
    } else {
      console.log('[REPAYMENT_NOTIF] ⚠️ Client sans token FCM');
    }
    
    // 2. Notification admin (DB + FCM)
    const { data: adminData } = await supabase
      .from('users')
      .select('id, first_name')
      .eq('role', 'admin')
      .limit(1)
      .single();
    
    if (adminData) {
      // ⚠️ PROTECTION CONTRE LES DOUBLONS : Vérifier si l'admin a déjà reçu une notification pour ce remboursement
      let existingAdminNotif = null;
      if (paymentId) {
        // Méthode 1 : Vérifier avec contains
        const r1 = await supabase
          .from('notifications')
          .select('id, created_at')
          .eq('user_id', adminData.id)
          .eq('type', 'loan_repayment')
          .contains('data', { payment_id: paymentId })
          .limit(1);
        
        // Méthode 2 : Vérifier avec filter (plus robuste)
        const r2 = await supabase
          .from('notifications')
          .select('id, created_at')
          .eq('user_id', adminData.id)
          .eq('type', 'loan_repayment')
          .filter('data->>payment_id', 'eq', paymentId)
          .limit(1);
        
        existingAdminNotif = r1.data?.length > 0 ? r1.data : (r2.data?.length > 0 ? r2.data : null);
      } else {
        const r = await supabase
          .from('notifications')
          .select('id, created_at')
          .eq('user_id', adminData.id)
          .eq('type', 'loan_repayment')
          .filter('data->>loan_id', 'eq', loanId)
          .filter('data->>user_id', 'eq', userId)
          .gte('created_at', tenMinutesAgo.toISOString())
          .limit(1);
        existingAdminNotif = r.data;
      }
      
      if (!existingAdminNotif || existingAdminNotif.length === 0) {
        const adminTitle = "Remboursement reçu ✅";
        const adminBody = `${clientName} vient d'effectuer un remboursement de ${amountFormatted}. Prêt #${loanId.substring(0, 8)}...`;
        
        // ⚠️ CRÉER LA NOTIFICATION DANS LA DB AVANT D'ENVOYER FCM (pour éviter les race conditions)
        const adminNotifData = {
          loan_id: loanId,
          client_name: clientName,
          amount: amount,
          user_id: userId
        };
        if (paymentId) adminNotifData.payment_id = paymentId;
        if (transactionId) adminNotifData.transaction_id = transactionId;
        
        // ⚠️ VÉRIFICATION FINALE AVANT INSERTION (protection contre race condition)
        let finalCheck = null;
        if (transactionId) {
          // Si transaction_id disponible, vérifier par transaction_id (le plus fiable)
          const { data: check1 } = await supabase
            .from('notifications')
            .select('id, created_at')
            .eq('user_id', adminData.id)
            .eq('type', 'loan_repayment')
            .filter('data->>transaction_id', 'eq', transactionId)
            .limit(1);
          finalCheck = check1;
          
          if (!finalCheck || finalCheck.length === 0) {
            const { data: check2 } = await supabase
              .from('notifications')
              .select('id, created_at')
              .eq('user_id', adminData.id)
              .eq('type', 'loan_repayment')
              .contains('data', { transaction_id: transactionId })
              .limit(1);
            if (check2 && check2.length > 0) finalCheck = check2;
          }
        } else if (paymentId) {
          // Si payment_id disponible, vérifier par payment_id
          const { data: check1 } = await supabase
            .from('notifications')
            .select('id, created_at')
            .eq('user_id', adminData.id)
            .eq('type', 'loan_repayment')
            .filter('data->>payment_id', 'eq', paymentId)
            .limit(1);
          finalCheck = check1;
          
          if (!finalCheck || finalCheck.length === 0) {
            const { data: check2 } = await supabase
              .from('notifications')
              .select('id, created_at')
              .eq('user_id', adminData.id)
              .eq('type', 'loan_repayment')
              .contains('data', { payment_id: paymentId })
              .limit(1);
            if (check2 && check2.length > 0) finalCheck = check2;
          }
        } else {
          // Sinon vérifier par loan_id + user_id
          const { data: check1 } = await supabase
            .from('notifications')
            .select('id, created_at')
            .eq('user_id', adminData.id)
            .eq('type', 'loan_repayment')
            .filter('data->>loan_id', 'eq', loanId)
            .filter('data->>user_id', 'eq', userId)
            .limit(1);
          finalCheck = check1;
        }
        
        if (finalCheck && finalCheck.length > 0) {
          console.log('[REPAYMENT_NOTIF] ⚠️ Notification admin déjà créée (race condition évitée) à', finalCheck[0].created_at);
          return true; // Ne pas créer de doublon
        }
        
        const { data: insertedNotif, error: insertError } = await supabase
          .from('notifications')
          .insert({
            user_id: adminData.id,
            title: adminTitle,
            message: adminBody,
            type: 'loan_repayment',
            data: adminNotifData,
            read: false
          })
          .select()
          .single();
        
        if (insertError) {
          // Si erreur d'insertion (peut être un doublon), vérifier à nouveau
          if (insertError.code === '23505') { // Violation de contrainte unique
            console.log('[REPAYMENT_NOTIF] ⚠️ Notification admin déjà existante (contrainte unique)');
            return true;
          }
          console.error('[REPAYMENT_NOTIF] ❌ Erreur création notification admin:', insertError);
        } else {
          console.log('[REPAYMENT_NOTIF] ✅ Notification admin créée dans la DB');
        }
        
        const adminFcmData = {
          url: '/admin/loan-requests',
          type: 'loan_repayment',
          loanId: loanId,
          amount: amountFormatted,
          clientName: clientName,
          userId: userId
        };
        if (paymentId) adminFcmData.payment_id = paymentId;
        if (transactionId) adminFcmData.transaction_id = transactionId;
        
        // Envoyer FCM (la fonction wrapper vérifie aussi les doublons)
        const adminFcmResult = await sendFCMNotificationWithDuplicateCheck(adminData.id, adminTitle, adminBody, adminFcmData);
        
        if (adminFcmResult.success) {
          console.log('[REPAYMENT_NOTIF] ✅ Notification FCM admin envoyée');
        } else if (adminFcmResult.duplicate) {
          console.log('[REPAYMENT_NOTIF] ⚠️ Notification FCM admin déjà envoyée (doublon évité)');
        } else {
          console.log('[REPAYMENT_NOTIF] ⚠️ Admin sans token FCM ou erreur:', adminFcmResult.error);
        }
      } else {
        const found = existingAdminNotif[0];
        console.log('[REPAYMENT_NOTIF] ⚠️ Notification admin déjà envoyée récemment pour ce remboursement à', found?.created_at, '(évite doublon)');
      }
    }
    return true; // notifications envoyées
  } catch (error) {
    console.error('[REPAYMENT_NOTIF] ❌ Erreur envoi notifications:', error);
    return false;
  }
}

// Cache pour éviter de traiter plusieurs fois la même transaction webhook (en mémoire)
const webhookProcessedCache = new Map();
const WEBHOOK_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Nettoyer le cache toutes les 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of webhookProcessedCache.entries()) {
    if (now - timestamp > WEBHOOK_CACHE_DURATION) {
      webhookProcessedCache.delete(key);
    }
  }
}, 10 * 60 * 1000);

// Webhook FedaPay pour recevoir les confirmations de paiement
app.post('/api/fedapay/webhook', async (req, res) => {
  // Log IMMÉDIATEMENT pour voir si la route est atteinte
  console.log('[FEDAPAY_WEBHOOK] ========== WEBHOOK DÉCLENCHÉ ==========');
  console.log('[FEDAPAY_WEBHOOK] Méthode:', req.method);
  console.log('[FEDAPAY_WEBHOOK] URL:', req.url);
  console.log('[FEDAPAY_WEBHOOK] Headers présents:', Object.keys(req.headers));
  
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

    const isValid = verifyFedaPaySignature(rawData, signature, process.env.FEDAPAY_SECRET_KEY);
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
    
    // ⚠️ PROTECTION CONTRE LES DOUBLONS : Vérifier si cette transaction a déjà été traitée
    const transactionKey = `webhook-${transaction.id}`;
    const cachedTimestamp = webhookProcessedCache.get(transactionKey);
    const now = Date.now();
    
    if (cachedTimestamp && (now - cachedTimestamp) < WEBHOOK_CACHE_DURATION) {
      console.log('[FEDAPAY_WEBHOOK] ⚠️ Transaction déjà traitée récemment (cache), évite doublon:', transaction.id);
      return res.status(200).json({ success: true, message: 'Transaction déjà traitée' });
    }
    
    // Vérifier aussi dans la DB si un paiement existe déjà pour cette transaction_id
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, created_at, loan_id')
      .eq('transaction_id', transaction.id)
      .limit(1);
    
    if (existingPayment && existingPayment.length > 0) {
      // Vérifier si une notification a déjà été envoyée pour ce paiement (par transaction_id)
      const { data: existingNotif1 } = await supabase
        .from('notifications')
        .select('id, created_at')
        .eq('type', 'loan_repayment')
        .filter('data->>transaction_id', 'eq', transaction.id)
        .limit(1);
      
      const { data: existingNotif2 } = await supabase
        .from('notifications')
        .select('id, created_at')
        .eq('type', 'loan_repayment')
        .filter('data->>payment_id', 'eq', existingPayment[0].id)
        .limit(1);
      
      if ((existingNotif1 && existingNotif1.length > 0) || (existingNotif2 && existingNotif2.length > 0)) {
        const found = existingNotif1?.[0] || existingNotif2?.[0];
        console.log('[FEDAPAY_WEBHOOK] ⚠️ Transaction déjà traitée et notifiée, évite doublon:', transaction.id, 'Notif à', found?.created_at);
        // Important : s'assurer que le prêt est bien passé à "completed" (au cas où la 1ère fois ça a échoué)
        const loanIdFromPayment = existingPayment[0].loan_id;
        if (loanIdFromPayment) {
          const syncResult = await syncLoanStatusToCompletedIfFullyPaid(supabase, loanIdFromPayment);
          if (syncResult.updated) {
            console.log('[FEDAPAY_WEBHOOK] ✅ Statut prêt corrigé → completed (après détection doublon)');
          }
        }
        webhookProcessedCache.set(transactionKey, now);
        return res.status(200).json({ success: true, message: 'Transaction déjà traitée et notifiée' });
      }
    }
    
    // Ne pas mettre en cache ici : on mettra le cache uniquement après avoir créé le paiement avec succès.
    // Sinon un premier échec (métadonnées manquantes, erreur DB) + retry FedaPay renverrait "déjà traité" sans rien en base.

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
    
    console.log('[FEDAPAY_WEBHOOK] 🔍 Extraction paymentType:', {
      'metadata.type': transaction.metadata?.type,
      'custom_metadata.type': transaction.custom_metadata?.type,
      'custom_metadata.paymentType': transaction.custom_metadata?.paymentType,
      'custom_metadata.payment_type': transaction.custom_metadata?.payment_type,
      'paymentType final': paymentType
    });
    
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
      console.log(`[FEDAPAY_WEBHOOK] ✅ Transaction confirmée - Status: ${transaction.status}`);
      console.log(`[FEDAPAY_WEBHOOK] 🔍 Vérification conditions:`, {
        paymentType,
        loanId: !!loanId,
        userId: !!userId,
        hasLoanId: !!loanId,
        hasUserId: !!userId,
        'paymentType === loan_repayment': paymentType === 'loan_repayment',
        'paymentType === "loan_repayment"': paymentType === "loan_repayment"
      });
      
      // Normaliser paymentType pour être sûr
      const normalizedPaymentType = paymentType?.toLowerCase?.() || paymentType;
      const isLoanRepayment = normalizedPaymentType === 'loan_repayment' || paymentType === 'loan_repayment';
      
      console.log(`[FEDAPAY_WEBHOOK] 🔍 Normalisation paymentType:`, {
        original: paymentType,
        normalized: normalizedPaymentType,
        isLoanRepayment
      });
      
      if (!isLoanRepayment || !loanId || !userId) {
        console.warn('[FEDAPAY_WEBHOOK] ⚠️ Transaction ignorée (remboursement prêt): metadata manquantes ou type incorrect', {
          isLoanRepayment,
          loanId: loanId || '(manquant)',
          userId: userId || '(manquant)',
          paymentType: paymentType || '(manquant)',
          description: transaction.description
        });
      }
      
      if (isLoanRepayment && loanId && userId) {
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
            supabaseUrl: process.env.SUPABASE_URL ? 'Configurée' : 'Manquante'
          });

          // 1. Vérifier si le paiement existe déjà (idempotence)
          const { data: existingPayment } = await supabase
            .from('payments')
            .select('id')
            .eq('transaction_id', transaction.id)
            .maybeSingle();

          let paymentData;
          
          if (existingPayment) {
            console.log('[FEDAPAY_WEBHOOK] ⚠️ Paiement déjà existant, évite le doublon:', {
              payment_id: existingPayment.id,
              transaction_id: transaction.id
            });
            // Retourner le paiement existant au lieu de créer un doublon
            const { data: existingPaymentData } = await supabase
              .from('payments')
              .select('*')
              .eq('id', existingPayment.id)
              .single();
            
            paymentData = existingPaymentData;
            console.log('[FEDAPAY_WEBHOOK] ✅ Utilisation du paiement existant:', paymentData);
            
            // ⚠️ Vérifier si une notification a déjà été envoyée pour ce paiement
            const { data: existingNotif } = await supabase
              .from('notifications')
              .select('id, created_at')
              .eq('type', 'loan_repayment')
              .eq('user_id', userId)
              .filter('data->>payment_id', 'eq', existingPayment.id)
              .limit(1);
            
            if (existingNotif && existingNotif.length > 0) {
              console.log('[FEDAPAY_WEBHOOK] ⚠️ Notification déjà envoyée pour ce paiement, évite doublon. Notif créée à:', existingNotif[0].created_at);
              // S'assurer que le prêt est bien à jour (au cas où la 1ère fois la mise à jour a échoué)
              const syncResult = await syncLoanStatusToCompletedIfFullyPaid(supabase, loanId);
              if (syncResult.updated) {
                console.log('[FEDAPAY_WEBHOOK] ✅ Statut prêt corrigé → completed (paiement existant, notif déjà envoyée)');
              }
              return res.status(200).json({ success: true, message: 'Transaction déjà traitée et notifiée' });
            }
            // Si pas de notification, on continue pour l'envoyer
          } else {
            // Créer l'enregistrement de paiement seulement s'il n'existe pas
            const { data: newPaymentData, error: paymentError } = await supabase
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

            paymentData = newPaymentData;
            console.log('[FEDAPAY_WEBHOOK] ✅ Paiement créé:', paymentData);
          }

          console.log('[FEDAPAY_WEBHOOK] ✅ Paiement créé:', paymentData);

          // 2. Vérifier que le montant payé couvre bien capital + intérêts + pénalités
          console.log('[FEDAPAY_WEBHOOK] 🔍 Vérification montant payé vs montant dû...');
          
          // Récupérer le prêt avec toutes ses informations
          const { data: loanData, error: loanFetchError } = await supabase
            .from('loans')
            .select('id, amount, interest_rate, status, approved_at, duration, duration_months')
            .eq('id', loanId)
            .single();

          if (loanFetchError) {
            console.error('[FEDAPAY_WEBHOOK] ❌ Erreur récupération prêt:', loanFetchError);
            throw loanFetchError;
          }

          // Calculer le montant total attendu : capital + intérêts + pénalités
          const principalAmount = parseFloat(loanData.amount) || 0;
          const interestAmount = principalAmount * ((loanData.interest_rate || 0) / 100);
          const totalOriginalAmount = principalAmount + interestAmount;
          
          // Calculer les pénalités si le prêt est en retard
          let penaltyAmount = 0;
          
          // Si pénalités à 0 mais prêt en retard, recalculer
          if (penaltyAmount === 0 && loanData.approved_at) {
            const durationDays = loanData.duration_months != null
              ? Number(loanData.duration_months)
              : (loanData.duration != null ? Number(loanData.duration) : 30);
            
            const approvedDate = new Date(loanData.approved_at);
            const dueDate = new Date(approvedDate);
            dueDate.setDate(dueDate.getDate() + durationDays);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);
            const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
            
            if (daysOverdue > 0) {
              // Calculer les pénalités selon le nouveau système (2% tous les 5 jours complets)
              const penaltyRate = 2.0; // Taux de pénalité par défaut
              const periodsOf5Days = Math.floor(daysOverdue / 5);
              
              if (periodsOf5Days > 0) {
                const amountWithPenalties = totalOriginalAmount * Math.pow(1 + (penaltyRate / 100), periodsOf5Days);
                penaltyAmount = amountWithPenalties - totalOriginalAmount;
                console.log(`[FEDAPAY_WEBHOOK] 💰 Pénalités recalculées: ${penaltyAmount.toFixed(2)} FCFA (${periodsOf5Days} périodes de 5 jours)`);
              }
            }
          }
          
          const totalExpectedAmount = totalOriginalAmount + penaltyAmount;
          
          // Récupérer le total déjà payé (somme de tous les paiements pour ce prêt)
          const { data: allPayments, error: paymentsError } = await supabase
            .from('payments')
            .select('amount')
            .eq('loan_id', loanId)
            .eq('status', 'completed');
          
          if (paymentsError) {
            console.error('[FEDAPAY_WEBHOOK] ❌ Erreur récupération paiements:', paymentsError);
            throw paymentsError;
          }
          
          const totalPaidAmount = allPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
          const remainingAmount = Math.max(0, totalExpectedAmount - totalPaidAmount);
          
          console.log('[FEDAPAY_WEBHOOK] 💰 Calcul montant:', {
            principalAmount,
            interestAmount,
            penaltyAmount,
            totalExpectedAmount,
            totalPaidAmount,
            remainingAmount,
            currentPayment: transaction.amount
          });

          // 3. Mettre à jour le statut du prêt dans la table loans (obligatoire : completed quand remboursé entièrement)
          const isFullyPaid = remainingAmount <= 1 || totalPaidAmount >= totalExpectedAmount - 1;
          const newStatus = isFullyPaid ? 'completed' : 'active';
          
          console.log('[FEDAPAY_WEBHOOK] 🔄 Mise à jour table loans:', { 
            loanId, 
            newStatus,
            isFullyPaid,
            remainingAmount
          });

          if (isFullyPaid) {
            const result = await setLoanStatusToCompleted(supabase, loanId);
            if (!result.ok) {
              console.error('[FEDAPAY_WEBHOOK] ❌ La table loans n’a pas pu être mise à jour. Ajoutez SUPABASE_SERVICE_ROLE_KEY dans backend/.env (Supabase → Paramètres → API → clé service_role) pour que le statut passe à "completed".');
            }
          } else {
            const { data: updatedLoan, error: loanError } = await supabase
              .from('loans')
              .update({ status: 'active', updated_at: new Date().toISOString() })
              .eq('id', loanId)
              .select()
              .single();
            if (loanError) {
              console.error('[FEDAPAY_WEBHOOK] ❌ Erreur mise à jour prêt (table loans):', loanError);
              throw loanError;
            }
            console.log('[FEDAPAY_WEBHOOK] ✅ Table loans: statut maintenu → active');
          }
          
          if (!isFullyPaid) {
            console.log(`[FEDAPAY_WEBHOOK] ⚠️ Prêt partiellement remboursé. Reste à payer: ${remainingAmount.toLocaleString()} FCFA`);
          }

          // 4. Sync statut depuis la DB : recalcul total payé vs total dû, passer à "completed" si remboursé
          const syncResult = await syncLoanStatusToCompletedIfFullyPaid(supabase, loanId);
          if (syncResult.updated) {
            console.log('[FEDAPAY_WEBHOOK] ✅ Statut prêt synchronisé → completed');
          }

          // 1. NOTIFIER LE CLIENT ET L'ADMIN (via fonction helper)
          // ⚠️ IMPORTANT : Passer paymentData.id ET transaction.id pour éviter les doublons
          try {
            console.log('[FEDAPAY_WEBHOOK] 📢 Envoi notifications remboursement');
            const paymentIdForNotif = paymentData?.id || null;
            const transactionIdForNotif = transaction.id || null; // transaction_id de FedaPay
            await sendRepaymentNotifications(loanId, userId, transaction.amount, paymentIdForNotif, transactionIdForNotif);
            console.log('[FEDAPAY_WEBHOOK] ✅ Notifications envoyées');
          } catch (notifError) {
            console.error('[FEDAPAY_WEBHOOK] ❌ Erreur lors de la notification:', notifError);
            console.error('[FEDAPAY_WEBHOOK] ❌ Stack trace:', notifError.stack);
            // Ne pas faire échouer le webhook si la notification échoue
          }

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
          // Marquer comme traité seulement après succès (permet à FedaPay de retry si erreur avant)
          webhookProcessedCache.set(transactionKey, Date.now());
          
        } catch (error) {
          console.error('[FEDAPAY_WEBHOOK] ❌ Erreur lors du traitement du remboursement:', error);
          console.error('[FEDAPAY_WEBHOOK] ❌ Stack trace:', error.stack);
          // Supprimer le cache pour permettre à FedaPay de réessayer (évite "déjà traité" alors qu'aucun paiement en base)
          webhookProcessedCache.delete(transactionKey);
          // Ne pas retourner d'erreur HTTP pour éviter que FedaPay réessaie indéfiniment
          // Mais logger l'erreur pour investigation manuelle
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

          // Vérifier si le plan existe déjà (idempotence) - éviter les doublons
          const { data: existingPlan } = await supabase
            .from('savings_plans')
            .select('id')
            .eq('transaction_reference', transaction.reference)
            .maybeSingle();

          let plan;
          
          if (existingPlan) {
            console.log('[FEDAPAY_WEBHOOK] ⚠️ Plan d\'épargne déjà existant, évite le doublon:', {
              plan_id: existingPlan.id,
              transaction_reference: transaction.reference
            });
            
            // Récupérer le plan existant
            const { data: existingPlanData } = await supabase
              .from('savings_plans')
              .select('*')
              .eq('id', existingPlan.id)
              .single();
            
            plan = existingPlanData;
            console.log('[FEDAPAY_WEBHOOK] ✅ Utilisation du plan existant:', plan);
          } else {
            // Créer le plan d'épargne seulement s'il n'existe pas
            const { data: newPlan, error: planErr } = await supabase
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

            plan = newPlan;

            // Tracer les frais de création dans savings_transactions
            await supabase
              .from('savings_transactions')
              .insert({
                user_id: userId,
                savings_plan_id: plan.id,
                transaction_type: 'creation_fee',
                amount: transaction.amount || 1000,
                transaction_reference: transaction.reference,
                status: 'completed',
                created_at: new Date().toISOString()
              });
          }

          console.log('[FEDAPAY_WEBHOOK] 🎉 Plan d\'épargne créé avec succès:', {
            id: plan.id,
            transaction_reference: plan.transaction_reference,
            status: plan.status,
            total_amount_target: plan.total_amount_target
          });

          // Créer une notification pour le client
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('first_name, last_name')
              .eq('id', userId)
              .single();

            if (userData) {
              const clientName = `${userData.first_name} ${userData.last_name}`;
              const targetAmount = `${parseInt(totalAmountTarget).toLocaleString()} FCFA`;
              
              await supabase
                .from('notifications')
                .insert({
                  user_id: userId,
                  title: 'Plan d\'épargne créé avec succès 🎉',
                  message: `Bonjour ${clientName}, votre plan d'épargne a été créé avec succès ! Objectif : ${targetAmount} sur ${durationMonths} mois.`,
                  type: 'savings_plan_created',
                  data: {
                    plan_id: plan.id,
                    total_amount_target: totalAmountTarget,
                    duration_months: durationMonths,
                    fixed_amount: fixedAmount
                  },
                  read: false
                });
              
              console.log('[FEDAPAY_WEBHOOK] ✅ Notification de création de plan créée dans la DB');
            }
          } catch (notifError) {
            console.error('[FEDAPAY_WEBHOOK] ❌ Erreur création notification plan:', notifError);
          }
          
        } catch (error) {
          console.error('[FEDAPAY_WEBHOOK] ❌ Erreur lors de la création du plan d\'épargne:', error);
          throw error; // Propage l'erreur → FedaPay recevra 500 et réessaiera
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

          // Ne pas accepter de dépôt si le plan est suspendu (7+ jours de retard)
          if (currentPlan.is_suspended) {
            console.log('[FEDAPAY_WEBHOOK] ⚠️ Dépôt ignoré : plan #' + planId + ' est suspendu');
            return res.status(200).json({ success: true, ignored: true, reason: 'plan_suspended' });
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
          
          // Vérifier si la transaction d'épargne existe déjà (idempotence)
          const { data: existingSavingsTransaction } = await supabase
            .from('savings_transactions')
            .select('id')
            .eq('transaction_reference', transaction.reference)
            .maybeSingle();
          
          if (!existingSavingsTransaction) {
            // Créer une entrée dans savings_transactions seulement si elle n'existe pas
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
            } else {
              console.log('[FEDAPAY_WEBHOOK] ✅ Transaction d\'épargne créée');
            }
          } else {
            console.log('[FEDAPAY_WEBHOOK] ⚠️ Transaction d\'épargne déjà existante, évite le doublon:', {
              transaction_id: existingSavingsTransaction.id,
              reference: transaction.reference
            });
          }
          
          // Vérifier si l'objectif est atteint et notifier l'admin + client
          const targetAmount = updatedPlan.total_amount_target || updatedPlan.target_amount || 0;
          if (newCurrentBalance >= targetAmount && targetAmount > 0 && updatedPlan.status === 'active') {
            console.log('[FEDAPAY_WEBHOOK] 🎯 Objectif atteint ! Notifications admin + client...');
            try {
              await notifyAdminPlanGoalReached(planId, userId, newCurrentBalance, targetAmount);
            } catch (goalError) {
              console.error('[FEDAPAY_WEBHOOK] ❌ Erreur notification objectif atteint:', goalError);
            }
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
              const notificationResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/notify-savings-deposit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  clientName,
                  amount: amountFormatted,
                  userId,
                  planId: planId
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
        console.log('[FEDAPAY_WEBHOOK] ⚠️ Paiement confirmé mais conditions non remplies');
        
        // Normaliser paymentType ici aussi pour vérifier
        const normalizedPaymentType = paymentType?.toLowerCase?.() || paymentType;
        const isLoanRepayment = normalizedPaymentType === 'loan_repayment' || paymentType === 'loan_repayment';
        
        console.log('[FEDAPAY_WEBHOOK] Détails:', { 
          loanId, 
          userId, 
          paymentType,
          normalizedPaymentType,
          isLoanRepayment,
          status: transaction.status,
          hasLoanId: !!loanId,
          hasUserId: !!userId,
          'paymentType === loan_repayment': paymentType === 'loan_repayment',
          metadata: transaction.metadata,
          custom_metadata: transaction.custom_metadata,
          description: transaction.description
        });
        
        // Si c'est un remboursement mais qu'il manque juste paymentType, essayer de le traiter quand même
        if ((transaction.description?.includes('Remboursement') || transaction.description?.includes('remboursement')) && loanId && userId && !isLoanRepayment) {
          console.log('[FEDAPAY_WEBHOOK] 🔧 Tentative de traitement avec paymentType forcé à "loan_repayment"');
          // Forcer paymentType et traiter comme remboursement
          try {
            await sendRepaymentNotifications(loanId, userId, transaction.amount);
            console.log('[FEDAPAY_WEBHOOK] ✅ Notifications envoyées avec paymentType forcé');
          } catch (notifError) {
            console.error('[FEDAPAY_WEBHOOK] ❌ Erreur notifications avec paymentType forcé:', notifError);
          }
        }
        
        // Si c'est un remboursement mais qu'il manque des infos, logger pour investigation
        if (transaction.description?.includes('Remboursement') || transaction.description?.includes('remboursement')) {
          console.error('[FEDAPAY_WEBHOOK] 🚨 ALERTE: Remboursement détecté mais non traité !', {
            transaction_id: transaction.id,
            amount: transaction.amount,
            description: transaction.description,
            metadata: transaction.metadata,
            custom_metadata: transaction.custom_metadata
          });
        }
      }
    } else if (transaction.status === 'failed') {
      console.log('[FEDAPAY_WEBHOOK] ❌ Transaction échouée');
    } else if (transaction.status === 'cancelled') {
      console.log('[FEDAPAY_WEBHOOK] ❌ Transaction annulée');
    } else {
      console.log(`[FEDAPAY_WEBHOOK] ℹ️ Statut non géré: ${transaction.status}`);
    }

    console.log('[FEDAPAY_WEBHOOK] ✅ Webhook traité avec succès');
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[FEDAPAY_WEBHOOK] ❌ Erreur générale webhook:', error);
    console.error('[FEDAPAY_WEBHOOK] ❌ Stack trace:', error.stack);
    console.error('[FEDAPAY_WEBHOOK] ❌ Message:', error.message);
    // Retourner 500 pour que FedaPay réessaie (erreur réelle de traitement)
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Route GET pour obtenir des infos sur les paiements manquants (sans les traiter)
app.get('/api/fedapay/process-all-missing-payments', async (req, res) => {
  try {
    const { supabase } = require('./utils/supabaseClient-server');
    
    // Compter les paiements complétés avec des prêts encore actifs/overdue
    const { data: payments, error } = await supabase
      .from('payments')
      .select('id, loan_id, status')
      .eq('status', 'completed')
      .not('transaction_id', 'is', null)
      .limit(100);
    
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
    
    let missingCount = 0;
    const missingLoans = [];
    
    for (const payment of payments || []) {
      if (!payment.loan_id) continue;
      
      const { data: loan } = await supabase
        .from('loans')
        .select('id, status')
        .eq('id', payment.loan_id)
        .single();
      
      if (loan && loan.status !== 'completed') {
        missingCount++;
        if (missingLoans.length < 10) {
          missingLoans.push({ loan_id: loan.id, status: loan.status });
        }
      }
    }
    
    return res.json({
      info: 'Utilisez POST pour traiter les paiements manquants',
      missing_payments_count: missingCount,
      sample_missing_loans: missingLoans,
      endpoint: 'POST /api/fedapay/process-all-missing-payments'
    });
    
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour traiter tous les paiements existants non traités (récupère depuis la DB)
app.post('/api/fedapay/process-all-missing-payments', async (req, res) => {
  try {
    console.log('[PROCESS_MISSING] 🔍 Recherche des paiements non traités...');
    
    const { supabase } = require('./utils/supabaseClient-server');
    
    // Récupérer tous les paiements complétés qui ont un transaction_id FedaPay
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, loan_id, user_id, amount, transaction_id, status, created_at')
      .eq('status', 'completed')
      .not('transaction_id', 'is', null)
      .order('created_at', { ascending: false });
    
    if (paymentsError) {
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur récupération paiements: ' + paymentsError.message 
      });
    }
    
    console.log(`[PROCESS_MISSING] 📊 ${payments.length} paiement(s) trouvé(s)`);
    
    let processed = 0;
    let errors = 0;
    const results = [];
    
    for (const payment of payments) {
      try {
        const transactionId = payment.transaction_id;
        const loanId = payment.loan_id;
        const userId = payment.user_id;
        
        if (!loanId || !userId) {
          console.log(`[PROCESS_MISSING] ⚠️ Paiement #${payment.id} ignoré: loan_id ou user_id manquant`);
          continue;
        }
        
        // Vérifier si le prêt est toujours actif/overdue (donc non traité)
        const { data: loan } = await supabase
          .from('loans')
          .select('id, status')
          .eq('id', loanId)
          .single();
        
        if (!loan) {
          console.log(`[PROCESS_MISSING] ⚠️ Prêt #${loanId} non trouvé pour paiement #${payment.id}`);
          continue;
        }
        
        // Si le prêt est déjà complété, passer au suivant
        if (loan.status === 'completed') {
          continue;
        }
        
        // Traiter ce paiement
        console.log(`[PROCESS_MISSING] 🔄 Traitement paiement #${payment.id} pour prêt #${loanId}`);
        
        // Utiliser la fonction syncLoanStatusToCompletedIfFullyPaid pour mettre à jour le statut
        // Cette fonction gère correctement le calcul des pénalités et la mise à jour du statut
        const syncResult = await syncLoanStatusToCompletedIfFullyPaid(supabase, loanId);
        
        if (syncResult.updated) {
          processed++;
          results.push({ 
            payment_id: payment.id, 
            loan_id: loanId, 
            status: 'processed', 
            loan_status: 'completed'
          });
          console.log(`[PROCESS_MISSING] ✅ Paiement #${payment.id} traité - Prêt #${loanId} → completed`);
        } else if (syncResult.ok) {
          // Le prêt n'est pas encore complété, c'est normal
          processed++;
          results.push({ 
            payment_id: payment.id, 
            loan_id: loanId, 
            status: 'processed', 
            loan_status: 'active'
          });
          console.log(`[PROCESS_MISSING] ✅ Paiement #${payment.id} traité - Prêt #${loanId} reste actif`);
        } else {
          errors++;
          results.push({ payment_id: payment.id, loan_id: loanId, status: 'error', error: 'Erreur synchronisation statut' });
          console.error(`[PROCESS_MISSING] ❌ Erreur synchronisation prêt #${loanId}`);
        }
        
      } catch (error) {
        console.error(`[PROCESS_MISSING] ❌ Erreur traitement paiement #${payment.id}:`, error);
        errors++;
        results.push({ payment_id: payment.id, status: 'error', error: error.message });
      }
    }
    
    console.log(`[PROCESS_MISSING] ✅ Terminé: ${processed} traité(s), ${errors} erreur(s)`);
    
    return res.json({ 
      success: true, 
      message: `${processed} paiement(s) traité(s), ${errors} erreur(s)`,
      processed,
      errors,
      results
    });
    
  } catch (error) {
    console.error('[PROCESS_MISSING] ❌ Erreur:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur: ' + error.message 
    });
  }
});

// Route pour traiter manuellement un paiement FedaPay qui n'a pas été traité par le webhook
app.post('/api/fedapay/process-payment-manually', requireAuth, async (req, res) => {
  try {
    const { transaction_id, loan_id, user_id } = req.body;
    
    if (!transaction_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'transaction_id requis' 
      });
    }

    console.log('[MANUAL_PAYMENT] 🔧 Traitement manuel paiement:', { transaction_id, loan_id, user_id });

    const { supabase } = require('./utils/supabaseClient-server');
    
    // Récupérer la transaction depuis FedaPay
    let baseUrl = FEDAPAY_CONFIG.baseUrl || '';
    if (baseUrl.includes('/transactions')) {
      baseUrl = baseUrl.split('/transactions')[0];
    }
    if (!baseUrl.endsWith('/v1')) {
      baseUrl = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl.replace(/\/+$/, '')}/v1`;
    }
    const fedapayBaseUrl = baseUrl 
      ? baseUrl
      : (process.env.FEDAPAY_ENVIRONMENT === 'live' 
          ? 'https://api.fedapay.com/v1' 
          : 'https://sandbox-api.fedapay.com/v1');

    const transactionResponse = await fetch(`${fedapayBaseUrl}/transactions/${transaction_id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}`
      }
    });

    if (!transactionResponse.ok) {
      return res.status(400).json({ 
        success: false, 
        error: 'Transaction non trouvée dans FedaPay' 
      });
    }

    const transactionData = await transactionResponse.json();
    const transaction = transactionData.entity || transactionData.data || transactionData.transaction || transactionData;
    const txStatus = (transaction && (transaction.status ?? transaction.state)) ?? transactionData.status ?? transactionData.state;

    if (!transaction) {
      return res.status(400).json({ success: false, error: 'Réponse FedaPay invalide' });
    }
    if (txStatus !== 'transferred' && txStatus !== 'approved') {
      return res.status(400).json({ 
        success: false, 
        error: txStatus != null ? `Transaction non confirmée (statut: ${txStatus})` : 'Transaction non confirmée. Si vous venez de payer, le webhook a peut-être déjà traité le paiement — rechargez l\'accueil.' 
      });
    }

    // Extraire les IDs si non fournis
    let finalLoanId = loan_id || transaction.metadata?.loan_id || transaction.custom_metadata?.loan_id;
    let finalUserId = user_id || transaction.metadata?.user_id || transaction.custom_metadata?.user_id;

    // Si toujours pas d'IDs, essayer depuis la description
    if (!finalLoanId && transaction.description) {
      const match = transaction.description.match(/Remboursement prêt #([a-f0-9-]+)/);
      if (match) finalLoanId = match[1];
    }

    if (!finalLoanId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Impossible de déterminer l\'ID du prêt. Fournissez loan_id dans le body.' 
      });
    }

    // Récupérer le prêt pour obtenir user_id si nécessaire
    if (!finalUserId) {
      const { data: loanData } = await supabase
        .from('loans')
        .select('user_id')
        .eq('id', finalLoanId)
        .single();
      
      if (loanData) {
        finalUserId = loanData.user_id;
      }
    }

    if (!finalUserId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Impossible de déterminer l\'ID utilisateur. Fournissez user_id dans le body.' 
      });
    }

    // Vérifier si le paiement existe déjà
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('transaction_id', transaction_id)
      .maybeSingle();

    if (existingPayment) {
      return res.json({ 
        success: true, 
        message: 'Paiement déjà traité',
        payment_id: existingPayment.id
      });
    }

    // Créer le paiement (réutiliser la logique du webhook)
    const { data: newPaymentData, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        loan_id: finalLoanId,
        user_id: finalUserId,
        amount: transaction.amount,
        method: 'mobile_money',
        status: 'completed',
        transaction_id: transaction_id,
        payment_date: new Date().toISOString(),
        description: `Remboursement complet du prêt #${finalLoanId}`,
        metadata: {
          fedapay_data: {
            transaction_id: transaction_id,
            amount: transaction.amount,
            payment_date: new Date().toISOString(),
            payment_method: transaction.payment_method
          },
          payment_type: 'loan_repayment',
          app_source: 'manual_processing'
        }
      }])
      .select()
      .single();

    if (paymentError) {
      console.error('[MANUAL_PAYMENT] ❌ Erreur création paiement:', paymentError);
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur création paiement: ' + paymentError.message 
      });
    }

    // Calculer le montant total attendu et mettre à jour le prêt
    const { data: loanData } = await supabase
      .from('loans')
      .select('id, amount, interest_rate, status')
      .eq('id', finalLoanId)
      .single();

    if (!loanData) {
      return res.status(404).json({ 
        success: false, 
        error: 'Prêt non trouvé' 
      });
    }

    const principalAmount = parseFloat(loanData.amount) || 0;
    const interestAmount = principalAmount * ((loanData.interest_rate || 0) / 100);
    const penaltyAmount = 0; // Colonne total_penalty_amount non utilisée
    const totalExpectedAmount = principalAmount + interestAmount + penaltyAmount;

    const { data: allPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('loan_id', finalLoanId)
      .eq('status', 'completed');

    const totalPaidAmount = allPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const remainingAmount = Math.max(0, totalExpectedAmount - totalPaidAmount);
    const isFullyPaid = remainingAmount <= 1 || totalPaidAmount >= totalExpectedAmount - 1;

    const updateData = {
      status: isFullyPaid ? 'completed' : 'active',
      updated_at: new Date().toISOString()
    };

    const { error: loanError } = await supabase
      .from('loans')
      .update(updateData)
      .eq('id', finalLoanId);

    if (loanError) {
      console.error('[MANUAL_PAYMENT] ❌ Erreur mise à jour prêt:', loanError);
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur mise à jour prêt: ' + loanError.message 
      });
    }

    console.log('[MANUAL_PAYMENT] ✅ Paiement traité avec succès:', {
      payment_id: newPaymentData.id,
      loan_id: finalLoanId,
      is_fully_paid: isFullyPaid,
      remaining_amount: remainingAmount
    });

    return res.json({ 
      success: true, 
      message: 'Paiement traité avec succès',
      payment_id: newPaymentData.id,
      loan_status: isFullyPaid ? 'completed' : 'active',
      remaining_amount: remainingAmount
    });

  } catch (error) {
    console.error('[MANUAL_PAYMENT] ❌ Erreur:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur: ' + error.message 
    });
  }
});

// Endpoint pour créer une transaction de dépôt
app.post('/api/create-savings-deposit', requireAuth, async (req, res) => {
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

    // Appel à FedaPay API (utilise la variable d'environnement)
    // Extraire la base URL (sans /transactions/ID)
    let baseUrl = FEDAPAY_CONFIG.baseUrl || '';
    if (baseUrl.includes('/transactions')) {
      baseUrl = baseUrl.split('/transactions')[0];
    }
    // S'assurer que la base URL se termine par /v1
    if (!baseUrl.endsWith('/v1')) {
      baseUrl = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl.replace(/\/+$/, '')}/v1`;
    }
    const fedapayApiUrl = baseUrl 
      ? `${baseUrl}/transactions`
      : (process.env.FEDAPAY_ENVIRONMENT === 'live' 
          ? 'https://api.fedapay.com/v1/transactions' 
          : 'https://sandbox-api.fedapay.com/v1/transactions');
    
    const response = await fetch(fedapayApiUrl, {
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
app.post('/api/create-loan-repayment', requireAuth, async (req, res) => {
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

    const frontendUrl = getFrontendUrl();
    // FedaPay utilise callback_url pour rediriger l'utilisateur après paiement. On envoie vers la page de retour.
    // Le traitement du paiement (création en base + mise à jour du prêt) se fait soit par le webhook backend
    // (si configuré dans le dashboard FedaPay), soit à l'arrivée sur cette page via process-payment-manually.
    const callbackUrl = `${frontendUrl}/remboursement-retour`;

    // FedaPay API : sandbox si FEDAPAY_ENVIRONMENT=sandbox, sinon live
    const isSandbox = (process.env.FEDAPAY_ENVIRONMENT || '').toLowerCase() === 'sandbox';
    const fedapayApiUrl = isSandbox
      ? 'https://sandbox-api.fedapay.com/v1/transactions'
      : 'https://api.fedapay.com/v1/transactions';
    console.log('[LOAN_REPAYMENT] 🌐 Mode FedaPay:', isSandbox ? 'SANDBOX' : 'LIVE', '→', fedapayApiUrl);

    const response = await fetch(fedapayApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: `Remboursement prêt #${loan_id} - User:${user_id}`,
        amount: parseInt(amount),
        currency: { iso: "XOF" },
        callback_url: callbackUrl,
        custom_metadata: {
          paymentType: "loan_repayment",
          type: "loan_repayment",
          user_id: user_id,
          loan_id: loan_id,
          amount: amount
        },
        metadata: {
          loan_id: loan_id,
          user_id: user_id,
          type: "loan_repayment"
        },
      }),
    });

    const data = await response.json();
    console.log("[LOAN_REPAYMENT] Réponse FedaPay (clés):", data ? Object.keys(data) : 'null');

    const tx = (data && (data['v1/transaction'] || data.transaction || data.data || (data.id != null || data.reference ? data : null))) || null;
    const paymentUrl = tx && (tx.payment_url || tx.redirect_url || tx.url);
    const transactionId = tx && (tx.id != null ? String(tx.id) : (tx.reference ? String(tx.reference) : ''));

    if (paymentUrl) {
      if (!transactionId) {
        console.warn("[LOAN_REPAYMENT] ⚠️ Pas d'id/reference dans la réponse FedaPay — la page de retour ne pourra pas traiter le paiement. Réponse:", JSON.stringify(data).slice(0, 500));
      }
      return res.json({
        success: true,
        transactionUrl: paymentUrl,
        transactionId: transactionId || undefined
      });
    }

    console.error("[LOAN_REPAYMENT] ❌ Réponse FedaPay sans payment_url. Structure:", data);
    res.status(500).json({ success: false, error: data });
  } catch (err) {
    console.error("[LOAN_REPAYMENT] ❌ Erreur création transaction:", err);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// Endpoint pour vérifier le statut d'un remboursement
app.get('/api/loans/repayment-status', requireAuth, async (req, res) => {
  try {
    const { reference, id, txId, transaction_id } = req.query;
    const transactionId = reference || id || txId || transaction_id;
    
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

// Route pour traitement manuel d'un plan épargne (fallback si webhook manqué)
app.post('/api/savings/process-plan-manually', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { transaction_reference, fixed_amount, frequency_days, duration_months } = req.body;

    if (!transaction_reference) {
      return res.status(400).json({ success: false, error: 'transaction_reference requis' });
    }

    // Plan déjà créé ? (idempotence)
    const { data: existing } = await supabase
      .from('savings_plans')
      .select('*')
      .eq('transaction_reference', transaction_reference)
      .maybeSingle();

    if (existing) {
      console.log('[MANUAL_SAVINGS] Plan déjà existant:', existing.id);
      return res.json({ success: true, plan: existing, alreadyExisted: true });
    }

    // Vérifier la transaction dans FedaPay
    const fedapayBaseUrl = process.env.FEDAPAY_ENVIRONMENT === 'live'
      ? 'https://api.fedapay.com/v1'
      : 'https://sandbox-api.fedapay.com/v1';

    const txRes = await fetch(`${fedapayBaseUrl}/transactions?filters[reference]=${transaction_reference}`, {
      headers: { 'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}` }
    });
    const txData = await txRes.json();
    const tx = txData?.v1?.transactions?.[0] || txData?.transactions?.[0];

    if (!tx || !['approved', 'transferred'].includes(tx.status)) {
      return res.status(400).json({ success: false, error: 'Transaction non approuvée dans FedaPay' });
    }

    // Créer le plan
    const fAmount = parseInt(fixed_amount, 10) || parseInt(tx.custom_metadata?.fixed_amount, 10) || 500;
    const fDays = parseInt(frequency_days, 10) || parseInt(tx.custom_metadata?.frequency_days, 10) || 10;
    const fMonths = parseInt(duration_months, 10) || parseInt(tx.custom_metadata?.duration_months, 10) || 3;
    const totalDepositsRequired = Math.ceil((fMonths * 30) / fDays);
    const totalAmountTarget = fAmount * totalDepositsRequired;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + fMonths);

    const { data: account, error: accErr } = await supabase
      .from('savings_accounts')
      .upsert({ user_id: userId, balance: 0, account_creation_fee_paid: true, account_creation_fee_amount: 1000, is_active: true, interest_rate: 5, total_interest_earned: 0 }, { onConflict: 'user_id' })
      .select().single();

    if (accErr) throw accErr;

    const { data: plan, error: planErr } = await supabase
      .from('savings_plans')
      .insert({
        user_id: userId,
        savings_account_id: account.id,
        plan_name: 'Plan Épargne',
        fixed_amount: fAmount,
        frequency_days: fDays,
        duration_months: fMonths,
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
        transaction_reference,
        interest_rate: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select().single();

    if (planErr) throw planErr;

    // Tracer les frais de création
    await supabase.from('savings_transactions').insert({
      user_id: userId, savings_plan_id: plan.id, transaction_type: 'creation_fee',
      amount: tx.amount || 1000, transaction_reference, status: 'completed',
      created_at: new Date().toISOString()
    });

    console.log('[MANUAL_SAVINGS] ✅ Plan créé manuellement:', plan.id);
    res.json({ success: true, plan });
  } catch (error) {
    console.error('[MANUAL_SAVINGS] ❌ Erreur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour vérifier le statut d'un plan d'épargne
// Route pour personnaliser un plan d'épargne
app.post('/api/savings/personalize-plan', async (req, res) => {
  try {
    const { planId, planName, goal, goalLabel } = req.body;

    if (!planId || !planName || !goal) {
      return res.status(400).json({ 
        success: false, 
        error: 'planId, planName et goal sont requis' 
      });
    }

    console.log('[PERSONALIZE_PLAN] 📝 Personnalisation du plan:', { planId, planName, goal, goalLabel });

    const { supabase } = require('./utils/supabaseClient-server');
    
    const personalizedAt = new Date().toISOString();
    
    // Mettre à jour le plan
    const { data: updatedPlan, error: updateError } = await supabase
      .from('savings_plans')
      .update({
        plan_name: planName.trim(),
        goal: goal,
        goal_label: goalLabel || null,
        personalized_at: personalizedAt,
        updated_at: personalizedAt
      })
      .eq('id', planId)
      .select()
      .single();

    if (updateError) {
      console.error('[PERSONALIZE_PLAN] ❌ Erreur mise à jour:', updateError);
      return res.status(500).json({ 
        success: false, 
        error: updateError.message || 'Erreur lors de la personnalisation' 
      });
    }

    console.log('[PERSONALIZE_PLAN] ✅ Plan personnalisé avec succès:', {
      planId: updatedPlan.id,
      plan_name: updatedPlan.plan_name,
      goal: updatedPlan.goal,
      personalized_at: updatedPlan.personalized_at
    });

    return res.json({ 
      success: true, 
      plan: updatedPlan,
      message: 'Plan personnalisé avec succès'
    });
    
  } catch (error) {
    console.error('[PERSONALIZE_PLAN] ❌ Erreur:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Erreur serveur lors de la personnalisation' 
    });
  }
});

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
        goal,
        goal_label,
        personalized_at,
        is_overdue,
        days_overdue,
        is_suspended,
        created_at,
        updated_at
      `);
    
    if (planId) {
      // Chercher directement par ID du plan
      query = query.eq('id', planId);
    } else if (userId) {
      // Uniquement plan actif ou en attente de retrait (pas les plans terminés = historique)
      query = query
        .eq('user_id', userId)
        .in('status', ['active', 'withdrawal_pending'])
        .order('created_at', { ascending: false })
        .limit(1);
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

// Historique des plans d'épargne terminés (pour le client)
app.get('/api/savings/history', requireAuth, async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ success: false, error: 'userId requis' });

    const { data: plans, error } = await supabase
      .from('savings_plans')
      .select(`
        id, plan_name, goal, goal_label, fixed_amount, frequency_days,
        total_amount_target, current_balance, status, created_at, updated_at
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: 'Erreur DB' });
    return res.json({ success: true, plans: plans || [] });
  } catch (error) {
    console.error('[SAVINGS_HISTORY]', error);
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

    // Extraire la base URL (sans /transactions/ID)
    let baseUrl = FEDAPAY_CONFIG.baseUrl || '';
    if (baseUrl.includes('/transactions')) {
      baseUrl = baseUrl.split('/transactions')[0];
    }
    // S'assurer que la base URL se termine par /v1
    if (baseUrl && !baseUrl.endsWith('/v1')) {
      baseUrl = `${baseUrl.replace(/\/+$/, '')}/v1`;
    }
    const fedapayBaseUrl = baseUrl 
      ? baseUrl
      : (process.env.FEDAPAY_ENVIRONMENT === 'live' 
          ? 'https://api.fedapay.com/v1' 
          : 'https://sandbox-api.fedapay.com/v1');

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
    // Extraire la base URL (sans /transactions/ID)
    let baseUrl = FEDAPAY_CONFIG.baseUrl || '';
    if (baseUrl.includes('/transactions')) {
      baseUrl = baseUrl.split('/transactions')[0];
    }
    // S'assurer que la base URL se termine par /v1
    if (baseUrl && !baseUrl.endsWith('/v1')) {
      baseUrl = `${baseUrl.replace(/\/+$/, '')}/v1`;
    }
    const fedapayTestUrl = baseUrl 
      ? `${baseUrl}/currencies`
      : (process.env.FEDAPAY_ENVIRONMENT === 'live' 
          ? 'https://api.fedapay.com/v1/currencies' 
          : 'https://sandbox-api.fedapay.com/v1/currencies');
    
    const response = await fetch(fedapayTestUrl, {
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
          // ⚠️ PROTECTION CONTRE LES DOUBLONS : Vérifier si une notification existe déjà pour ce plan et ce nombre de jours aujourd'hui
          const todayStart = new Date(today);
          todayStart.setHours(0, 0, 0, 0);
          
          const { data: existingReminder } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', plan.user_id)
            .eq('type', 'savings_deposit_reminder')
            .eq('data->plan_id', plan.id)
            .eq('data->days_remaining', daysRemaining)
            .gte('created_at', todayStart.toISOString())
            .limit(1);
          
          if (existingReminder && existingReminder.length > 0) {
            console.log(`[SAVINGS_REMINDER] ⚠️ Rappel déjà envoyé aujourd'hui pour plan #${plan.id.substring(0, 8)}... (${daysRemaining} jour(s) restant(s))`);
            continue; // Passer au plan suivant
          }
          
          // Récupérer les informations de l'utilisateur (dont téléphone pour SMS)
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('first_name, last_name, phone_number')
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
            title = "AB Campus Finance - Dépôt d'épargne aujourd'hui !";
            body = `Bonjour ${clientName}, c'est aujourd'hui que vous devez effectuer votre dépôt d'épargne de ${amountFormatted}. Si vous ne le faites pas aujourd'hui, vous pourriez perdre tous les intérêts que vous avez accumulés jusqu'à présent.`;
          } else {
            const daysText = daysRemaining === 1 ? '24h' : `${daysRemaining} jours`;
            title = "AB Campus Finance - Rappel de dépôt d'épargne";
            body = `Bonjour ${clientName}, votre prochain dépôt sur votre compte épargne est dans ${daysText}. Effectuer votre dépôt pour ne pas perdre les intérêts cumulés à ce jour.`;
          }
          
          // Toujours créer une notification en base pour affichage dans la cloche (même sans push)
          const { error: notifErr } = await supabase
            .from('notifications')
            .insert({
              user_id: plan.user_id,
              title,
              message: body,
              type: 'savings_deposit_reminder',
              priority: 'high',
              read: false,
              data: {
                plan_id: plan.id,
                days_remaining: daysRemaining,
                amount: amountFormatted,
                plan_name: plan.plan_name,
                url: '/ab-epargne'
              }
            });
          if (notifErr) {
            console.error(`[SAVINGS_REMINDER] Erreur insertion notification pour plan #${plan.id}:`, notifErr.message);
          } else {
            notificationsSent++;
          }
          
          // FCM : notification push via Firebase
          const fcmResult = await sendFCMNotificationWithDuplicateCheck(plan.user_id, title, body, {
            url: '/ab-epargne',
            type: 'savings_deposit_reminder',
            planId: plan.id,
            daysRemaining: daysRemaining.toString(),
            amount: amountFormatted,
            planName: plan.plan_name
          });
          if (fcmResult.success) {
            const logText = daysRemaining === 0 ? 'aujourd\'hui' : `${daysRemaining === 1 ? '24h' : `${daysRemaining} jours`} restant(s)`;
            console.log(`[SAVINGS_REMINDER] FCM envoyé à ${clientName} - ${logText}`);
          } else {
            console.log(`[SAVINGS_REMINDER] Utilisateur ${clientName} sans token FCM (notification en base créée)`);
          }
          
          // SMS : rappel dépôt épargne même sans push
          const phone = userData?.phone_number;
          if (phone) {
            const smsText = daysRemaining === 0
              ? `CAMPUS FINANCE - Dépôt épargne aujourd'hui: ${amountFormatted}. Effectuez-le pour garder vos intérêts.`
              : `CAMPUS FINANCE - Rappel: prochain dépôt épargne ${amountFormatted} dans ${daysRemaining === 1 ? '24h' : daysRemaining + ' jours'}.`;
            await sendNotificationSms(phone, smsText);
          }
        }
      } catch (planError) {
        console.error(`[SAVINGS_REMINDER] Erreur traitement plan ${plan.id}:`, planError);
        errors++;
      }
    }
    
    console.log(`[SAVINGS_REMINDER] Terminé: ${notificationsSent} notification(s) créée(s), ${errors} erreur(s) push`);
    return true;
    
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

    // FCM : notification push à l'admin via Firebase
    const fcmResult = await sendFCMNotificationWithDuplicateCheck(adminData.id, title, body, {
      url: '/admin/users',
      type: 'loyalty_achievement_admin',
      clientName: clientName,
      userId: userId,
      score: '5'
    });
    
    return fcmResult.success;

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

    // Récupérer la date du dernier reset de fidélité
    const { data: userResetData } = await supabase
      .from('users')
      .select('loyalty_last_reset')
      .eq('id', userId)
      .single();

    const lastResetDate = userResetData?.loyalty_last_reset 
      ? new Date(userResetData.loyalty_last_reset) 
      : null;

    completedPayments.forEach(p => {
      const loan = loanById.get(p.loan_id);
      if (!loan) return;

      // Le décompte commence à partir de la date d'approbation, pas de la demande
      const startDate = loan.approved_at ? new Date(loan.approved_at) : null;
      if (!startDate) return; // Prêt non approuvé, on ignore
      
      // Si un reset a eu lieu, ne compter que les remboursements après cette date
      if (lastResetDate && startDate.getTime() < lastResetDate.getTime()) {
        return; // Ignorer les prêts approuvés avant le dernier reset
      }
      
      const durationDays = parseInt(loan.duration_months || loan.duration || 30, 10);
      const dueDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

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
      // Vérifier si l'utilisateur a déjà une notification de fidélité non fermée
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'loyalty_achievement')
        .eq('read', false)
        .single();

      // Si une notification existe déjà, ne pas créer de doublon
      if (existingNotification) {
        console.log('[LOYALTY] Notification de fidélité déjà existante pour cet utilisateur');
        return true;
      }

      // Récupérer les informations de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('first_name, last_name, loyalty_status')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        console.error('[LOYALTY] Erreur récupération utilisateur:', userError);
        return false;
      }

      const clientName = `${userData.first_name} ${userData.last_name}`;
      
      // Créer une notification dans la DB pour le client
      const { error: clientNotifError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: '🏆 Félicitations ! Score de fidélité maximum atteint',
          message: `Bravo ${clientName} ! Vous avez atteint le score de fidélité maximum (5/5) grâce à vos 5 remboursements ponctuels. Votre sérieux et votre fidélité sont remarquables !`,
          type: 'loyalty_achievement',
          priority: 'high',
          read: false,
          data: {
            showPopup: true,
            score: 5,
            clientName: clientName,
            userId: userId
          }
        });

      if (clientNotifError) {
        console.error('[LOYALTY] Erreur création notification client:', clientNotifError);
      } else {
        console.log('[LOYALTY] ✅ Notification client créée dans la DB');
      }

      // Récupérer l'admin pour créer sa notification
      const { data: adminData } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .single();

      if (adminData) {
        // Vérifier si l'admin a déjà une notification pour cet utilisateur
        const { data: existingAdminNotifs } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', adminData.id)
          .eq('type', 'loyalty_achievement_admin')
          .eq('read', false);

        const existingAdminNotif = existingAdminNotifs?.find(
          notif => notif.data?.targetUserId === userId || notif.data?.userId === userId
        );

        if (!existingAdminNotif) {
          // Créer une notification dans la DB pour l'admin
          const { error: adminNotifError } = await supabase
            .from('notifications')
            .insert({
              user_id: adminData.id,
              title: '🏆 Score de fidélité atteint',
              message: `L'utilisateur ${clientName} a atteint le score de fidélité maximum (5/5). Il attend sa récompense.`,
              type: 'loyalty_achievement_admin',
              priority: 'high',
              read: false,
              data: {
                showPopup: true,
                clientName: clientName,
                userId: userId,
                targetUserId: userId
              }
            });

          if (adminNotifError) {
            console.error('[LOYALTY] Erreur création notification admin:', adminNotifError);
          } else {
            console.log('[LOYALTY] ✅ Notification admin créée dans la DB');
          }
        }
      }

      const title = "🏆 AB Campus Finance - Félicitations !";
      const body = `Bravo ${clientName} ! Vous avez atteint le score de fidélité maximum (5/5) grâce à vos 5 remboursements ponctuels. Votre sérieux et votre fidélité sont remarquables ! Vous serez contacté très bientôt pour recevoir votre récompense.`;

      // FCM : notification push via Firebase
      await sendFCMNotificationWithDuplicateCheck(userId, title, body, {
        url: '/loyalty-score',
        type: 'loyalty_achievement',
        score: '5',
        clientName: clientName
      });
      
      // Envoyer une notification push à l'admin
      try {
        await notifyAdminLoyaltyAchievement(clientName, userId);
      } catch (adminError) {
        console.error('[LOYALTY] Erreur notification push admin:', adminError);
      }
      
      return true;
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
    
    // Récupérer les prêts en cours (avec téléphone pour SMS)
    const { data: loans, error } = await supabase
      .from('loans')
      .select(`
        id,
        user_id,
        amount,
        duration,
        duration_months,
        approved_at,
        status,
        users!inner(first_name, last_name, phone_number)
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
        // Calculer la date d'échéance (duration_months contient déjà des jours, pas des mois !)
        const durationDays = loan.duration_months != null
          ? Number(loan.duration_months) // Déjà en jours, pas besoin de multiplier
          : (loan.duration != null ? Number(loan.duration) : 30);
        const approvedDate = new Date(loan.approved_at);
        const dueDate = new Date(approvedDate);
        dueDate.setDate(dueDate.getDate() + durationDays);
        
        const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        // Envoyer une notification seulement si c'est exactement 3, 2 ou 1 jour(s) restant(s)
        if (daysRemaining >= 1 && daysRemaining <= 3) {
          // ⚠️ PROTECTION CONTRE LES DOUBLONS : Vérifier si une notification existe déjà pour ce prêt et ce nombre de jours aujourd'hui
          const todayStart = new Date(today);
          todayStart.setHours(0, 0, 0, 0);
          
          const { data: existingReminder } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', loan.user_id)
            .eq('type', 'loan_reminder')
            .eq('data->loan_id', loan.id)
            .eq('data->days_remaining', daysRemaining)
            .gte('created_at', todayStart.toISOString())
            .limit(1);
          
          if (existingReminder && existingReminder.length > 0) {
            console.log(`[LOAN_REMINDER] ⚠️ Rappel déjà envoyé aujourd'hui pour prêt #${loan.id.substring(0, 8)}... (${daysRemaining} jour(s) restant(s))`);
            continue; // Passer au prêt suivant
          }
          
          const clientName = `${loan.users.first_name} ${loan.users.last_name}`;
          const amountFormatted = `${parseInt(loan.amount).toLocaleString()} FCFA`;
          const daysText = daysRemaining === 1 ? '1 jour' : `${daysRemaining} jours`;
          
          const title = "AB Campus Finance - Rappel d'échéance";
          const body = `Bonjour ${clientName}, votre prêt de ${amountFormatted} arrive à échéance dans ${daysText}. Rembourser maintenant pour éviter toute pénalité !`;
          
          // Toujours créer une notification en base pour affichage dans la cloche (même sans push)
          const { error: notifErr } = await supabase
            .from('notifications')
            .insert({
              user_id: loan.user_id,
              title,
              message: body,
              type: 'loan_reminder',
              priority: 'high',
              read: false,
              data: {
                loan_id: loan.id,
                days_remaining: daysRemaining,
                amount: amountFormatted,
                url: '/repayment'
              }
            });
          if (notifErr) {
            console.error(`[LOAN_REMINDER] Erreur insertion notification pour prêt #${loan.id}:`, notifErr.message);
          } else {
            notificationsSent++;
          }
          
          // FCM : notification push via Firebase
          const fcmResult = await sendFCMNotificationWithDuplicateCheck(loan.user_id, title, body, {
            url: '/repayment',
            type: 'loan_reminder',
            loanId: loan.id,
            daysRemaining: daysRemaining.toString(),
            amount: amountFormatted
          });
          if (fcmResult.success) {
            console.log(`[LOAN_REMINDER] FCM envoyé à ${clientName} - ${daysText} restant(s)`);
          } else {
            console.log(`[LOAN_REMINDER] Utilisateur ${clientName} sans token FCM (notification en base créée)`);
          }
          
          // SMS : les clients reçoivent le rappel même sans push (app fermée, pas d'abonnement)
          const phone = loan.users?.phone_number;
          if (phone) {
            const smsText = `CAMPUS FINANCE - Rappel: votre prêt de ${amountFormatted} arrive à échéance dans ${daysText}. Remboursez pour éviter les pénalités.`;
            await sendNotificationSms(phone, smsText);
          }
        }
      } catch (loanError) {
        console.error(`[LOAN_REMINDER] Erreur traitement prêt ${loan.id}:`, loanError);
        errors++;
      }
    }
    
    console.log(`[LOAN_REMINDER] Terminé: ${notificationsSent} notification(s) créée(s), ${errors} erreur(s) push`);
    return true;
    
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

// Route pour déclencher manuellement la gestion des plans d'épargne en retard
app.post('/api/trigger-savings-overdue-check', async (req, res) => {
  try {
    const success = await manageOverdueSavings();
    res.json({
      success: true,
      message: success ? 'Gestion des retards d\'épargne effectuée' : 'Aucun plan en retard traité'
    });
  } catch (error) {
    console.error('[SAVINGS_OVERDUE] Erreur déclenchement manuel:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la gestion des retards d\'épargne'
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

// Route pour vérifier si un popup de fidélité doit être affiché
app.get('/api/loyalty-popup-check', requireAuth, async (req, res) => {
  try {
    const userId = req.query.userId;
    const isAdmin = req.user.role === 'admin';

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId requis' 
      });
    }

    let notification = null;

    if (isAdmin) {
      // Pour l'admin, chercher une notification de type loyalty_achievement_admin non lue
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'loyalty_achievement_admin')
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[LOYALTY_POPUP] Erreur récupération notification admin:', error);
        return res.status(500).json({ success: false, error: error.message });
      }

      notification = data;
    } else {
      // Pour le client, chercher une notification de type loyalty_achievement non lue
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'loyalty_achievement')
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[LOYALTY_POPUP] Erreur récupération notification client:', error);
        return res.status(500).json({ success: false, error: error.message });
      }

      notification = data;
    }

    if (notification && notification.data?.showPopup) {
      return res.json({
        success: true,
        showPopup: true,
        notification: {
          id: notification.id,
          userName: notification.data.clientName || null,
          userId: notification.data.userId || notification.data.targetUserId || null,
          score: notification.data.score || 5
        }
      });
    }

    return res.json({
      success: true,
      showPopup: false
    });
  } catch (error) {
    console.error('[LOYALTY_POPUP] Erreur lors de la vérification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de la vérification du popup' 
    });
  }
});

// Route pour réinitialiser le compteur de fidélité et mettre à jour le statut
app.post('/api/loyalty-reset-counter', requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId requis' 
      });
    }

    // Récupérer l'utilisateur avec son statut actuel
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('loyalty_status')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      });
    }

    // Déterminer le nouveau statut selon la progression
    let newStatus = 'Gold';
    if (userData.loyalty_status === 'Gold') {
      newStatus = 'Diamond';
    } else if (userData.loyalty_status === 'Diamond') {
      newStatus = 'Prestige';
    } else if (!userData.loyalty_status || userData.loyalty_status === null) {
      newStatus = 'Gold';
    } else {
      // Si déjà Prestige, on reste Prestige
      newStatus = 'Prestige';
    }

    // Mettre à jour le statut de l'utilisateur et la date de reset
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        loyalty_status: newStatus,
        loyalty_last_reset: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[LOYALTY_RESET] Erreur mise à jour statut:', updateError);
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la mise à jour du statut' 
      });
    }

    // Marquer les notifications de fidélité comme lues pour cet utilisateur
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('type', 'loyalty_achievement');

    // Marquer aussi la notification admin correspondante comme lue
    const { data: adminData } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .single();

    if (adminData) {
      // Récupérer toutes les notifications admin non lues et filtrer celles qui concernent cet utilisateur
      const { data: adminNotifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', adminData.id)
        .eq('type', 'loyalty_achievement_admin')
        .eq('read', false);

      if (adminNotifications && adminNotifications.length > 0) {
        // Filtrer celles qui concernent cet utilisateur
        const relevantNotifications = adminNotifications.filter(
          notif => notif.data?.targetUserId === userId || notif.data?.userId === userId
        );

        // Marquer comme lues
        for (const notif of relevantNotifications) {
          await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notif.id);
        }
      }
    }

    console.log(`[LOYALTY_RESET] Compteur réinitialisé pour l'utilisateur ${userId}, nouveau statut: ${newStatus}`);

    return res.json({
      success: true,
      message: 'Compteur réinitialisé avec succès',
      newStatus: newStatus
    });
  } catch (error) {
    console.error('[LOYALTY_RESET] Erreur lors de la réinitialisation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de la réinitialisation' 
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
app.post('/api/notify-admin-new-loan', requireAuth, async (req, res) => {
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

    // Vérifier si l'admin a un token FCM
    const { data: adminWithToken } = await supabase
      .from('users')
      .select('id, first_name, last_name, role, fcm_token')
      .eq('id', adminData.id)
      .single();
    
    console.log('[ADMIN_NOTIFICATION] Admin trouvé:', {
      id: adminData.id,
      name: `${adminData.first_name} ${adminData.last_name}`,
      role: adminData.role,
      hasFcmToken: !!adminWithToken?.fcm_token
    });

    const adminName = adminData.first_name || 'Admin';
    const amountFormatted = `${parseInt(loanAmount).toLocaleString()} FCFA`;

    const title = "Nouvelle demande de prêt";
    const body = `Bonjour ${adminName} ! ${clientName} a soumis une demande de prêt de ${amountFormatted}.`;
    
    // 1. CRÉER LA NOTIFICATION DANS LA BASE DE DONNÉES (TOUJOURS)
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: adminData.id,
          title: title,
          message: body,
          type: 'loan_request',
          data: {
            loan_id: loanId,
            client_name: clientName,
            amount: loanAmount
          },
          read: false
        });
      
      console.log('[ADMIN_NOTIFICATION] ✅ Notification admin créée dans la DB');
    } catch (dbError) {
      console.error('[ADMIN_NOTIFICATION] ❌ Erreur création notification DB:', dbError);
    }
    
    // 2. FCM : notification push à l'admin via Firebase (seulement si token FCM disponible)
    if (!adminWithToken?.fcm_token) {
      console.log('[ADMIN_NOTIFICATION] ⚠️ Admin sans token FCM - notification créée dans la DB uniquement');
      return res.json({ 
        success: true, 
        message: `Notification créée dans la DB pour l'admin ${adminName} (pas de token FCM)`,
        fcmSent: false
      });
    }
    
    const fcmResult = await sendFCMNotificationWithDuplicateCheck(adminData.id, title, body, {
      url: '/admin/loans',
      type: 'new_loan_request',
      loanId: loanId,
      amount: amountFormatted,
      clientName: clientName
    });
    
    if (fcmResult.success) {
      console.log('[ADMIN_NOTIFICATION] ✅ Notification FCM envoyée à l\'admin');
      res.json({ 
        success: true, 
        message: `Notification envoyée à l'admin ${adminName}`,
        fcmSent: true
      });
    } else {
      console.error('[ADMIN_NOTIFICATION] ❌ Erreur envoi FCM:', fcmResult.error);
      // Ne pas retourner d'erreur 500, la notification est dans la DB
      res.json({ 
        success: true, 
        message: `Notification créée dans la DB pour l'admin ${adminName} (erreur FCM: ${fcmResult.error})`,
        fcmSent: false,
        fcmError: fcmResult.error
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

// Route pour notifier l'admin d'un remboursement
app.post('/api/notify-admin-repayment', async (req, res) => {
  try {
    const { loanId, clientName, amount, userId } = req.body;
    
    if (!loanId || !clientName || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'loanId, clientName et amount sont requis' 
      });
    }
    
    console.log('[ADMIN_NOTIFICATION_REPAYMENT] Remboursement reçu:', { loanId, clientName, amount });
    
    // Récupérer l'admin
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('id, first_name, last_name, role')
      .eq('role', 'admin')
      .single();

    if (adminError || !adminData) {
      console.error('[ADMIN_NOTIFICATION_REPAYMENT] ❌ Aucun admin trouvé:', adminError);
      return res.status(404).json({ 
        success: false, 
        error: 'Aucun administrateur trouvé' 
      });
    }

    console.log('[ADMIN_NOTIFICATION_REPAYMENT] Admin trouvé:', {
      id: adminData.id,
      name: `${adminData.first_name} ${adminData.last_name}`
    });

    const adminName = adminData.first_name || 'Admin';
    const amountFormatted = `${parseInt(amount).toLocaleString()} FCFA`;
    
    const title = "Remboursement reçu ✅";
    const body = `${clientName} vient d'effectuer un remboursement de ${amountFormatted}. Prêt #${loanId.substring(0, 8)}... complété.`;
    
    // 1. CRÉER LA NOTIFICATION DANS LA BASE DE DONNÉES (TOUJOURS)
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: adminData.id,
          title: title,
          message: body,
          type: 'loan_repayment',
          data: {
            loan_id: loanId,
            client_name: clientName,
            amount: amount,
            user_id: userId
          },
          read: false
        });
      
      console.log('[ADMIN_NOTIFICATION_REPAYMENT] ✅ Notification admin créée dans la DB');
    } catch (dbError) {
      console.error('[ADMIN_NOTIFICATION_REPAYMENT] ❌ Erreur création notification DB:', dbError);
    }
    
    // 2. FCM : notification push à l'admin via Firebase
    const fcmResult = await sendFCMNotificationWithDuplicateCheck(adminData.id, title, body, {
      url: '/admin/loan-requests',
      type: 'loan_repayment',
      loanId: loanId,
      amount: amountFormatted,
      clientName: clientName,
      userId: userId
    });
    
    if (fcmResult.success) {
      res.json({ 
        success: true, 
        message: `Notification de remboursement envoyée à l'admin ${adminName}`
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Aucune notification envoyée à l\'admin' 
      });
    }
    
  } catch (error) {
    console.error('[ADMIN_NOTIFICATION_REPAYMENT] Erreur:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de l\'envoi de la notification' 
    });
  }
});

// Route pour notifier l'admin d'une nouvelle demande de retrait
app.post('/api/notify-admin-withdrawal', requireAuth, async (req, res) => {
  try {
    const { withdrawalId, clientName, amount, userId, planId } = req.body;
    
    if (!withdrawalId || !clientName || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'withdrawalId, clientName et amount sont requis' 
      });
    }
    
    console.log('[ADMIN_NOTIFICATION_WITHDRAWAL] Nouvelle demande de retrait:', { withdrawalId, clientName, amount });
    
    // Récupérer l'admin
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('id, first_name, last_name, role')
      .eq('role', 'admin')
      .single();

    if (adminError || !adminData) {
      console.error('[ADMIN_NOTIFICATION_WITHDRAWAL] ❌ Aucun admin trouvé:', adminError);
      return res.status(404).json({ 
        success: false, 
        error: 'Aucun administrateur trouvé' 
      });
    }

    console.log('[ADMIN_NOTIFICATION_WITHDRAWAL] Admin trouvé:', {
      id: adminData.id,
      name: `${adminData.first_name} ${adminData.last_name}`
    });

    const adminName = adminData.first_name || 'Admin';
    const amountFormatted = `${parseInt(amount).toLocaleString()} FCFA`;
    const title = "Nouvelle demande de retrait";
    const message = `${clientName} demande un retrait de ${amountFormatted}. Cliquez pour traiter la demande.`;

    // Toujours créer la notification en base (côté backend = pas de RLS bloquant) pour que la cloche admin affiche
    const { error: notifErr } = await supabase
      .from('notifications')
      .insert({
        user_id: adminData.id,
        title,
        message,
        type: 'withdrawal_request',
        priority: 'high',
        read: false,
        data: {
          withdrawal_id: withdrawalId,
          plan_id: planId || null,
          user_id: userId || null,
          amount: parseInt(amount, 10),
          client_name: clientName,
          url: '/admin/ab-epargne'
        }
      });

    if (notifErr) {
      console.error('[ADMIN_NOTIFICATION_WITHDRAWAL] ❌ Erreur création notification en base:', notifErr);
    } else {
      console.log('[ADMIN_NOTIFICATION_WITHDRAWAL] ✅ Notification en base créée pour l\'admin');
      await supabase.from('withdrawal_requests').update({ admin_notified_at: new Date().toISOString() }).eq('id', withdrawalId);
    }
    
    // FCM : notification push à l'admin via Firebase
    const body = `Hello ${adminName}, ${clientName} demande un retrait de ${amountFormatted}. Cliquez pour traiter la demande.`;
    const fcmResult = await sendFCMNotificationWithDuplicateCheck(adminData.id, title, body, {
      url: '/admin/ab-epargne',
      type: 'withdrawal_request',
      withdrawalId: withdrawalId,
      amount: amountFormatted,
      clientName: clientName,
      userId: userId || ''
    });
    
    if (fcmResult.success) {
      await supabase.from('withdrawal_requests').update({ admin_notified_at: new Date().toISOString() }).eq('id', withdrawalId);
      res.json({ 
        success: true, 
        message: `Notification de retrait envoyée à l'admin ${adminName}`
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Aucune notification envoyée à l\'admin' 
      });
    }
    
  } catch (error) {
    console.error('[ADMIN_NOTIFICATION_WITHDRAWAL] Erreur:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de l\'envoi de la notification' 
    });
  }
});

// Approuver une demande de retrait (côté backend = notification client garantie, plan passé en historique)
app.post('/api/savings/withdrawal-approve', requireAdmin, async (req, res) => {
  try {
    const { withdrawalId, processedBy } = req.body;
    if (!withdrawalId) return res.status(400).json({ success: false, error: 'withdrawalId requis' });

    const { data: w, error: fetchErr } = await supabase
      .from('withdrawal_requests')
      .select('id, user_id, savings_plan_id, amount, status')
      .eq('id', withdrawalId)
      .single();

    if (fetchErr || !w) return res.status(404).json({ success: false, error: 'Demande non trouvée' });
    if (w.status !== 'pending') return res.status(400).json({ success: false, error: 'Demande déjà traitée' });

    const { error: updateReqErr } = await supabase
      .from('withdrawal_requests')
      .update({
        status: 'approved',
        processed_at: new Date().toISOString(),
        processed_by: processedBy || null
      })
      .eq('id', withdrawalId);

    if (updateReqErr) throw updateReqErr;

    const { error: planErr } = await supabase
      .from('savings_plans')
      .update({
        current_balance: 0,
        target_amount: 0,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', w.savings_plan_id);

    if (planErr) throw planErr;

    const amountFormatted = `${Number(w.amount).toLocaleString()} FCFA`;
    await supabase.from('notifications').insert({
      user_id: w.user_id,
      title: 'Retrait approuvé',
      message: `Votre retrait de ${amountFormatted} a été approuvé et transféré. Votre plan est terminé et apparaît dans votre historique.`,
      type: 'withdrawal_approved',
      priority: 'high',
      read: false,
      data: { withdrawal_id: w.id, amount: w.amount, plan_id: w.savings_plan_id }
    });

    res.json({ success: true, message: 'Retrait approuvé. Le plan est passé en historique.' });
  } catch (error) {
    console.error('[WITHDRAWAL_APPROVE]', error);
    res.status(500).json({ success: false, error: error.message || 'Erreur serveur' });
  }
});

// Rejeter une demande de retrait
app.post('/api/savings/withdrawal-reject', requireAdmin, async (req, res) => {
  try {
    const { withdrawalId, reason, processedBy } = req.body;
    if (!withdrawalId) return res.status(400).json({ success: false, error: 'withdrawalId requis' });

    const { data: w, error: fetchErr } = await supabase
      .from('withdrawal_requests')
      .select('id, user_id, savings_plan_id, amount, status')
      .eq('id', withdrawalId)
      .single();

    if (fetchErr || !w) return res.status(404).json({ success: false, error: 'Demande non trouvée' });
    if (w.status !== 'pending') return res.status(400).json({ success: false, error: 'Demande déjà traitée' });

    const { error: updateReqErr } = await supabase
      .from('withdrawal_requests')
      .update({
        status: 'rejected',
        processed_at: new Date().toISOString(),
        processed_by: processedBy || null,
        notes: reason || null
      })
      .eq('id', withdrawalId);

    if (updateReqErr) throw updateReqErr;

    const { error: planErr } = await supabase
      .from('savings_plans')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', w.savings_plan_id);

    if (planErr) throw planErr;

    await supabase.from('notifications').insert({
      user_id: w.user_id,
      title: 'Retrait refusé',
      message: reason ? `Votre demande de retrait a été refusée. Raison: ${reason}` : 'Votre demande de retrait a été refusée.',
      type: 'withdrawal_rejected',
      priority: 'high',
      read: false,
      data: { withdrawal_id: w.id, reason: reason || null }
    });

    res.json({ success: true, message: 'Demande rejetée' });
  } catch (error) {
    console.error('[WITHDRAWAL_REJECT]', error);
    res.status(500).json({ success: false, error: error.message || 'Erreur serveur' });
  }
});

// Route pour notifier l'approbation d'un prêt
app.post('/api/notify-loan-approval', requireAdmin, async (req, res) => {
  try {
    console.log('[LOAN_APPROVAL] ========== NOTIFICATION APPROBATION DÉCLENCHÉE ==========');
    const { userId, loanAmount, loanId } = req.body;
    
    if (!userId || !loanAmount || !loanId) {
      console.error('[LOAN_APPROVAL] ❌ Paramètres manquants:', { userId, loanAmount, loanId });
      return res.status(400).json({ 
        success: false, 
        error: 'userId, loanAmount et loanId sont requis' 
      });
    }
    
    console.log('[LOAN_APPROVAL] 📋 Paramètres reçus:', { userId, loanAmount, loanId });
    
    // Récupérer les informations de l'utilisateur (dont téléphone pour SMS)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('first_name, last_name, phone_number')
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
    
    // ⚠️ PROTECTION CONTRE LES DOUBLONS : Vérifier si une notification existe déjà pour ce prêt
    const { data: existingNotif1 } = await supabase
      .from('notifications')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('type', 'loan_approval')
      .filter('data->>loanId', 'eq', loanId)
      .limit(1);
    
    // Vérification alternative avec contains
    const { data: existingNotif2 } = await supabase
      .from('notifications')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('type', 'loan_approval')
      .contains('data', { loanId: loanId })
      .limit(1);
    
    if ((existingNotif1 && existingNotif1.length > 0) || (existingNotif2 && existingNotif2.length > 0)) {
      const found = existingNotif1?.[0] || existingNotif2?.[0];
      console.log('[LOAN_APPROVAL] ⚠️ Notification déjà envoyée pour ce prêt à', found?.created_at, '(évite doublon)');
      return res.json({ 
        success: true, 
        message: `Notification déjà envoyée pour ce prêt` 
      });
    }
    
    const title = "AB Campus Finance - Prêt approuvé !";
    const body = `Félicitations ${clientName} ! Votre demande de prêt de ${amountFormatted} a été approuvée. Les fonds seront transférés sous 24h.`;
    
    // Toujours créer la notification en base (visible dans l'app)
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message: body,
      type: 'loan_approval',
      priority: 'high',
      read: false,
      data: { loanId, amount: amountFormatted, url: '/repayment' }
    });
    
    // SMS : le client est notifié même sans push
    if (userData.phone_number) {
      const smsText = `CAMPUS FINANCE - Félicitations ! Votre prêt de ${amountFormatted} a été approuvé. Les fonds seront transférés sous 24h.`;
      await sendNotificationSms(userData.phone_number, smsText);
    }
    
    // FCM : notification push via Firebase
    console.log('[LOAN_APPROVAL] 📱 Envoi notification FCM à:', clientName);
    const fcmResult = await sendFCMNotificationWithDuplicateCheck(userId, title, body, {
      url: '/repayment',
      type: 'loan_approval',
      loanId: loanId,
      amount: amountFormatted
    });
    
    if (fcmResult.success) {
      console.log('[LOAN_APPROVAL] ✅ Notification FCM envoyée avec succès à', clientName);
      res.json({ 
        success: true, 
        message: `Notification d'approbation envoyée à ${clientName}`
      });
    } else {
      console.error('[LOAN_APPROVAL] ❌ Échec envoi FCM:', fcmResult.error);
      // On retourne quand même success car la notification DB est créée
      res.json({ 
        success: true, 
        message: `Notification in-app créée pour ${clientName} (FCM: ${fcmResult.error || 'non disponible'})`
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

// Fonction pour gérer les prêts en retard et calculer les pénalités
async function manageOverdueLoans() {
  try {
    console.log('[OVERDUE_MANAGEMENT] Vérification des prêts en retard...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Récupérer tous les prêts actifs ou déjà en retard (pour recalculer les pénalités)
    const { data: activeLoans, error: loansError } = await supabase
      .from('loans')
      .select(`
        id,
        user_id,
        amount,
        interest_rate,
        duration,
        duration_months,
        approved_at,
        status,
        users!inner(first_name, last_name, phone_number)
      `)
      .in('status', ['active', 'overdue'])
      .not('approved_at', 'is', null);
    
    if (loansError) {
      console.error('[OVERDUE_MANAGEMENT] Erreur récupération prêts:', loansError);
      return false;
    }
    
    if (!activeLoans || activeLoans.length === 0) {
      console.log('[OVERDUE_MANAGEMENT] Aucun prêt actif trouvé');
      return true;
    }
    
    let updatedLoans = 0;
    let newOverdueLoans = 0;
    
    for (const loan of activeLoans) {
      try {
        // Durée en jours : duration_months contient déjà des jours (pas des mois !)
        const durationDays = loan.duration_months != null
          ? Number(loan.duration_months) // Déjà en jours, pas besoin de multiplier
          : (loan.duration != null ? Number(loan.duration) : 30);
        const approvedDate = new Date(loan.approved_at);
        const dueDate = new Date(approvedDate);
        dueDate.setDate(dueDate.getDate() + durationDays);

        const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

        if (daysOverdue > 0) {
          // Vérifier d'abord si le prêt a été payé mais le webhook a été manqué
          const syncResult = await syncLoanStatusToCompletedIfFullyPaid(supabase, loan.id);
          if (syncResult.updated) {
            console.log(`[OVERDUE_MANAGEMENT] ✅ Prêt #${loan.id} déjà remboursé (webhook manqué) - marqué completed`);
            updatedLoans++;
            continue;
          }

          // Prêt en retard - calculer les pénalités (2% tous les 5 jours complets, composées)
          const penaltyRate = 2.0; // Taux de pénalité par défaut (2% tous les 5 jours)
          const principalAmount = parseFloat(loan.amount) || 0;
          const interestAmount = principalAmount * ((loan.interest_rate || 0) / 100);
          const totalOriginalAmount = principalAmount + interestAmount;

          // Calculer le nombre de périodes complètes de 5 jours
          const periodsOf5Days = Math.floor(daysOverdue / 5);
          
          // Calculer les pénalités composées : 2% tous les 5 jours sur le solde actuel
          // Formule : montant × (1.02 ^ nombre_periodes) - montant
          let totalPenalty = 0;
          if (periodsOf5Days > 0) {
            const amountWithPenalties = totalOriginalAmount * Math.pow(1 + (penaltyRate / 100), periodsOf5Days);
            totalPenalty = amountWithPenalties - totalOriginalAmount;
          }
          
          const wasOverdue = loan.status === 'overdue';

          // Mettre à jour le prêt : pénalités + statut overdue (nécessite que la contrainte DB inclue 'overdue')
          const { error: updateError } = await supabase
            .from('loans')
            .update({
              status: 'overdue',
              updated_at: new Date().toISOString()
            })
            .eq('id', loan.id);
          
          if (updateError) {
            console.error(`[OVERDUE_MANAGEMENT] Erreur mise à jour prêt #${loan.id}:`, updateError);
          } else {
            updatedLoans++;
            if (!wasOverdue) {
              newOverdueLoans++;
              console.log(`[OVERDUE_MANAGEMENT] 🚨 Nouveau prêt en retard #${loan.id}: ${daysOverdue} jour(s), pénalité: ${totalPenalty.toLocaleString()} FCFA`);
              
              // Notification au client ET à l'admin pour nouveau prêt en retard
              try {
                const clientName = loan.users ? `${loan.users.first_name} ${loan.users.last_name}` : 'Client';
                const amountFormatted = `${parseInt(loan.amount).toLocaleString()} FCFA`;
                const penaltyFormatted = `${(Math.round(totalPenalty * 100) / 100).toLocaleString()} FCFA`;
                const daysText = daysOverdue === 1 ? '1 jour' : `${daysOverdue} jours`;
                
                // 1. Notification au client
                const clientTitle = "⚠️ AB Campus Finance - Prêt en retard";
                const periodsText = periodsOf5Days === 1 ? '1 période de 5 jours' : `${periodsOf5Days} périodes de 5 jours`;
                const clientBody = `Bonjour ${clientName}, votre prêt de ${amountFormatted} est en retard de ${daysText}. Des pénalités de ${penaltyFormatted} s'appliquent (2% tous les 5 jours, ${periodsText} complétée${periodsOf5Days > 1 ? 's' : ''}). Remboursez rapidement pour éviter que les pénalités continuent d'augmenter.`;
                
                await supabase
                  .from('notifications')
                  .insert({
                    user_id: loan.user_id,
                    title: clientTitle,
                    message: clientBody,
                    type: 'loan_overdue',
                    priority: 'high',
                    read: false,
                    data: {
                      loan_id: loan.id,
                      days_overdue: daysOverdue,
                      penalty_amount: totalPenalty,
                      amount: loan.amount,
                      url: '/repayment'
                    }
                  });
                
                console.log(`[OVERDUE_MANAGEMENT] ✅ Notification client créée pour prêt #${loan.id}`);
                
                // FCM : notification push au client via Firebase
                await sendFCMNotificationWithDuplicateCheck(loan.user_id, clientTitle, `Votre prêt est en retard de ${daysText}. Pénalités: ${penaltyFormatted}`, {
                  url: '/repayment',
                  type: 'loan_overdue',
                  loanId: loan.id.toString(),
                  daysOverdue: daysOverdue.toString(),
                  penaltyAmount: totalPenalty.toString()
                });
                
                // SMS au client : prêt en retard (même sans push)
                const clientPhone = loan.users?.phone_number;
                if (clientPhone) {
                  const smsText = `CAMPUS FINANCE - Votre prêt est en retard de ${daysText}. Pénalités: ${penaltyFormatted}. Remboursez rapidement.`;
                  await sendNotificationSms(clientPhone, smsText);
                }
                
                // 2. Notification à l'admin
                const { data: adminData } = await supabase
                  .from('users')
                  .select('id')
                  .eq('role', 'admin')
                  .limit(1)
                  .single();
                
                if (adminData) {
                  const adminTitle = "🚨 Prêt en retard";
                  const adminBody = `Le prêt de ${amountFormatted} de ${clientName} est en retard de ${daysText}. Pénalités: ${penaltyFormatted}`;
                  
                  await supabase
                    .from('notifications')
                    .insert({
                      user_id: adminData.id,
                      title: adminTitle,
                      message: adminBody,
                      type: 'loan_overdue_admin',
                      priority: 'high',
                      read: false,
                      data: {
                        loan_id: loan.id,
                        client_name: clientName,
                        client_id: loan.user_id,
                        days_overdue: daysOverdue,
                        penalty_amount: totalPenalty,
                        amount: loan.amount,
                        url: '/admin/loans'
                      }
                    });
                  
                  console.log(`[OVERDUE_MANAGEMENT] ✅ Notification admin créée pour prêt #${loan.id}`);
                  
                  // FCM : notification push à l'admin via Firebase
                  await sendFCMNotificationWithDuplicateCheck(adminData.id, adminTitle, `${clientName}: prêt en retard de ${daysText}`, {
                    url: '/admin/loans',
                    type: 'loan_overdue_admin',
                    loanId: loan.id.toString(),
                    clientId: loan.user_id,
                    daysOverdue: daysOverdue.toString()
                  });
                }
              } catch (notifError) {
                console.error(`[OVERDUE_MANAGEMENT] Erreur notifications prêt #${loan.id}:`, notifError);
              }
            } else {
              console.log(`[OVERDUE_MANAGEMENT] ⚠️ Prêt en retard #${loan.id}: ${daysOverdue} jour(s), pénalité: ${totalPenalty.toLocaleString()} FCFA`);
            }
          }
        } else if (loan.status === 'overdue') {
          // Le prêt n'est plus en retard, le remettre en actif
          const { error: updateError } = await supabase
            .from('loans')
            .update({
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('id', loan.id);
          
          if (updateError) {
            console.error(`[OVERDUE_MANAGEMENT] Erreur remise en actif prêt #${loan.id}:`, updateError);
          } else {
            console.log(`[OVERDUE_MANAGEMENT] ✅ Prêt #${loan.id} remis en actif (plus en retard)`);
            updatedLoans++;
          }
        }
      } catch (error) {
        console.error(`[OVERDUE_MANAGEMENT] Erreur traitement prêt #${loan.id}:`, error);
      }
    }
    
    console.log(`[OVERDUE_MANAGEMENT] Traitement terminé: ${updatedLoans} prêt(s) mis à jour, ${newOverdueLoans} nouveau(x) en retard`);
    return true;
    
  } catch (error) {
    console.error('[OVERDUE_MANAGEMENT] Erreur générale:', error);
    return false;
  }
}

// Notifier l'admin quand un plan atteint son objectif (le client peut maintenant retirer)
async function notifyAdminPlanGoalReached(planId, userId, currentBalance, targetAmount) {
  try {
    const { data: plan } = await supabase
      .from('savings_plans')
      .select('plan_name, goal, goal_label, user_id, goal_reached_notified_at')
      .eq('id', planId)
      .single();

    if (!plan) return;
    
    // Éviter les doublons : si déjà notifié, ne rien faire
    if (plan.goal_reached_notified_at) {
      console.log('[GOAL_REACHED] Plan', planId, 'déjà notifié, skip');
      return;
    }

    const { data: user } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();

    if (!user) return;

    const clientName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Client';
    const planName = plan.plan_name || plan.goal_label || 'Plan d\'épargne';
    const amountFormatted = `${Number(currentBalance).toLocaleString()} FCFA`;
    const targetFormatted = `${Number(targetAmount).toLocaleString()} FCFA`;

    const { data: adminData } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('role', 'admin')
      .single();

    if (!adminData) return;

    const title = "🎯 Objectif d'épargne atteint";
    const message = `${clientName} a atteint l'objectif de son plan "${planName}" (${targetFormatted}). Le client peut maintenant demander un retrait.`;

    await supabase.from('notifications').insert({
      user_id: adminData.id,
      title,
      message,
      type: 'savings_goal_reached',
      priority: 'high',
      read: false,
      data: {
        plan_id: planId,
        user_id: userId,
        current_balance: currentBalance,
        target_amount: targetAmount,
        client_name: clientName,
        plan_name: planName,
        url: '/admin/ab-epargne'
      }
    });

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', adminData.id);

    if (subs && subs.length > 0 && webPush) {
      const adminName = adminData.first_name || 'Admin';
      const body = `Hello ${adminName}, ${clientName} a atteint l'objectif de son plan "${planName}". Il peut maintenant retirer.`;
      for (const sub of subs) {
        try {
          await webPush.sendNotification(sub.subscription, JSON.stringify({
            title,
            body,
            data: { url: '/admin/ab-epargne', type: 'savings_goal_reached', planId, userId },
            vibrate: [200, 50, 100]
          }));
        } catch (e) { /* ignore */ }
      }
    }

    await supabase.from('notifications').insert({
      user_id: userId,
      title: '🎉 Félicitations ! Objectif atteint',
      message: `Vous avez atteint l'objectif de votre plan "${planName}" (${targetFormatted}). Vous pouvez maintenant demander un retrait depuis votre tableau de bord.`,
      type: 'savings_goal_reached_client',
      priority: 'high',
      read: false,
      data: {
        plan_id: planId,
        current_balance: currentBalance,
        target_amount: targetAmount,
        plan_name: planName,
        url: `/ab-epargne/plan/${planId}`
      }
    });

    await supabase
      .from('savings_plans')
      .update({ goal_reached_notified_at: new Date().toISOString() })
      .eq('id', planId);

    console.log('[GOAL_REACHED] ✅ Admin et client notifiés pour plan', planId);
  } catch (e) {
    console.error('[GOAL_REACHED] Erreur:', e);
  }
}

// Job de rattrapage : notifier l'admin pour les plans ayant atteint leur objectif mais pas encore notifiés
async function notifyAdminForPlansGoalReached() {
  try {
    const { data: plans } = await supabase
      .from('savings_plans')
      .select('id, user_id, plan_name, goal, goal_label, current_balance, total_amount_target, target_amount, status')
      .eq('status', 'active')
      .is('goal_reached_notified_at', null);

    if (!plans || plans.length === 0) return;

    for (const plan of plans) {
      const targetAmount = plan.total_amount_target || plan.target_amount || 0;
      const currentBalance = plan.current_balance || 0;
      if (targetAmount > 0 && currentBalance >= targetAmount) {
        await notifyAdminPlanGoalReached(plan.id, plan.user_id, currentBalance, targetAmount);
        await supabase
          .from('savings_plans')
          .update({ goal_reached_notified_at: new Date().toISOString() })
          .eq('id', plan.id);
        console.log('[GOAL_REACHED_JOB] Plan', plan.id, 'notifié');
      }
    }
  } catch (e) {
    console.error('[GOAL_REACHED_JOB] Erreur:', e);
  }
}

// Fonction pour gérer les plans d'épargne en retard (pénalités, suspension, notifications)
async function manageOverdueSavings() {
  try {
    console.log('[SAVINGS_OVERDUE] Vérification des plans d\'épargne en retard...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Récupérer tous les plans actifs (non suspendus) avec une date de prochain dépôt
    const { data: plans, error: plansError } = await supabase
      .from('savings_plans')
      .select(`
        id,
        user_id,
        plan_name,
        fixed_amount,
        next_deposit_date,
        current_balance,
        total_deposited,
        interest_rate,
        status,
        is_overdue,
        is_suspended,
        days_overdue,
        overdue_since,
        lost_interest_amount
      `)
      .eq('status', 'active')
      .eq('is_suspended', false)
      .not('next_deposit_date', 'is', null);

    if (plansError) {
      console.error('[SAVINGS_OVERDUE] Erreur récupération plans:', plansError);
      return false;
    }

    if (!plans || plans.length === 0) {
      console.log('[SAVINGS_OVERDUE] Aucun plan actif à vérifier');
      return true;
    }

    let updatedPlans = 0;
    let suspendedCount = 0;

    for (const plan of plans) {
      try {
        const nextDepositDate = new Date(plan.next_deposit_date);
        nextDepositDate.setHours(0, 0, 0, 0);

        if (nextDepositDate >= today) {
          // Pas en retard : remettre is_overdue à false si besoin
          if (plan.is_overdue) {
            await supabase
              .from('savings_plans')
              .update({
                is_overdue: false,
                days_overdue: 0,
                overdue_since: null,
                updated_at: new Date().toISOString()
              })
              .eq('id', plan.id);
            updatedPlans++;
          }
          continue;
        }

        const daysOverdue = Math.floor((today - nextDepositDate) / (1000 * 60 * 60 * 24));
        const currentBalance = parseFloat(plan.current_balance) || 0;
        const totalDeposited = parseFloat(plan.total_deposited) || 0;
        // Intérêts accumulés = solde - dépôts (estimation si pas de colonne total_interest_earned)
        const accumulatedInterest = Math.max(0, currentBalance - totalDeposited);

        // Récupérer le nom du client pour les notifications
        const { data: userData } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', plan.user_id)
          .single();
        const clientName = userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Client' : 'Client';
        const amountFormatted = `${parseInt(plan.fixed_amount || 0).toLocaleString()} FCFA`;

        if (daysOverdue >= 7) {
          // 7+ jours : suspension du plan + perte définitive des intérêts
          const lostInterest = plan.lost_interest_amount != null
            ? parseFloat(plan.lost_interest_amount)
            : accumulatedInterest;

          const { error: updateError } = await supabase
            .from('savings_plans')
            .update({
              is_overdue: true,
              days_overdue: daysOverdue,
              overdue_since: plan.overdue_since || nextDepositDate.toISOString(),
              is_suspended: true,
              suspended_since: new Date().toISOString(),
              lost_interest_amount: Math.round(lostInterest * 100) / 100,
              updated_at: new Date().toISOString()
            })
            .eq('id', plan.id);

          if (updateError) {
            console.error(`[SAVINGS_OVERDUE] Erreur suspension plan #${plan.id}:`, updateError);
          } else {
            updatedPlans++;
            suspendedCount++;
            console.log(`[SAVINGS_OVERDUE] 🚨 Plan #${plan.id} suspendu - ${clientName}: ${daysOverdue} jour(s) de retard, intérêts perdus: ${(lostInterest || 0).toLocaleString()} FCFA`);

            // Notification en base pour le client
            await supabase.from('notifications').insert({
              user_id: plan.user_id,
              title: 'Plan d\'épargne suspendu',
              message: `Bonjour ${clientName}, votre plan "${plan.plan_name || 'Épargne'}" a été suspendu après ${daysOverdue} jours de retard. Les intérêts accumulés (${(lostInterest || 0).toLocaleString()} FCFA) ont été perdus. Contactez l\'équipe pour plus d\'informations.`,
              type: 'savings_plan_suspended',
              priority: 'high',
              read: false,
              data: { plan_id: plan.id, days_overdue: daysOverdue, lost_interest_amount: lostInterest }
            });

            // FCM : notification push via Firebase
            const body = `Votre plan d'épargne a été suspendu après ${daysOverdue} jours de retard. Intérêts perdus: ${(lostInterest || 0).toLocaleString()} FCFA.`;
            await sendFCMNotificationWithDuplicateCheck(plan.user_id, 'AB Campus Finance - Plan d\'épargne suspendu', body, {
              url: '/ab-epargne',
              type: 'savings_plan_suspended',
              planId: plan.id.toString(),
              daysOverdue: daysOverdue.toString()
            });
          }
        } else {
          // 1-6 jours : marquer en retard + avertissement (perte des intérêts à 7j si pas de dépôt)
          const overdueSince = plan.overdue_since || nextDepositDate.toISOString();

          const { error: updateError } = await supabase
            .from('savings_plans')
            .update({
              is_overdue: true,
              days_overdue: daysOverdue,
              overdue_since: overdueSince,
              lost_interest_amount: 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', plan.id);

          if (updateError) {
            console.error(`[SAVINGS_OVERDUE] Erreur mise à jour plan #${plan.id}:`, updateError);
          } else {
            updatedPlans++;
            console.log(`[SAVINGS_OVERDUE] ⚠️ Plan #${plan.id} - ${clientName}: ${daysOverdue} jour(s) de retard`);

            // Notification en base (une seule par jour pour éviter spam: on pourrait vérifier si une notif du jour existe)
            const notifTitle = daysOverdue === 1 ? 'Dépôt d\'épargne en retard' : `Dépôt en retard de ${daysOverdue} jours`;
            const notifMessage = `Bonjour ${clientName}, votre dépôt de ${amountFormatted} pour le plan "${plan.plan_name || 'Épargne'}" est en retard de ${daysOverdue} jour(s). Si vous ne déposez pas dans les 7 jours, vous perdrez les intérêts accumulés et le plan sera suspendu.`;
            await supabase.from('notifications').insert({
              user_id: plan.user_id,
              title: notifTitle,
              message: notifMessage,
              type: 'savings_deposit_overdue',
              priority: 'high',
              read: false,
              data: { plan_id: plan.id, days_overdue: daysOverdue, fixed_amount: plan.fixed_amount }
            });

            // FCM : notification push via Firebase
            const body = `Dépôt en retard de ${daysOverdue} jour(s). Effectuez votre dépôt de ${amountFormatted} pour éviter la suspension.`;
            await sendFCMNotificationWithDuplicateCheck(plan.user_id, 'AB Campus Finance - Dépôt d\'épargne en retard', body, {
              url: '/ab-epargne',
              type: 'savings_deposit_overdue',
              planId: plan.id.toString(),
              daysOverdue: daysOverdue.toString()
            });
          }
        }
      } catch (err) {
        console.error(`[SAVINGS_OVERDUE] Erreur traitement plan #${plan.id}:`, err);
      }
    }

    console.log(`[SAVINGS_OVERDUE] Terminé: ${updatedPlans} plan(s) mis à jour, ${suspendedCount} suspendu(s)`);
    return true;
  } catch (error) {
    console.error('[SAVINGS_OVERDUE] Erreur générale:', error);
    return false;
  }
}

// Job de rattrapage : notifier l'admin pour toute demande de retrait en attente non encore notifiée (garantie sans faille)
async function notifyAdminForPendingWithdrawals() {
  try {
    const { data: pending } = await supabase
      .from('withdrawal_requests')
      .select('id, user_id, savings_plan_id, amount, created_at')
      .eq('status', 'pending')
      .is('admin_notified_at', null)
      .order('created_at', { ascending: true });

    if (!pending || pending.length === 0) return;

    const { data: adminData } = await supabase.from('users').select('id, first_name, last_name').eq('role', 'admin').single();
    if (!adminData) return;

    const userIds = [...new Set(pending.map(r => r.user_id).filter(Boolean))];
    const { data: users } = await supabase.from('users').select('id, first_name, last_name').in('id', userIds);
    const usersMap = {};
    (users || []).forEach(u => { usersMap[u.id] = u; });

    const adminName = adminData.first_name || 'Admin';
    for (const row of pending) {
      const u = usersMap[row.user_id];
      const clientName = u ? `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Client' : 'Client';
      const amountFormatted = `${Number(row.amount).toLocaleString()} FCFA`;
      const title = "Nouvelle demande de retrait";
      const message = `${clientName} demande un retrait de ${amountFormatted}. Cliquez pour traiter la demande.`;

      const { error: notifErr } = await supabase.from('notifications').insert({
        user_id: adminData.id,
        title,
        message,
        type: 'withdrawal_request',
        priority: 'high',
        read: false,
        data: {
          withdrawal_id: row.id,
          plan_id: row.savings_plan_id,
          user_id: row.user_id,
          amount: Number(row.amount),
          client_name: clientName,
          url: '/admin/ab-epargne'
        }
      });
      if (notifErr) {
        console.error('[WITHDRAWAL_JOB] Erreur notification pour', row.id, notifErr);
        continue;
      }

      // FCM : notification push à l'admin via Firebase
      const body = `Hello ${adminName}, ${clientName} demande un retrait de ${amountFormatted}. Cliquez pour traiter la demande.`;
      await sendFCMNotificationWithDuplicateCheck(adminData.id, title, body, {
        url: '/admin/ab-epargne',
        type: 'withdrawal_request',
        withdrawalId: row.id.toString(),
        amount: amountFormatted,
        clientName: clientName,
        userId: row.user_id
      });

      await supabase.from('withdrawal_requests').update({ admin_notified_at: new Date().toISOString() }).eq('id', row.id);
      console.log('[WITHDRAWAL_JOB] Admin notifié pour demande', row.id);
    }
  } catch (e) {
    console.error('[WITHDRAWAL_JOB] Erreur:', e);
  }
}

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
    
    // Exécuter les rappels de prêt, d'épargne et la gestion des retards (prêts + épargne) en parallèle
    Promise.all([
      sendLoanReminderNotifications(),
      sendSavingsDepositReminderNotifications(),
      manageOverdueLoans(),
      manageOverdueSavings()
    ]).then(([loanResults, savingsResults, overdueLoansResults, overdueSavingsResults]) => {
      console.log('[SCHEDULER] Rappels et gestion terminés:', {
        loans: loanResults ? 'Envoyés' : 'Aucun',
        savings: savingsResults ? 'Envoyés' : 'Aucun',
        overdueLoans: overdueLoansResults ? 'Traité' : 'Erreur',
        overdueSavings: overdueSavingsResults ? 'Traité' : 'Erreur'
      });
    }).catch(error => {
      console.error('[SCHEDULER] Erreur lors de l\'exécution des rappels:', error);
    });
    
    // Programmer le prochain rappel pour demain à 11h
    scheduleReminders();
  }, timeUntil11AM);
}

// Route admin pour déclencher manuellement la gestion des prêts en retard
app.post('/api/admin/trigger-overdue-check', requireAdmin, async (req, res) => {
  try {
    console.log('[ADMIN] Déclenchement manuel manageOverdueLoans...');
    const result = await manageOverdueLoans();
    res.json({ success: true, result });
  } catch (error) {
    console.error('[ADMIN] Erreur trigger-overdue-check:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour notifier l'utilisateur de l'approbation de son prêt
app.post('/api/notify-loan-approbation', requireAdmin, async (req, res) => {
  try {
    console.log('[LOAN_APPROVAL_NOTIFICATION] ========== NOTIFICATION APPROBATION DÉCLENCHÉE ==========');
    const { userId, loanAmount, loanId } = req.body;
    
    if (!userId || !loanAmount || !loanId) {
      console.error('[LOAN_APPROVAL_NOTIFICATION] ❌ Paramètres manquants:', { userId, loanAmount, loanId });
      return res.status(400).json({ 
        success: false, 
        error: 'userId, loanAmount et loanId sont requis' 
      });
    }
    
    console.log('[LOAN_APPROVAL_NOTIFICATION] 📋 Paramètres reçus:', { userId, loanAmount, loanId });
    
    // Récupérer les informations de l'utilisateur (dont téléphone pour SMS)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, phone_number')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('[LOAN_APPROVAL_NOTIFICATION] ❌ Utilisateur non trouvé:', userError);
      return res.status(404).json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      });
    }

    const userName = userData.first_name || 'Utilisateur';
    const amountFormatted = `${parseInt(loanAmount).toLocaleString()} FCFA`;
    
    // ⚠️ PROTECTION CONTRE LES DOUBLONS : Vérifier si une notification existe déjà pour ce prêt
    const { data: existingNotif1 } = await supabase
      .from('notifications')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('type', 'loan_approval')
      .filter('data->>loanId', 'eq', loanId)
      .limit(1);
    
    // Vérification alternative avec contains
    const { data: existingNotif2 } = await supabase
      .from('notifications')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('type', 'loan_approval')
      .contains('data', { loanId: loanId })
      .limit(1);
    
    if ((existingNotif1 && existingNotif1.length > 0) || (existingNotif2 && existingNotif2.length > 0)) {
      const found = existingNotif1?.[0] || existingNotif2?.[0];
      console.log('[LOAN_APPROVAL_NOTIFICATION] ⚠️ Notification déjà envoyée pour ce prêt à', found?.created_at, '(évite doublon)');
      return res.json({ success: true, message: 'Notification déjà envoyée pour ce prêt' });
    }
    
    const title = "🎉 Prêt approuvé !";
    const body = `Félicitations ${userName} ! Votre demande de prêt de ${amountFormatted} a été approuvée. Vous pouvez maintenant effectuer votre premier remboursement.`;
    
    // Notification en base + SMS pour que le client reçoive même sans push
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message: body,
      type: 'loan_approval',
      priority: 'high',
      read: false,
      data: { loanId, amount: amountFormatted, url: '/repayment' }
    });
    if (userData.phone_number) {
      const smsText = `CAMPUS FINANCE - Félicitations ! Votre prêt de ${amountFormatted} est approuvé. Vous pouvez effectuer votre premier remboursement.`;
      await sendNotificationSms(userData.phone_number, smsText);
    }
    
    // FCM : notification push via Firebase
    console.log('[LOAN_APPROVAL_NOTIFICATION] 📱 Envoi notification FCM à:', userName);
    const fcmResult = await sendFCMNotificationWithDuplicateCheck(userId, title, body, {
      url: '/repayment',
      loanId: loanId,
      type: 'loan_approved'
    });

    if (fcmResult.success) {
      console.log('[LOAN_APPROVAL_NOTIFICATION] ✅ Notification FCM envoyée avec succès à', userName);
    } else {
      console.error('[LOAN_APPROVAL_NOTIFICATION] ⚠️ FCM non disponible:', fcmResult.error, '(notification DB créée)');
    }

    res.json({ success: true, message: 'Notification d\'approbation envoyée' });
  } catch (error) {
    console.error('[LOAN_APPROVAL_NOTIFICATION] ❌ Erreur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour valider un abonnement push
app.post('/api/validate-subscription', requireAuth, async (req, res) => {
  try {
    const { subscription, userId } = req.body;
    
    if (!subscription || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'subscription et userId sont requis' 
      });
    }
    
    console.log('[VALIDATE_SUBSCRIPTION] Validation d\'abonnement:', { userId });
    
    // Vérifier si l'abonnement existe en base
    const { data: existingSub, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('subscription->>endpoint', subscription.endpoint)
      .single();

    if (fetchError || !existingSub) {
      console.log('[VALIDATE_SUBSCRIPTION] ❌ Abonnement non trouvé en base');
      return res.json({ valid: false, reason: 'not_found' });
    }

    // Vérifier si l'abonnement est récent (moins de 30 jours)
    const subscriptionAge = Date.now() - new Date(existingSub.created_at).getTime();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours

    if (subscriptionAge > maxAge) {
      console.log('[VALIDATE_SUBSCRIPTION] ⚠️ Abonnement ancien, renouvellement recommandé');
      return res.json({ valid: false, reason: 'expired' });
    }

    console.log('[VALIDATE_SUBSCRIPTION] ✅ Abonnement valide');
    res.json({ valid: true, age: Math.round(subscriptionAge / (24 * 60 * 60 * 1000)) });
  } catch (error) {
    console.error('[VALIDATE_SUBSCRIPTION] ❌ Erreur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour notifier l'utilisateur du refus de son prêt
app.post('/api/notify-loan-refus', requireAdmin, async (req, res) => {
  try {
    const { userId, loanAmount, loanId } = req.body;
    
    if (!userId || !loanAmount || !loanId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId, loanAmount et loanId sont requis' 
      });
    }
    
    console.log('[LOAN_REJECTION_NOTIFICATION] Prêt refusé:', { userId, loanAmount, loanId });
    
    // Récupérer les informations de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('[LOAN_REJECTION_NOTIFICATION] ❌ Utilisateur non trouvé:', userError);
      return res.status(404).json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      });
    }

    const userName = userData.first_name || 'Utilisateur';
    const amountFormatted = `${parseInt(loanAmount).toLocaleString()} FCFA`;
    
    // ⚠️ PROTECTION CONTRE LES DOUBLONS : Vérifier si une notification existe déjà pour ce prêt
    const { data: existingNotif } = await supabase
      .from('notifications')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('type', 'loan_rejected')
      .filter('data->>loanId', 'eq', loanId)
      .limit(1);
    
    if (existingNotif && existingNotif.length > 0) {
      console.log('[LOAN_REJECTION_NOTIFICATION] ⚠️ Notification déjà envoyée pour ce prêt (évite doublon)');
      return res.json({ 
        success: true, 
        message: 'Notification déjà envoyée pour ce prêt' 
      });
    }
    
    const title = "Demande de prêt refusée";
    const body = `Bonjour ${userName}, votre demande de prêt de ${amountFormatted} a été refusée. Contactez l'administration pour plus d'informations.`;
    
    // Toujours créer la notification en base (visible dans l'app)
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message: body,
      type: 'loan_rejected',
      priority: 'high',
      read: false,
      data: { loanId, amount: amountFormatted, url: '/client/dashboard' }
    });
    
    console.log('[LOAN_REJECTION_NOTIFICATION] ✅ Notification créée dans la DB');
    
    // FCM : notification push via Firebase
    const fcmResult = await sendFCMNotificationWithDuplicateCheck(userId, title, body, {
      url: '/client/dashboard',
      loanId: loanId,
      type: 'loan_rejected'
    });
    
    if (fcmResult.success) {
      console.log('[LOAN_REJECTION_NOTIFICATION] ✅ Notification FCM envoyée');
    } else {
      console.log('[LOAN_REJECTION_NOTIFICATION] ⚠️ FCM non disponible:', fcmResult.error, '(notification DB créée)');
    }

    res.json({ success: true, message: 'Notification de refus envoyée' });
  } catch (error) {
    console.error('[LOAN_REJECTION_NOTIFICATION] ❌ Erreur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour supprimer définitivement un utilisateur (admin seulement)
app.delete('/api/admin/delete-user/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId est requis' 
      });
    }
    
    console.log('[DELETE_USER] 🗑️ Suppression de l\'utilisateur:', userId);
    
    // 1. Vérifier que l'utilisateur existe
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role, first_name, last_name')
      .eq('id', userId)
      .single();
    
    if (userError || !userData) {
      console.error('[DELETE_USER] ❌ Utilisateur non trouvé:', userError);
      return res.status(404).json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      });
    }
    
    // 2. Empêcher la suppression d'un admin (sécurité)
    if (userData.role === 'admin') {
      console.error('[DELETE_USER] ❌ Tentative de suppression d\'un admin');
      return res.status(403).json({ 
        success: false, 
        error: 'Impossible de supprimer un compte administrateur' 
      });
    }
    
    console.log('[DELETE_USER] 👤 Utilisateur à supprimer:', {
      id: userData.id,
      name: `${userData.first_name} ${userData.last_name}`,
      email: userData.email
    });
    
    // 3. Supprimer les données liées dans public.users (CASCADE devrait gérer les relations)
    // Mais on supprime explicitement pour être sûr
    
    // Supprimer les notifications
    await supabase.from('notifications').delete().eq('user_id', userId);
    
    // Supprimer les abonnements push
    await supabase.from('push_subscriptions').delete().eq('user_id', userId);
    
    // Supprimer les paiements
    await supabase.from('payments').delete().eq('user_id', userId);
    
    // Supprimer les prêts
    await supabase.from('loans').delete().eq('user_id', userId);
    
    // Supprimer les plans d'épargne
    await supabase.from('savings_plans').delete().eq('user_id', userId);
    
    // Supprimer les demandes de retrait
    await supabase.from('withdrawal_requests').delete().eq('user_id', userId);
    
    // 4. Supprimer de la table users
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (deleteUserError) {
      console.error('[DELETE_USER] ❌ Erreur suppression table users:', deleteUserError);
      throw deleteUserError;
    }
    
    // 5. Supprimer de auth.users (nécessite service role)
    try {
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
      
      if (deleteAuthError) {
        console.error('[DELETE_USER] ⚠️ Erreur suppression auth.users:', deleteAuthError);
        // On continue même si ça échoue, car l'utilisateur est déjà supprimé de public.users
        console.log('[DELETE_USER] ⚠️ Utilisateur supprimé de public.users mais erreur pour auth.users');
      } else {
        console.log('[DELETE_USER] ✅ Utilisateur supprimé de auth.users');
      }
    } catch (authError) {
      console.error('[DELETE_USER] ⚠️ Erreur lors de la suppression auth:', authError.message);
      // On continue, l'utilisateur est déjà supprimé de public.users
    }
    
    console.log('[DELETE_USER] ✅ Utilisateur supprimé avec succès');
    
    res.json({ 
      success: true, 
      message: `Utilisateur ${userData.first_name} ${userData.last_name} supprimé définitivement` 
    });
    
  } catch (error) {
    console.error('[DELETE_USER] ❌ Erreur:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erreur lors de la suppression de l\'utilisateur' 
    });
  }
});

// Démarrer le scheduler des rappels
scheduleReminders();

// Rattrapage des demandes de retrait non notifiées : toutes les 2 min + une fois au démarrage (délai 30s)
setTimeout(() => notifyAdminForPendingWithdrawals(), 30 * 1000);
setInterval(notifyAdminForPendingWithdrawals, 2 * 60 * 1000);

// Rattrapage des plans ayant atteint leur objectif : toutes les 5 min + une fois au démarrage (délai 60s)
setTimeout(() => notifyAdminForPlansGoalReached(), 60 * 1000);
setInterval(notifyAdminForPlansGoalReached, 5 * 60 * 1000);

// Job toutes les 30 secondes : vérifier et traiter les paiements manquants
// ⚠️ IMPORTANT : On n'envoie des notifications QUE pour les paiements créés dans les 5 dernières minutes.
// Les anciens paiements ne déclenchent que la sync du statut du prêt, pas de notification (évite le spam).
const PAYMENT_NOTIFICATION_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

async function processMissingPayments() {
  try {
    console.log('[PAYMENT_CHECK_JOB] 🔍 Vérification des paiements non traités...');
    
    if (!supabase) {
      console.error('[PAYMENT_CHECK_JOB] ❌ Client Supabase non disponible');
      return;
    }
    
    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000); // Réduit à 2 minutes pour éviter les boucles
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Récupérer les paiements complétés des dernières 24h (pour sync statut) mais on ne notifiera que les tout récents
    const { data: payments, error } = await supabase
      .from('payments')
      .select('id, loan_id, user_id, amount, transaction_id, status, created_at')
      .eq('status', 'completed')
      .not('transaction_id', 'is', null)
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      // Gérer les erreurs de connexion réseau (fetch failed)
      if (error.message && error.message.includes('fetch failed')) {
        console.error('[PAYMENT_CHECK_JOB] ⚠️ Erreur de connexion réseau (temporaire, réessai au prochain cycle):', {
          message: error.message,
          hint: 'Vérifiez votre connexion internet ou l\'URL Supabase'
        });
      } else {
        console.error('[PAYMENT_CHECK_JOB] ❌ Erreur récupération paiements:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      }
      return; // Retourner silencieusement, le job réessayera au prochain cycle
    }
    
    if (!payments || payments.length === 0) {
      console.log('[PAYMENT_CHECK_JOB] ✅ Aucun paiement récent à vérifier');
      return;
    }
    
    let processed = 0;
    let notificationsSent = 0;
    
    for (const payment of payments) {
      try {
        const loanId = payment.loan_id;
        const userId = payment.user_id;
        if (!loanId || !userId) continue;
        
        // Vérifier si le prêt est toujours actif/overdue
        let loan;
        try {
          const { data: loanData, error: loanError } = await supabase
            .from('loans')
            .select('id, status')
            .eq('id', loanId)
            .single();
          
          if (loanError || !loanData) {
            console.warn(`[PAYMENT_CHECK_JOB] ⚠️ Prêt #${loanId} non trouvé`);
            continue; // Prêt introuvable, passer au suivant
          }
          
          loan = loanData;
        } catch (fetchError) {
          // Gérer les erreurs de connexion réseau
          if (fetchError.message && fetchError.message.includes('fetch failed')) {
            console.warn(`[PAYMENT_CHECK_JOB] ⚠️ Erreur connexion pour prêt #${loanId} (temporaire)`);
          }
          continue; // Passer au paiement suivant
        }
        
        // Utiliser la fonction syncLoanStatusToCompletedIfFullyPaid pour mettre à jour le statut
        // Cette fonction gère correctement le calcul des pénalités et la mise à jour du statut
        let syncResult;
        try {
          syncResult = await syncLoanStatusToCompletedIfFullyPaid(supabase, loanId);
        } catch (syncError) {
          // Gérer les erreurs de synchronisation
          if (syncError.message && syncError.message.includes('fetch failed')) {
            console.warn(`[PAYMENT_CHECK_JOB] ⚠️ Erreur synchronisation prêt #${loanId} (temporaire)`);
          } else {
            console.error(`[PAYMENT_CHECK_JOB] ❌ Erreur synchronisation prêt #${loanId}:`, syncError.message);
          }
          continue; // Passer au paiement suivant
        }
        
        if (syncResult.updated) {
          processed++;
          console.log(`[PAYMENT_CHECK_JOB] ✅ Prêt #${loanId} marqué comme complété`);
        }
        
        // ⚠️ PROTECTION RENFORCÉE : Ne jamais notifier les paiements de plus de 2 minutes (réduit de 5 à 2 min)
        // ET vérifier qu'aucune notification n'existe déjà pour ce paiement
        const paymentCreatedAt = new Date(payment.created_at);
        
        if (paymentCreatedAt < twoMinutesAgo) {
          // Paiement ancien (> 2 min) : on a fait la sync du prêt, on n'envoie PAS de notification
          continue;
        }
        
        // Paiement très récent (< 2 min) : vérifier si une notification existe déjà (double vérification)
        const { data: existingNotifByPayment1 } = await supabase
          .from('notifications')
          .select('id, created_at')
          .eq('type', 'loan_repayment')
          .eq('user_id', userId)
          .filter('data->>payment_id', 'eq', payment.id)
          .limit(1);
        
        // Vérification alternative avec contains
        const { data: existingNotifByPayment2 } = await supabase
          .from('notifications')
          .select('id, created_at')
          .eq('type', 'loan_repayment')
          .eq('user_id', userId)
          .contains('data', { payment_id: payment.id })
          .limit(1);
        
        if ((existingNotifByPayment1 && existingNotifByPayment1.length > 0) || 
            (existingNotifByPayment2 && existingNotifByPayment2.length > 0)) {
          const found = existingNotifByPayment1?.[0] || existingNotifByPayment2?.[0];
          console.log(`[PAYMENT_CHECK_JOB] ⚠️ Notification déjà envoyée pour paiement #${payment.id.substring(0, 8)}... à ${found?.created_at} (évite doublon)`);
          continue;
        }
        
        // Envoyer la notification seulement si elle n'existe pas déjà
        const sent = await sendRepaymentNotifications(loanId, userId, payment.amount, payment.id);
        if (sent) {
          console.log(`[PAYMENT_CHECK_JOB] 📢 Notifications envoyées pour paiement #${payment.id.substring(0, 8)}... (récent < 2 min)`);
          notificationsSent++;
        } else {
          console.log(`[PAYMENT_CHECK_JOB] ⚠️ Notification non envoyée (déjà existante ou erreur)`);
        }
        
      } catch (error) {
        console.error(`[PAYMENT_CHECK_JOB] ❌ Erreur traitement paiement #${payment.id}:`, error.message);
      }
    }
    
    if (processed > 0) {
      console.log(`[PAYMENT_CHECK_JOB] ✅ ${processed} prêt(s) mis à jour`);
    }
    if (notificationsSent > 0) {
      console.log(`[PAYMENT_CHECK_JOB] ✅ ${notificationsSent} notification(s) envoyée(s)`);
    }
    
  } catch (error) {
    console.error('[PAYMENT_CHECK_JOB] ❌ Erreur générale:', error);
  }
}

// Route pour synchroniser le statut d'un prêt (vérifie si entièrement remboursé)
app.post('/api/sync-loan-status', async (req, res) => {
  try {
    const { loanId } = req.body;
    
    if (!loanId) {
      return res.status(400).json({ 
        success: false, 
        error: 'loanId requis' 
      });
    }
    
    console.log('[SYNC_LOAN_STATUS] 🔄 Synchronisation statut prêt:', loanId);
    
    const syncResult = await syncLoanStatusToCompletedIfFullyPaid(supabase, loanId);
    
    if (syncResult.ok && syncResult.updated) {
      res.json({ 
        success: true, 
        updated: true,
        message: 'Statut du prêt synchronisé et mis à jour à "completed"' 
      });
    } else if (syncResult.ok) {
      res.json({ 
        success: true, 
        updated: false,
        message: 'Statut vérifié - prêt pas encore entièrement remboursé' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        updated: false,
        error: 'Erreur lors de la synchronisation' 
      });
    }
  } catch (error) {
    console.error('[SYNC_LOAN_STATUS] ❌ Erreur:', error);
    res.status(500).json({ 
      success: false, 
      updated: false,
      error: error.message 
    });
  }
});

// Route pour déclencher immédiatement les notifications de remboursement
app.post('/api/notify-repayment', async (req, res) => {
  try {
    const { loanId, userId, amount } = req.body;
    
    if (!loanId || !userId || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'loanId, userId et amount sont requis' 
      });
    }
    
    console.log('[NOTIFY_REPAYMENT] 📢 Déclenchement immédiat des notifications:', { loanId, userId, amount });
    
    await sendRepaymentNotifications(loanId, userId, amount);
    
    res.json({ 
      success: true, 
      message: 'Notifications envoyées' 
    });
  } catch (error) {
    console.error('[NOTIFY_REPAYMENT] ❌ Erreur:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ⚠️ JOB DÉSACTIVÉ TEMPORAIREMENT - Cause probable des notifications en boucle
// Démarrer le job de vérification des paiements manquants toutes les 30 secondes (backup)
// setInterval(processMissingPayments, 30 * 1000);
// Exécuter une première fois au démarrage (après 30 secondes pour laisser le serveur démarrer)
// setTimeout(processMissingPayments, 30 * 1000);
console.log('[PAYMENT_CHECK_JOB] ⚠️ Job désactivé temporairement pour éviter les notifications en boucle');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
  console.log(`SMS Mode: ${SMS_MODE}`);
  console.log(`Vonage configured: ${Boolean(process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET)}`);
});