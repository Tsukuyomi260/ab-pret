# Guide de Test des Notifications - AB CAMPUS FINANCE

## 🎯 Système de Test des Notifications Implémenté

Un système complet de test des notifications de prêt a été mis en place pour permettre de tester les notifications push en local et en production.

## 🛠️ Composants Implémentés

### 1. **Endpoint Backend de Test**
- **Route**: `POST /api/test-loan-notification`
- **Fonctionnalités**:
  - Envoi de notifications de test aux utilisateurs
  - 3 types de notifications : approbation, rappel, retard
  - Sauvegarde dans la base de données
  - Gestion des erreurs et statistiques

### 2. **Interface Admin de Test**
- **Route**: `/admin/test-notifications`
- **Fonctionnalités**:
  - Sélection d'utilisateur avec abonnement push
  - Choix du type de notification
  - Affichage des résultats en temps réel
  - Informations sur l'environnement

### 3. **Script de Test en Ligne de Commande**
- **Fichier**: `backend/test-loan-notification.js`
- **Fonctionnalités**:
  - Test depuis le terminal
  - Liste des utilisateurs avec abonnements
  - Test de différents types de notifications

## 🚀 Comment Tester

### Méthode 1: Interface Admin (Recommandée)

1. **Accéder à l'interface**:
   - Se connecter en tant qu'admin
   - Aller dans le menu "Menu" → "Test Notifications"
   - Ou directement : `/admin/test-notifications`

2. **Configurer le test**:
   - Sélectionner un utilisateur approuvé avec abonnement push
   - Choisir le type de notification :
     - **Approbation** : Prêt approuvé (50,000 FCFA)
     - **Rappel** : Rappel de remboursement (25,000 FCFA)
     - **Retard** : Prêt en retard avec pénalités (30,000 FCFA)

3. **Envoyer la notification**:
   - Cliquer sur "Envoyer la notification de test"
   - Voir les résultats en temps réel

### Méthode 2: Script en Ligne de Commande

1. **Lister les utilisateurs avec abonnements**:
   ```bash
   cd backend
   node test-loan-notification.js list
   ```

2. **Tester une notification**:
   ```bash
   # Notification d'approbation (défaut)
   node test-loan-notification.js <userId>
   
   # Notification de rappel
   node test-loan-notification.js <userId> reminder
   
   # Notification de retard
   node test-loan-notification.js <userId> overdue
   ```

### Méthode 3: API Directe

```bash
# Test via curl
curl -X POST http://localhost:5000/api/test-loan-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "testType": "approval"
  }'
```

## 📱 Types de Notifications de Test

### 1. **Notification d'Approbation** (`approval`)
- **Titre**: "🎉 AB Campus Finance - Prêt approuvé !"
- **Message**: "Félicitations [Prénom] ! Votre prêt de 50,000 FCFA a été approuvé. Vous pouvez maintenant procéder au remboursement."
- **Montant**: 50,000 FCFA
- **Actions**: Voir le prêt, Fermer

### 2. **Notification de Rappel** (`reminder`)
- **Titre**: "⏰ AB Campus Finance - Rappel de remboursement"
- **Message**: "Bonjour [Prénom], n'oubliez pas que votre prêt de 25,000 FCFA arrive à échéance dans 3 jours."
- **Montant**: 25,000 FCFA
- **Actions**: Voir le prêt, Fermer

### 3. **Notification de Retard** (`overdue`)
- **Titre**: "⚠️ AB Campus Finance - Prêt en retard"
- **Message**: "Attention [Prénom], votre prêt de 30,000 FCFA est en retard. Des pénalités s'appliquent."
- **Montant**: 30,000 FCFA
- **Actions**: Voir le prêt, Fermer

## 🔧 Configuration des Tests

### Environnement Local
- **Backend URL**: `http://localhost:5000`
- **Frontend URL**: `http://localhost:3001`
- **Base de données**: Supabase local

### Environnement Production
- **Backend URL**: `https://ab-pret-back.onrender.com`
- **Frontend URL**: `https://ab-cf1.vercel.app`
- **Base de données**: Supabase production

## 📊 Résultats des Tests

### Informations Affichées
- **Utilisateur cible**: Nom, prénom, email
- **Type de test**: Type de notification envoyée
- **Abonnements trouvés**: Nombre d'abonnements push
- **Notifications envoyées**: Nombre de notifications réussies
- **Erreurs**: Nombre d'erreurs d'envoi
- **Contenu**: Titre et message de la notification

### Codes de Statut
- **✅ Succès**: Notification envoyée et sauvegardée
- **❌ Erreur**: Problème d'envoi ou de sauvegarde
- **⚠️ Avertissement**: Aucun abonnement trouvé

## 🧪 Scénarios de Test

### Test 1: Notification d'Approbation
1. Sélectionner un utilisateur avec abonnement push
2. Choisir "Prêt approuvé"
3. Envoyer la notification
4. Vérifier que l'utilisateur reçoit la notification
5. Vérifier que la notification apparaît dans l'historique

### Test 2: Notification de Rappel
1. Sélectionner un utilisateur avec abonnement push
2. Choisir "Rappel de remboursement"
3. Envoyer la notification
4. Vérifier le contenu et les actions

### Test 3: Notification de Retard
1. Sélectionner un utilisateur avec abonnement push
2. Choisir "Prêt en retard"
3. Envoyer la notification
4. Vérifier le contenu et les actions

## 🔍 Dépannage

### Problème: "Aucun abonnement push trouvé"
- **Cause**: L'utilisateur n'a pas activé les notifications push
- **Solution**: Demander à l'utilisateur d'activer les notifications dans l'app

### Problème: "Erreur de connexion au serveur"
- **Cause**: Le backend n'est pas accessible
- **Solution**: Vérifier que le serveur backend est démarré

### Problème: "Utilisateur non trouvé"
- **Cause**: L'ID utilisateur est incorrect
- **Solution**: Utiliser la liste des utilisateurs pour obtenir le bon ID

## 📈 Métriques de Test

### À Surveiller
- **Taux de succès**: Pourcentage de notifications envoyées avec succès
- **Temps de réponse**: Délai entre l'envoi et la réception
- **Erreurs d'envoi**: Types d'erreurs les plus fréquentes
- **Engagement**: Nombre d'utilisateurs qui interagissent avec les notifications

### Logs à Consulter
- **Backend**: Logs du serveur pour les erreurs d'envoi
- **Frontend**: Console du navigateur pour les erreurs de réception
- **Base de données**: Table `notifications` pour l'historique

## 🎉 Avantages du Système de Test

1. **Test en temps réel**: Voir immédiatement si les notifications fonctionnent
2. **Environnements multiples**: Tester en local et en production
3. **Types variés**: Tester différents scénarios de notifications
4. **Interface intuitive**: Interface admin facile à utiliser
5. **Scripts automatisés**: Tests en ligne de commande pour l'automatisation
6. **Historique complet**: Toutes les notifications de test sont sauvegardées

---

**🚀 Le système de test des notifications est maintenant opérationnel !**

Vous pouvez tester les notifications de prêt en local et en production pour vous assurer qu'elles fonctionnent correctement pour tous les utilisateurs.
