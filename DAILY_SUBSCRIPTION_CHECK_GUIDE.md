# 🔔 Guide de Vérification Quotidienne des Abonnements

## 🎯 Nouveau Comportement

Le prompt de notification s'affiche maintenant **uniquement** si l'abonnement de l'utilisateur est désactivé ou inactif, avec une vérification quotidienne automatique.

## ⚙️ Fonctionnement du Système

### 1. Vérification Quotidienne
- **Fréquence** : Toutes les 24 heures
- **Déclenchement** : Au chargement de l'app + intervalle quotidien
- **Vérification** : État de l'abonnement push dans le navigateur

### 2. États des Abonnements

#### ✅ Abonnement Actif
- L'utilisateur est abonné aux notifications
- Le prompt ne s'affiche **PAS**
- Statut stocké : `subscription-active: true`

#### ⚠️ Abonnement Inactif
- L'abonnement a expiré ou été supprimé
- Le prompt **PEUT** s'afficher
- Statut stocké : `subscription-inactive: true`

### 3. Logique d'Affichage du Prompt

Le prompt s'affiche **SEULEMENT** si :
1. ✅ L'utilisateur n'a **PAS** définitivement refusé les notifications
2. ✅ L'utilisateur n'est **PAS** déjà abonné
3. ✅ L'abonnement est marqué comme **inactif**
4. ✅ Le prompt n'a **PAS** été vu dans les dernières 24h

## 🔄 Cycle de Vérification

```
Démarrage de l'app
       ↓
Vérification immédiate de l'abonnement
       ↓
┌─────────────────┬─────────────────┐
│   Abonnement    │   Abonnement    │
│     Actif       │    Inactif      │
│                 │                 │
│ Prompt: NON     │ Prompt: OUI     │
│ (si conditions)  │ (si conditions) │
└─────────────────┴─────────────────┘
       ↓
Vérification quotidienne (24h)
       ↓
Mise à jour des statuts
```

## 🛠️ Pour les Développeurs

### Vérifier l'État Actuel
```javascript
// Dans la console du navigateur :
console.log('Abonnement actif:', localStorage.getItem('subscription-active'));
console.log('Abonnement inactif:', localStorage.getItem('subscription-inactive'));
console.log('Dernière vérification:', localStorage.getItem('subscription-last-check'));
```

### Forcer une Vérification
```javascript
// Simuler un abonnement inactif
localStorage.setItem('subscription-inactive', 'true');
localStorage.removeItem('subscription-active');
localStorage.removeItem('notification-prompt-seen');

// Recharger la page pour déclencher la vérification
window.location.reload();
```

### Tester le Système
```bash
# Exécuter le script de test
cd backend && node test-daily-subscription-check.js
```

## 📊 Avantages du Nouveau Système

- ✅ **Respect des choix utilisateur** : Pas de prompts répétitifs
- ✅ **Vérification intelligente** : Seulement si l'abonnement est inactif
- ✅ **Maintenance automatique** : Vérification quotidienne
- ✅ **Expérience optimisée** : Prompts contextuels et pertinents

## 🎯 Résultat

Le système vérifie maintenant quotidiennement l'état des abonnements et n'affiche le prompt de notification que lorsque c'est nécessaire (abonnement inactif), offrant une expérience utilisateur optimale sans spam de prompts.

---

*Le système est maintenant plus intelligent et respectueux des préférences utilisateur.*
