#!/usr/bin/env node

/**
 * Script pour mettre à jour automatiquement le fichier version.json
 * lors du build de l'application
 */

const fs = require('fs');
const path = require('path');

const versionFilePath = path.join(__dirname, '../public/version.json');
const packageJsonPath = path.join(__dirname, '../package.json');

try {
  // Lire le package.json pour obtenir la version
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const appVersion = packageJson.version || '1.0.0';

  // Lire le version.json actuel
  let versionData = {
    version: appVersion,
    buildDate: new Date().toISOString(),
    buildNumber: 1
  };

  if (fs.existsSync(versionFilePath)) {
    const currentVersion = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
    // Incrémenter le build number
    versionData.buildNumber = (currentVersion.buildNumber || 0) + 1;
  }

  // Écrire le nouveau version.json
  fs.writeFileSync(
    versionFilePath,
    JSON.stringify(versionData, null, 2),
    'utf8'
  );

  // Mettre à jour le CACHE_NAME dans le Service Worker pour invalider le cache à chaque déploiement
  const swPath = path.join(__dirname, '../public/serviceWorker.js');
  if (fs.existsSync(swPath)) {
    const cacheName = `ab-campus-finance-v${versionData.version}-b${versionData.buildNumber}`;
    let swContent = fs.readFileSync(swPath, 'utf8');
    swContent = swContent.replace(
      /const CACHE_NAME = '[^']+';/,
      `const CACHE_NAME = '${cacheName}';`
    );
    fs.writeFileSync(swPath, swContent, 'utf8');
    console.log(`   Cache SW: ${cacheName}`);
  }

  console.log('✅ Version mise à jour:');
  console.log(`   Version: ${versionData.version}`);
  console.log(`   Build Number: ${versionData.buildNumber}`);
  console.log(`   Build Date: ${versionData.buildDate}`);
} catch (error) {
  console.error('❌ Erreur lors de la mise à jour de la version:', error);
  process.exit(1);
}

