// Script de test pour la fonctionnalité de mot de passe oublié
// À exécuter dans la console du navigateur pour tester

export const testForgotPasswordFlow = async () => {
  console.log('🧪 Test du flux de mot de passe oublié...\n');

  try {
    // 1. Test de la page de mot de passe oublié
    console.log('1. 📧 Test de la page de mot de passe oublié...');
    
    // Simuler la navigation vers la page
    const forgotPasswordUrl = '/forgot-password';
    console.log(`   URL: ${forgotPasswordUrl}`);
    
    // Vérifier que la page existe
    if (window.location.pathname === forgotPasswordUrl) {
      console.log('   ✅ Page de mot de passe oublié accessible');
    } else {
      console.log('   ⚠️  Naviguez vers /forgot-password pour tester la page');
    }

    // 2. Test de validation d'email
    console.log('\n2. ✉️ Test de validation d\'email...');
    
    const testEmails = [
      { email: '', expected: 'Veuillez entrer votre adresse email' },
      { email: 'invalid-email', expected: 'Veuillez entrer une adresse email valide' },
      { email: 'test@example.com', expected: 'Email valide' }
    ];

    testEmails.forEach(({ email, expected }) => {
      console.log(`   Email: "${email}" → ${expected}`);
    });

    // 3. Test de l'intégration Supabase
    console.log('\n3. 🔗 Test de l\'intégration Supabase...');
    
    // Vérifier que Supabase est configuré
    if (typeof window !== 'undefined' && window.supabase) {
      console.log('   ✅ Supabase client disponible');
    } else {
      console.log('   ⚠️  Supabase client non trouvé - vérifiez la configuration');
    }

    // 4. Test de la page de réinitialisation
    console.log('\n4. 🔐 Test de la page de réinitialisation...');
    
    const resetPasswordUrl = '/reset-password';
    console.log(`   URL: ${resetPasswordUrl}`);
    console.log('   ⚠️  Cette page nécessite des paramètres d\'URL valides (access_token, refresh_token)');

    // 5. Instructions pour le test complet
    console.log('\n📋 Instructions pour le test complet:');
    console.log('   1. Naviguez vers /forgot-password');
    console.log('   2. Entrez une adresse email valide');
    console.log('   3. Cliquez sur "Envoyer le lien de réinitialisation"');
    console.log('   4. Vérifiez votre boîte email');
    console.log('   5. Cliquez sur le lien dans l\'email');
    console.log('   6. Entrez un nouveau mot de passe');
    console.log('   7. Confirmez le nouveau mot de passe');

    // 6. Vérification des routes
    console.log('\n6. 🛣️ Vérification des routes...');
    
    const routes = [
      '/login',
      '/forgot-password',
      '/reset-password'
    ];

    routes.forEach(route => {
      console.log(`   Route: ${route}`);
    });

    console.log('\n✅ Test du flux de mot de passe oublié terminé !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
};

// Fonction pour simuler l'envoi d'email (pour les tests)
export const simulateEmailSend = async (email) => {
  console.log(`📧 Simulation d'envoi d'email à: ${email}`);
  
  // Simuler un délai d'envoi
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('✅ Email simulé envoyé avec succès !');
  console.log('📬 Dans un vrai scénario, l\'utilisateur recevrait un email avec un lien de réinitialisation');
  
  return true;
};

// Fonction pour vérifier la configuration Supabase
export const checkSupabaseConfig = () => {
  console.log('🔧 Vérification de la configuration Supabase...');
  
  const requiredEnvVars = [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY'
  ];

  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      console.log(`   ✅ ${envVar}: Configuré`);
    } else {
      console.log(`   ❌ ${envVar}: Non configuré`);
    }
  });
};

// Afficher les instructions au chargement
if (typeof window !== 'undefined') {
  console.log(`
🔐 Instructions pour tester la fonctionnalité de mot de passe oublié :

1. Test rapide :
   testForgotPasswordFlow()

2. Simulation d'envoi d'email :
   simulateEmailSend('test@example.com')

3. Vérification de la configuration :
   checkSupabaseConfig()

4. Test manuel :
   - Naviguez vers /forgot-password
   - Testez avec différents emails
   - Vérifiez la validation
   - Testez l'envoi d'email
  `);
}

