// Utilitaires pour tester le système de prompt de notifications

// Fonction pour réinitialiser complètement le prompt (pour les tests)
export const resetNotificationPromptForTesting = () => {
  localStorage.removeItem('notification-prompt-seen');
  localStorage.removeItem('notification-prompt-last-seen');
  console.log('🧪 [TEST] Prompt de notification réinitialisé pour les tests');
};

// Fonction pour simuler un utilisateur non abonné
export const simulateUnsubscribedUser = () => {
  resetNotificationPromptForTesting();
  console.log('🧪 [TEST] Simulation d\'un utilisateur non abonné');
};

// Fonction pour vérifier l'état du prompt
export const checkPromptState = () => {
  const hasSeenPrompt = localStorage.getItem('notification-prompt-seen');
  const lastSeen = localStorage.getItem('notification-prompt-last-seen');
  
  console.log('🧪 [TEST] État du prompt:');
  console.log('   - A vu le prompt:', hasSeenPrompt);
  console.log('   - Dernière fois vu:', lastSeen ? new Date(parseInt(lastSeen)).toLocaleString() : 'Jamais');
  
  if (lastSeen) {
    const daysSinceLastSeen = (Date.now() - parseInt(lastSeen)) / (1000 * 60 * 60 * 24);
    console.log('   - Jours depuis la dernière fois:', Math.round(daysSinceLastSeen));
  }
  
  return {
    hasSeenPrompt: !!hasSeenPrompt,
    lastSeen: lastSeen ? parseInt(lastSeen) : null,
    daysSinceLastSeen: lastSeen ? (Date.now() - parseInt(lastSeen)) / (1000 * 60 * 60 * 24) : null
  };
};

// Fonction pour tester les conditions d'affichage du prompt
export const testPromptConditions = () => {
  console.log('🧪 [TEST] Test des conditions d\'affichage du prompt:');
  
  const isSupported = "serviceWorker" in navigator && "PushManager" in window;
  const permission = Notification.permission;
  
  console.log('   - Notifications supportées:', isSupported);
  console.log('   - Permission actuelle:', permission);
  console.log('   - Service Worker disponible:', "serviceWorker" in navigator);
  console.log('   - PushManager disponible:', "PushManager" in window);
  
  const promptState = checkPromptState();
  
  // Simuler les conditions
  const shouldShow = isSupported && 
                    permission !== 'denied' && 
                    (!promptState.hasSeenPrompt || (promptState.daysSinceLastSeen && promptState.daysSinceLastSeen >= 3));
  
  console.log('   - Devrait afficher le prompt:', shouldShow);
  
  return {
    isSupported,
    permission,
    shouldShow,
    promptState
  };
};

// Fonction pour forcer l'affichage du prompt (pour les tests)
export const forceShowPromptForTesting = () => {
  resetNotificationPromptForTesting();
  console.log('🧪 [TEST] Prompt forcé pour les tests - rechargez la page');
};

// Fonction pour simuler un utilisateur qui a refusé
export const simulateDeniedUser = () => {
  resetNotificationPromptForTesting();
  // Note: On ne peut pas changer la permission programmatiquement, 
  // mais on peut simuler l'état
  console.log('🧪 [TEST] Simulation d\'un utilisateur qui a refusé');
  console.log('   - Pour tester, refusez manuellement les notifications dans votre navigateur');
};

// Fonction pour tester le cycle complet
export const testCompleteNotificationFlow = async () => {
  console.log('🧪 [TEST] Test du cycle complet de notifications...');
  
  // 1. Vérifier l'état initial
  console.log('\n1. État initial:');
  const initialState = testPromptConditions();
  
  // 2. Réinitialiser pour le test
  console.log('\n2. Réinitialisation pour le test:');
  resetNotificationPromptForTesting();
  
  // 3. Vérifier l'état après réinitialisation
  console.log('\n3. État après réinitialisation:');
  const resetState = testPromptConditions();
  
  console.log('\n✅ Test terminé. Rechargez la page pour voir le prompt.');
  
  return {
    initialState,
    resetState
  };
};

// Exporter toutes les fonctions pour utilisation dans la console
if (typeof window !== 'undefined') {
  window.testNotificationPrompt = {
    resetNotificationPromptForTesting,
    simulateUnsubscribedUser,
    checkPromptState,
    testPromptConditions,
    forceShowPromptForTesting,
    simulateDeniedUser,
    testCompleteNotificationFlow
  };
  
  console.log('🧪 [TEST] Utilitaires de test chargés. Utilisez:');
  console.log('   - testNotificationPrompt.testCompleteNotificationFlow()');
  console.log('   - testNotificationPrompt.checkPromptState()');
  console.log('   - testNotificationPrompt.forceShowPromptForTesting()');
}
