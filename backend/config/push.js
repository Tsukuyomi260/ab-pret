const webPush = require("web-push");

// Configuration VAPID de manière paresseuse
let isConfigured = false;

function configureVapid() {
  if (!isConfigured && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webPush.setVapidDetails(
      "mailto:ton-email@domaine.com", // un email valide
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    isConfigured = true;
    console.log('[PUSH] Configuration VAPID réussie');
  } else if (!isConfigured) {
    console.warn('[PUSH] Clés VAPID non configurées. Les notifications push ne fonctionneront pas.');
  }
}

// Wrapper pour s'assurer que VAPID est configuré avant utilisation
const webPushWrapper = {
  sendNotification: async (subscription, payload) => {
    configureVapid();
    return webPush.sendNotification(subscription, payload);
  },
  generateVAPIDKeys: () => {
    return webPush.generateVAPIDKeys();
  }
};

module.exports = webPushWrapper;
