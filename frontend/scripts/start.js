#!/usr/bin/env node

/**
 * Script de démarrage du frontend compatible Windows / macOS / Linux.
 * Définit BROWSER=none et PORT=3001 puis lance le script start de react-app-rewired local.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

process.env.BROWSER = 'none';
process.env.PORT = '3001';

const frontendDir = path.resolve(__dirname, '..');
const rewiredStartScript = path.join(
  frontendDir,
  'node_modules',
  'react-app-rewired',
  'scripts',
  'start.js'
);

if (!fs.existsSync(rewiredStartScript)) {
  console.error(
    "Erreur : react-app-rewired introuvable dans node_modules.\n" +
    "Exécutez dans le dossier frontend : npm install"
  );
  process.exit(1);
}

const child = spawn(process.execPath, [rewiredStartScript], {
  stdio: 'inherit',
  env: process.env,
  cwd: frontendDir,
  shell: false,
});

child.on('exit', (code) => process.exit(code ?? 0));
