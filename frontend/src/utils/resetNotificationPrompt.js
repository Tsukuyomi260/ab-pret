// Utilitaire pour réinitialiser le prompt de notifications
// À utiliser pour forcer l'affichage du prompt aux utilisateurs existants

export const resetNotificationPrompt = () => {
  console.log('[RESET NOTIFICATIONS] Réinitialisation du prompt de notifications...');
  
  // Supprimer les clés de localStorage liées aux notifications
  localStorage.removeItem('notification-prompt-seen');
  localStorage.removeItem('notification-prompt-last-seen');
  
  console.log('[RESET NOTIFICATIONS] Prompt réinitialisé - sera affiché au prochain chargement');
};

// Fonction pour vérifier si l'utilisateur doit voir le prompt
export const shouldShowNotificationPrompt = () => {
  const hasSeenPrompt = localStorage.getItem('notification-prompt-seen');
  const lastSeen = localStorage.getItem('notification-prompt-last-seen');
  
  // Si jamais vu, afficher
  if (!hasSeenPrompt) {
    return true;
  }
  
  // Si vu mais pas de timestamp, afficher
  if (!lastSeen) {
    return true;
  }
  
  // Si vu il y a plus de 7 jours, afficher
  const daysSinceLastSeen = (Date.now() - parseInt(lastSeen)) / (1000 * 60 * 60 * 24);
  return daysSinceLastSeen >= 7;
};

// Fonction pour forcer l'affichage du prompt (pour les tests)
export const forceShowNotificationPrompt = () => {
  console.log('[FORCE NOTIFICATIONS] Forçage de l\'affichage du prompt...');
  resetNotificationPrompt();
  
  // Recharger la page pour déclencher l'affichage
  window.location.reload();
};
