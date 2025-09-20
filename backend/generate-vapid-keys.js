const webPush = require('web-push');

// Générer les clés VAPID
const vapidKeys = webPush.generateVAPIDKeys();

console.log('🔑 Clés VAPID générées :');
console.log('');
console.log('Clé publique VAPID:');
console.log(vapidKeys.publicKey);
console.log('');
console.log('Clé privée VAPID:');
console.log(vapidKeys.privateKey);
console.log('');
console.log('📝 Ajoutez ces clés à votre fichier .env.local :');
console.log('');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('');
console.log('⚠️  IMPORTANT: Ne partagez jamais votre clé privée VAPID !');
