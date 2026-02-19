# 🏆 Système de Fidélité - Flux Complet

## 📊 Vue d'ensemble

Le système de fidélité récompense les clients qui remboursent leurs prêts **à temps** (sans pénalité). Chaque remboursement ponctuel donne **1 étoile**, jusqu'à un maximum de **5 étoiles**.

## 🎯 Étape 1 : Calcul du Score

### Quand le score est calculé ?
- **Automatiquement** après chaque remboursement confirmé (via webhook FedaPay)
- **Manuellement** via la route `/api/trigger-loyalty-check`

### Comment le score est calculé ?
1. Récupère tous les prêts de l'utilisateur
2. Récupère tous les paiements complétés
3. Pour chaque paiement :
   - Vérifie que le prêt est approuvé (`approved_at` existe)
   - Vérifie que le paiement est fait **à temps** (avant ou à la date d'échéance)
   - Ignore les prêts remboursés avant le dernier reset de fidélité
4. Compte le nombre de prêts uniques remboursés à temps
5. Score = min(5, nombre de prêts remboursés à temps)

## 🎉 Étape 2 : Atteinte des 5 Étoiles

### Déclenchement automatique
Quand un utilisateur atteint **5 étoiles** (5 prêts remboursés à temps), le système :

1. **Vérifie** s'il n'y a pas déjà une notification non lue
2. **Crée une notification DB** pour le client
3. **Crée une notification DB** pour l'admin
4. **Envoie une notification FCM** au client (avec son et logo)
5. **Envoie une notification FCM** à l'admin

### Contenu des notifications

#### Client :
- **Titre** : "🏆 AB Campus Finance - Félicitations !"
- **Message** : "Bravo [Nom] ! Vous avez atteint le score de fidélité maximum (5/5) grâce à vos 5 remboursements ponctuels. Votre sérieux et votre fidélité sont remarquables ! Vous serez contacté très bientôt pour recevoir votre récompense."
- **Type** : `loyalty_achievement`
- **URL** : `/loyalty-score` (page de fidélité)

#### Admin :
- **Titre** : "🏆 AB Campus Finance - Score de fidélité atteint"
- **Message** : "L'utilisateur [Nom] a rempli son score de fidélité (5/5). Il attend sa récompense. Contactez-le pour organiser la remise de sa récompense."
- **Type** : `loyalty_achievement_admin`
- **URL** : `/admin/users` (liste des utilisateurs)

## 🎁 Étape 3 : Récompense et Reset

### Processus de récompense

1. **L'admin reçoit la notification** et voit qu'un client a atteint 5 étoiles
2. **L'admin contacte le client** pour organiser la remise de la récompense
3. **L'admin remet la récompense** au client (cadeau, réduction, avantage, etc.)
4. **L'admin réinitialise le compteur** via la route `/api/loyalty-reset-counter`

### Réinitialisation du compteur

Quand l'admin réinitialise le compteur (`/api/loyalty-reset-counter`) :

1. **Met à jour le statut de fidélité** :
   - Si `loyalty_status` est `null` → passe à `Bronze`
   - Si `loyalty_status` est `Bronze` → passe à `Silver`
   - Si `loyalty_status` est `Silver` → passe à `Gold`
   - Si `loyalty_status` est `Gold` → passe à `Diamond`
   - Si `loyalty_status` est `Diamond` → reste `Diamond`

2. **Met à jour `loyalty_last_reset`** avec la date actuelle

3. **Marque les notifications comme lues** :
   - Notification client (`loyalty_achievement`)
   - Notification admin (`loyalty_achievement_admin`)

4. **Le compteur repart à zéro** : Les prochains remboursements à temps recommencent à compter pour atteindre 5 étoiles

## 📈 Progression des Statuts

### Niveaux de fidélité :
- **null** (aucun statut) : Client n'a jamais atteint 5 étoiles
- **Gold** : 1ère fois qu'un client atteint 5 étoiles (après reset)
- **Diamond** : 2ème fois (après reset)
- **Prestige** : 3ème fois et plus (après reset)

### Logique de progression :
- Si `loyalty_status` est `null` → passe à `Gold`
- Si `loyalty_status` est `Gold` → passe à `Diamond`
- Si `loyalty_status` est `Diamond` → passe à `Prestige`
- Si `loyalty_status` est `Prestige` → reste `Prestige`

### Avantages possibles par niveau :
- **Gold** : Réduction de 10% sur les intérêts + priorité sur les demandes
- **Diamond** : Réduction de 15% sur les intérêts + priorité maximale + avantages exclusifs
- **Prestige** : Réduction de 20% sur les intérêts + priorité maximale + avantages VIP

## 🔄 Cycle Complet

```
1. Client rembourse 5 prêts à temps
   ↓
2. Score atteint : 5/5 ⭐⭐⭐⭐⭐
   ↓
3. Notifications envoyées (client + admin)
   ↓
4. Admin contacte le client
   ↓
5. Admin remet la récompense
   ↓
6. Admin réinitialise le compteur
   ↓
7. Statut de fidélité mis à jour (null → Gold → Diamond → Prestige)
   ↓
8. Le compteur repart à zéro
   ↓
9. Le cycle recommence...
```

## 🛠️ Routes API Disponibles

### 1. Vérifier le score d'un utilisateur
```bash
POST /api/trigger-loyalty-check
Body: { "userId": "..." }
```

### 2. Réinitialiser le compteur (Admin uniquement)
```bash
POST /api/loyalty-reset-counter
Body: { "userId": "..." }
```

### 3. Vérifier s'il y a une popup à afficher
```bash
GET /api/loyalty-popup-check
Headers: { "Authorization": "Bearer <token>" }
```

### 4. Notifier l'admin manuellement
```bash
POST /api/trigger-admin-loyalty-notification
Body: { "clientName": "...", "userId": "..." }
```

## 📝 Notes Importantes

1. **Un prêt ne compte qu'une fois** : Même si plusieurs paiements sont faits pour un même prêt, seul le premier remboursement complet compte pour le score.

2. **Les prêts doivent être approuvés** : Seuls les prêts avec `approved_at` sont pris en compte.

3. **Le remboursement doit être à temps** : Le paiement doit être fait avant ou à la date d'échéance (calculée depuis `approved_at` + `duration`).

4. **Pas de doublons** : Si une notification existe déjà et n'est pas lue, une nouvelle notification ne sera pas créée.

5. **Reset nécessaire** : Le compteur ne se réinitialise pas automatiquement. L'admin doit le faire manuellement après avoir remis la récompense.

## 🎯 Cas d'Usage

### Cas 1 : Client fidèle
- Client rembourse toujours à temps
- Atteint rapidement 5 étoiles
- Reçoit sa récompense
- Le compteur est réinitialisé
- Continue à rembourser à temps et atteint à nouveau 5 étoiles
- Passe de null → Gold → Diamond → Prestige

### Cas 2 : Client avec retard
- Client rembourse parfois en retard (avec pénalités)
- Seuls les remboursements à temps comptent
- Les remboursements en retard n'ajoutent pas d'étoile
- Le score reste bas jusqu'à ce qu'il rembourse 5 prêts à temps

### Cas 3 : Nouveau client
- Nouveau client fait sa première demande de prêt
- Rembourse à temps → 1 étoile
- Continue à rembourser à temps → 2, 3, 4, 5 étoiles
- Atteint 5 étoiles → Notification → Récompense → Reset → Gold
