/**
 * Script pour injecter les variables d'environnement Firebase dans firebase-messaging-sw.js
 * Ce script est exécuté avant le build pour remplacer les placeholders par les vraies valeurs
 */

const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement depuis .env
// Note: React Scripts charge automatiquement les variables REACT_APP_* depuis .env
// Mais pour ce script Node.js, on doit les charger manuellement
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    // Ignorer les lignes vides et les commentaires
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return;
    
    // Parser KEY=VALUE (gérer les valeurs avec ou sans guillemets)
    const match = trimmedLine.match(/^([^#=]+?)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Retirer les guillemets si présents
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
  console.log('📋 Variables chargées:', {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? '✅ Présente' : '❌ Manquante',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '(défaut)',
  });
} else if (process.env.REACT_APP_FIREBASE_API_KEY) {
  console.log('📋 Variables d’environnement (ex. Vercel): REACT_APP_FIREBASE_API_KEY présente');
} else {
  console.warn('⚠️ Fichier .env non trouvé et pas de REACT_APP_FIREBASE_API_KEY — définir les variables (Vercel ou .env)');
}

const serviceWorkerPath = path.join(__dirname, '../public/firebase-messaging-sw.js');
const templatePath = path.join(__dirname, '../public/firebase-messaging-sw.template.js');

// Si le template existe, l'utiliser, sinon utiliser le fichier actuel comme base
let swContent;
if (fs.existsSync(templatePath)) {
  swContent = fs.readFileSync(templatePath, 'utf8');
} else {
  swContent = fs.readFileSync(serviceWorkerPath, 'utf8');
}

// Remplacer les placeholders par les variables d'environnement
const replacements = {
  '{{FIREBASE_API_KEY}}': process.env.REACT_APP_FIREBASE_API_KEY || '',
  '{{FIREBASE_AUTH_DOMAIN}}': process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'ab-campus-notif.firebaseapp.com',
  '{{FIREBASE_PROJECT_ID}}': process.env.REACT_APP_FIREBASE_PROJECT_ID || 'ab-campus-notif',
  '{{FIREBASE_STORAGE_BUCKET}}': process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'ab-campus-notif.firebasestorage.app',
  '{{FIREBASE_MESSAGING_SENDER_ID}}': process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '436866264113',
  '{{FIREBASE_APP_ID}}': process.env.REACT_APP_FIREBASE_APP_ID || '1:436866264113:web:46f56ed7745a8c770df910',
};

let finalContent = swContent;
for (const [placeholder, value] of Object.entries(replacements)) {
  finalContent = finalContent.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
}

// Écrire le fichier final
fs.writeFileSync(serviceWorkerPath, finalContent, 'utf8');
console.log('✅ Configuration Firebase injectée dans firebase-messaging-sw.js');
