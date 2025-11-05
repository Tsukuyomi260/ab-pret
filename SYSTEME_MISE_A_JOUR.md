# 🔄 Système de Mise à Jour Automatique

## 📋 Vue d'ensemble

Le système de mise à jour automatique permet aux utilisateurs de recevoir une notification élégante et non intrusive lorsqu'une nouvelle version de l'application est disponible après un déploiement.

## ✨ Fonctionnalités

- ✅ **Détection automatique** : Vérifie les mises à jour toutes les 5 minutes et lors du retour sur l'application
- ✅ **Prompt élégant** : Interface moderne et non intrusive avec animations fluides
- ✅ **Service Worker** : Utilise le Service Worker pour détecter les nouvelles versions
- ✅ **Version.json** : Fichier de version mis à jour automatiquement à chaque build
- ✅ **Mise à jour en un clic** : L'utilisateur peut mettre à jour en un seul clic

## 🎨 Design du Prompt

Le prompt de mise à jour est :
- **Non intrusif** : Apparaît en bas à droite sans bloquer l'interface
- **Élégant** : Design moderne avec gradient et animations
- **Informatif** : Affiche la version et la date de mise à jour
- **Actionnable** : Boutons clairs pour "Mettre à jour" ou "Plus tard"

## 🔧 Comment ça fonctionne

### 1. Mise à jour automatique du version.json

À chaque build (`npm run build`), le script `scripts/update-version.js` :
- Lit la version depuis `package.json`
- Incrémente le numéro de build
- Met à jour la date de build
- Écrit le nouveau `version.json`

### 2. Détection des mises à jour

Le hook `useAppUpdate` :
- Vérifie le fichier `version.json` toutes les 5 minutes
- Compare avec la version stockée dans `localStorage`
- Détecte les nouvelles versions du Service Worker
- Vérifie aussi lors du retour sur l'application (événement `focus`)

### 3. Affichage du prompt

Le composant `UpdatePrompt` :
- S'affiche automatiquement quand une mise à jour est détectée
- Permet à l'utilisateur de mettre à jour ou d'ignorer
- Se souvient si l'utilisateur a ignoré (pour cette session)

## 📝 Fichiers créés/modifiés

### Nouveaux fichiers

1. **`frontend/public/version.json`**
   - Fichier JSON contenant la version, le build number et la date

2. **`frontend/src/hooks/useAppUpdate.js`**
   - Hook React pour gérer la détection et l'application des mises à jour

3. **`frontend/src/components/UI/UpdatePrompt.jsx`**
   - Composant React pour afficher le prompt de mise à jour

4. **`frontend/scripts/update-version.js`**
   - Script Node.js pour mettre à jour automatiquement version.json

### Fichiers modifiés

1. **`frontend/src/App.js`**
   - Intégration du hook `useAppUpdate`
   - Ajout du composant `UpdatePrompt`

2. **`frontend/package.json`**
   - Ajout du script `prebuild` pour exécuter `update-version.js` avant chaque build

3. **`frontend/public/serviceWorker.js`**
   - Ajout de `version.json` dans les fichiers mis en cache

## 🚀 Utilisation

### Pour les développeurs

1. **Développement normal** :
   ```bash
   npm start
   ```
   Le système fonctionne mais ne détectera les mises à jour qu'en production.

2. **Build pour production** :
   ```bash
   npm run build
   ```
   Le script `prebuild` met automatiquement à jour `version.json` avant le build.

3. **Déploiement** :
   Après avoir fait un push et déployé :
   - Les utilisateurs verront automatiquement le prompt de mise à jour
   - Le prompt apparaîtra dans les 5 minutes suivant leur retour sur l'app

### Pour les utilisateurs

1. **Lorsqu'une mise à jour est disponible** :
   - Un prompt élégant apparaît en bas à droite
   - L'utilisateur peut cliquer sur "Mettre à jour" pour appliquer la mise à jour
   - Ou "Plus tard" pour ignorer (pour cette session)

2. **Mise à jour** :
   - L'application se recharge automatiquement
   - La nouvelle version est immédiatement disponible

## 🔍 Détection des mises à jour

Le système utilise deux méthodes :

### 1. Version.json (Principal)
- Vérifie le fichier `/version.json` toutes les 5 minutes
- Compare avec la version stockée dans `localStorage`
- Détecte les changements de version ou de build number

### 2. Service Worker
- Écoute les événements `updatefound` du Service Worker
- Détecte quand un nouveau Service Worker est installé
- Active la mise à jour si nécessaire

## 🎯 Personnalisation

### Modifier l'intervalle de vérification

Dans `frontend/src/hooks/useAppUpdate.js` :
```javascript
const CHECK_INTERVAL = 5 * 60 * 1000; // Modifier cette valeur
```

### Modifier le design du prompt

Dans `frontend/src/components/UI/UpdatePrompt.jsx` :
- Modifier les couleurs, tailles, animations
- Personnaliser les messages
- Ajouter des informations supplémentaires

### Modifier la version

Dans `frontend/package.json` :
```json
{
  "version": "2.0.0" // Modifier cette valeur
}
```

Le script `update-version.js` utilisera automatiquement cette version.

## 🐛 Dépannage

### Le prompt n'apparaît pas

1. Vérifier que `version.json` est bien généré dans `public/`
2. Vérifier la console pour les erreurs
3. Vérifier que le Service Worker est bien enregistré

### La mise à jour ne fonctionne pas

1. Vider le cache du navigateur
2. Vérifier que le Service Worker est bien actif
3. Vérifier les logs dans la console

### Le version.json n'est pas mis à jour

1. Vérifier que le script `update-version.js` est exécutable
2. Vérifier les permissions du dossier `scripts/`
3. Vérifier que `prebuild` est bien dans `package.json`

## 📊 Test

Pour tester le système :

1. **Créer une nouvelle version** :
   ```bash
   # Modifier la version dans package.json
   npm run build
   ```

2. **Déployer** :
   - Déployer la nouvelle version
   - Ouvrir l'application dans un navigateur
   - Attendre 5 minutes ou revenir sur l'application

3. **Vérifier** :
   - Le prompt devrait apparaître
   - Cliquer sur "Mettre à jour"
   - L'application devrait se recharger avec la nouvelle version

## ✅ Avantages

- **Automatique** : Aucune intervention manuelle nécessaire
- **Non intrusif** : N'interrompt pas l'expérience utilisateur
- **Fiable** : Détection basée sur plusieurs méthodes
- **Élégant** : Interface moderne et professionnelle
- **Efficace** : Mise à jour en un seul clic

---

**Note** : Le système fonctionne mieux en production avec un Service Worker activé. En développement, les mises à jour peuvent ne pas être détectées immédiatement.

