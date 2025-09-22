// Script pour forcer l'affichage du prompt de notifications
// À exécuter dans la console du navigateur pour réinitialiser les prompts

export const forceNotificationPromptForAllUsers = () => {
  console.log('🔄 Réinitialisation du prompt de notifications pour tous les utilisateurs...');
  
  // Supprimer toutes les clés liées aux notifications
  localStorage.removeItem('notification-prompt-seen');
  localStorage.removeItem('notification-prompt-last-seen');
  
  // Optionnel: supprimer aussi les abonnements existants pour forcer un nouveau prompt
  // localStorage.removeItem('push-subscription');
  
  console.log('✅ Prompt réinitialisé ! Il sera affiché au prochain chargement de la page.');
  console.log('💡 Rechargez la page pour voir le prompt.');
  
  return true;
};

// Fonction pour tester le prompt immédiatement
export const testNotificationPrompt = () => {
  console.log('🧪 Test du prompt de notifications...');
  
  // Réinitialiser
  forceNotificationPromptForAllUsers();
  
  // Recharger la page
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};

// Instructions pour l'utilisateur
export const showNotificationInstructions = () => {
  console.log(`
🔔 Instructions pour les notifications push :

1. Pour réinitialiser le prompt pour tous les utilisateurs :
   forceNotificationPromptForAllUsers()

2. Pour tester le prompt immédiatement :
   testNotificationPrompt()

3. Pour vérifier l'état actuel :
   console.log('Prompt vu:', localStorage.getItem('notification-prompt-seen'))
   console.log('Dernière fois:', localStorage.getItem('notification-prompt-last-seen'))

4. Le prompt s'affichera si :
   - L'utilisateur n'a jamais vu le prompt OU
   - L'utilisateur a vu le prompt il y a plus de 7 jours ET n'est pas abonné

5. Les notifications sont maintenant activées en développement et en production
  `);
};

// Afficher les instructions au chargement
if (typeof window !== 'undefined') {
  showNotificationInstructions();
}
