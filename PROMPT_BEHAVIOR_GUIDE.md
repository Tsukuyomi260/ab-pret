# 🔔 Guide du Comportement des Prompts

## ✅ Problème Résolu

Les prompts d'installation PWA et de notifications ne s'affichent plus de manière répétitive. Voici comment ils fonctionnent maintenant :

## 📱 Prompt d'Installation PWA

### Comportement Actuel :
- **Première visite** : Le prompt s'affiche après 3 secondes si l'app est installable
- **Après acceptation** : Le prompt ne s'affiche plus jamais
- **Après refus** : Le prompt ne s'affiche plus jamais
- **App déjà installée** : Le prompt ne s'affiche jamais

### Vérifications Effectuées :
1. ✅ L'app est-elle déjà installée ?
2. ✅ L'utilisateur a-t-il déjà accepté l'installation ?
3. ✅ L'utilisateur a-t-il déjà refusé l'installation ?

## 🔔 Prompt de Notifications

### Comportement Actuel :
- **Première visite** : Le prompt s'affiche si les notifications sont supportées
- **Après acceptation** : Le prompt ne s'affiche plus jamais
- **Après refus** : Le prompt ne s'affiche plus jamais
- **Déjà abonné** : Le prompt ne s'affiche jamais

### Vérifications Effectuées :
1. ✅ Les notifications sont-elles supportées ?
2. ✅ L'utilisateur est-il déjà abonné ?
3. ✅ L'utilisateur a-t-il déjà refusé les notifications ?

## 🛠️ Pour les Développeurs

### Réinitialiser les Prompts (Tests) :
```javascript
// Dans la console du navigateur :
resetPWAInstallPrompt();        // Réinitialiser le prompt PWA
resetNotificationPrompt();      // Réinitialiser le prompt notifications
resetAllUserPrompts();         // Réinitialiser les deux prompts
```

### Vérifier l'État Actuel :
```javascript
// Vérifier l'état PWA
console.log('PWA Install Seen:', localStorage.getItem('pwa-install-prompt-seen'));
console.log('PWA Install Dismissed:', localStorage.getItem('pwa-install-prompt-dismissed'));
console.log('PWA Install Accepted:', localStorage.getItem('pwa-install-accepted'));

// Vérifier l'état Notifications
console.log('Notification Prompt Seen:', localStorage.getItem('notification-prompt-seen'));
console.log('Notification Prompt Declined:', localStorage.getItem('notification-prompt-declined'));
```

## 🎯 Résultat

- ✅ **Plus de prompts répétitifs**
- ✅ **Respect des choix de l'utilisateur**
- ✅ **Expérience utilisateur améliorée**
- ✅ **Prompts intelligents et contextuels**

---

*Les prompts ne s'affichent maintenant qu'une seule fois et respectent les préférences de l'utilisateur.*
