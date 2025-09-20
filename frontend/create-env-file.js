#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Création du fichier .env.local...\n');

const envContent = `# Configuration AB Campus Finance
# Remplacez les valeurs 'your_*' par vos vraies clés

# Configuration Supabase (OBLIGATOIRE)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Configuration du backend API
# En local: http://localhost:5000
# En production: https://ab-pret-back.onrender.com
REACT_APP_BACKEND_URL=http://localhost:5000

# Configuration de l'application
REACT_APP_APP_NAME=AB CAMPUS FINANCE
REACT_APP_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development

# Configuration SMS Mode (développement)
SMS_MODE=echo

# Configuration FedaPay (pour les tests)
FEDAPAY_SECRET_KEY=your_fedapay_secret_key
FEDAPAY_PUBLIC_KEY=your_fedapay_public_key
FEDAPAY_ENVIRONMENT=sandbox

# =====================================================
# INSTRUCTIONS :
# =====================================================
# 1. Remplacez 'your-project.supabase.co' par votre URL Supabase
# 2. Remplacez 'your_supabase_anon_key_here' par votre clé anonyme Supabase
# 3. Pour obtenir ces clés :
#    - Allez sur https://supabase.com
#    - Créez un projet
#    - Allez dans Settings → API
#    - Copiez l'URL et la clé anonyme
# 4. Redémarrez l'application avec : npm start
`;

const envPath = path.join(__dirname, '.env.local');

try {
  // Vérifier si le fichier existe déjà
  if (fs.existsSync(envPath)) {
    console.log('⚠️  Le fichier .env.local existe déjà.');
    console.log('   Voulez-vous le remplacer ? (y/N)');
    
    // En mode non-interactif, on ne remplace pas
    console.log('   Fichier non remplacé. Supprimez-le manuellement si nécessaire.');
    process.exit(0);
  }

  // Créer le fichier
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Fichier .env.local créé avec succès !');
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Ouvrez le fichier .env.local');
  console.log('2. Remplacez les valeurs "your_*" par vos vraies clés Supabase');
  console.log('3. Redémarrez l\'application avec : npm start');
  console.log('\n🔗 Pour obtenir vos clés Supabase :');
  console.log('   - Allez sur https://supabase.com');
  console.log('   - Créez un projet');
  console.log('   - Allez dans Settings → API');
  console.log('   - Copiez l\'URL et la clé anonyme');
  
} catch (error) {
  console.error('❌ Erreur lors de la création du fichier :', error.message);
  console.log('\n📝 Créez manuellement le fichier .env.local avec le contenu suivant :');
  console.log('=' .repeat(50));
  console.log(envContent);
  console.log('=' .repeat(50));
}
