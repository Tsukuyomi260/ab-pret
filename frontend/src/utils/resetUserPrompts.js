// Utilitaires pour réinitialiser les prompts utilisateur
// Permet aux utilisateurs de réinitialiser leurs préférences PWA et notifications

/**
 * Réinitialise tous les prompts utilisateur
 * Utile pour permettre aux utilisateurs de revoir les prompts
 */
export const resetAllUserPrompts = () => {
  console.log('🔄 Réinitialisation de tous les prompts utilisateur...');
  
  // Réinitialiser les prompts PWA
  localStorage.removeItem('pwa-install-prompt-seen');
  localStorage.removeItem('pwa-install-prompt-dismissed');
  localStorage.removeItem('pwa-install-prompt-last-seen');
  
  // Réinitialiser les prompts de notifications
  localStorage.removeItem('notification-prompt-seen');
  localStorage.removeItem('notification-prompt-declined');
  localStorage.removeItem('notification-prompt-last-seen');
  
  console.log('✅ Tous les prompts ont été réinitialisés');
  return true;
};

/**
 * Réinitialise seulement les prompts PWA
 */
export const resetPWAPrompts = () => {
  console.log('🔄 Réinitialisation des prompts PWA...');
  
  localStorage.removeItem('pwa-install-prompt-seen');
  localStorage.removeItem('pwa-install-prompt-dismissed');
  localStorage.removeItem('pwa-install-prompt-last-seen');
  
  console.log('✅ Prompts PWA réinitialisés');
  return true;
};

/**
 * Réinitialise seulement les prompts de notifications
 */
export const resetNotificationPrompts = () => {
  console.log('🔄 Réinitialisation des prompts de notifications...');
  
  localStorage.removeItem('notification-prompt-seen');
  localStorage.removeItem('notification-prompt-declined');
  localStorage.removeItem('notification-prompt-last-seen');
  
  console.log('✅ Prompts de notifications réinitialisés');
  return true;
};

/**
 * Vérifie l'état actuel des prompts
 */
export const checkPromptStatus = () => {
  const status = {
    pwa: {
      seen: localStorage.getItem('pwa-install-prompt-seen') === 'true',
      dismissed: localStorage.getItem('pwa-install-prompt-dismissed') === 'true',
      lastSeen: localStorage.getItem('pwa-install-prompt-last-seen')
    },
    notifications: {
      seen: localStorage.getItem('notification-prompt-seen') === 'true',
      declined: localStorage.getItem('notification-prompt-declined') === 'true',
      lastSeen: localStorage.getItem('notification-prompt-last-seen')
    }
  };
  
  console.log('📊 État des prompts:', status);
  return status;
};

/**
 * Force l'affichage des prompts (pour les tests)
 */
export const forceShowPrompts = () => {
  console.log('🔧 Forçage de l\'affichage des prompts...');
  
  // Supprimer tous les flags
  resetAllUserPrompts();
  
  // Recharger la page pour déclencher les prompts
  window.location.reload();
};

// Exporter les fonctions pour utilisation dans la console
if (typeof window !== 'undefined') {
  window.resetAllUserPrompts = resetAllUserPrompts;
  window.resetPWAPrompts = resetPWAPrompts;
  window.resetNotificationPrompts = resetNotificationPrompts;
  window.checkPromptStatus = checkPromptStatus;
  window.forceShowPrompts = forceShowPrompts;
  
  console.log(`
🔧 Utilitaires de prompts disponibles dans la console :

• resetAllUserPrompts() - Réinitialise tous les prompts
• resetPWAPrompts() - Réinitialise seulement les prompts PWA
• resetNotificationPrompts() - Réinitialise seulement les prompts de notifications
• checkPromptStatus() - Vérifie l'état actuel des prompts
• forceShowPrompts() - Force l'affichage des prompts (recharge la page)

💡 Utilisez ces fonctions pour tester ou réinitialiser les prompts utilisateur.
  `);
}
