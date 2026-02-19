# 🏆 Guide de Test - Notifications Loyalty (5 Étoiles)

## 📋 Comment fonctionne le système de fidélité

### Calcul du score
- **1 étoile** = 1 prêt remboursé à temps (sans pénalité)
- **2 étoiles** = 2 prêts remboursés à temps
- **3 étoiles** = 3 prêts remboursés à temps
- **4 étoiles** = 4 prêts remboursés à temps
- **5 étoiles** = 5 prêts remboursés à temps ⭐ **→ Notification automatique !**

### Conditions pour compter un prêt
- Le prêt doit être **approuvé** (`approved_at` existe)
- Le remboursement doit être **complété** (`status = 'completed'`)
- Le remboursement doit être fait **à temps** (avant ou à la date d'échéance)
- Les prêts remboursés après le dernier reset de fidélité sont ignorés

## 🧪 Test 1 : Vérifier le score d'un utilisateur

### Via curl :
```bash
curl -X POST http://localhost:5000/api/trigger-loyalty-check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "VOTRE_USER_ID"
  }'
```

### Réponse attendue :
```json
{
  "success": true,
  "message": "Vérification de fidélité effectuée avec succès"
}
```

### Logs backend attendus :
```
[LOYALTY] Vérification du score de fidélité pour l'utilisateur: <userId>
[LOYALTY] Score calculé: { userId: '...', onTimeLoansCount: 5, loyaltyScore: 5 }
[LOYALTY] ✅ Notification client créée dans la DB
[LOYALTY] ✅ Notification admin créée dans la DB
[FCM] ✅ Notification envoyée à <nom_client>
[ADMIN_LOYALTY] Notification admin pour score de fidélité: { clientName: '...', userId: '...' }
```

## 🧪 Test 2 : Simuler un remboursement qui déclenche la notification

### Étapes :
1. **Créer 5 prêts** pour un utilisateur (via l'interface admin)
2. **Approuver les 5 prêts** (ils doivent avoir `approved_at`)
3. **Effectuer 5 remboursements à temps** (avant la date d'échéance)
4. **Le 5ème remboursement** déclenchera automatiquement la notification

### Ou via le webhook FedaPay :
Quand un remboursement est confirmé via le webhook, la fonction `checkAndNotifyLoyaltyAchievement` est automatiquement appelée.

## 📱 Notifications envoyées

### 1. Notification Client (FCM + DB)
- **Titre** : "🏆 AB Campus Finance - Félicitations !"
- **Message** : "Bravo [Nom] ! Vous avez atteint le score de fidélité maximum (5/5) grâce à vos 5 remboursements ponctuels. Votre sérieux et votre fidélité sont remarquables ! Vous serez contacté très bientôt pour recevoir votre récompense."
- **Type** : `loyalty_achievement`
- **URL** : `/loyalty-score`
- **Données** : `{ showPopup: true, score: 5, clientName: '...', userId: '...' }`

### 2. Notification Admin (FCM + DB)
- **Titre** : "🏆 AB Campus Finance - Score de fidélité atteint"
- **Message** : "L'utilisateur [Nom] a rempli son score de fidélité (5/5). Il attend sa récompense. Contactez-le pour organiser la remise de sa récompense."
- **Type** : `loyalty_achievement_admin`
- **URL** : `/admin/users`
- **Données** : `{ showPopup: true, clientName: '...', userId: '...', targetUserId: '...' }`

## ✅ Vérifications

1. **Dans Supabase** :
   - Table `notifications` : Vérifier que 2 notifications sont créées (1 client + 1 admin)
   - Table `users` : Vérifier le `loyalty_status` de l'utilisateur

2. **Sur l'appareil** :
   - Le client reçoit une notification push avec son et logo
   - L'admin reçoit une notification push
   - Les notifications apparaissent dans la liste des notifications

3. **Dans les logs backend** :
   - `[LOYALTY] Score calculé: ...`
   - `[LOYALTY] ✅ Notification client créée dans la DB`
   - `[LOYALTY] ✅ Notification admin créée dans la DB`
   - `[FCM] ✅ Notification envoyée à ...`

## 🔄 Ce qui se passe ensuite

Voir le document `LOYALTY_SYSTEM_FLOW.md` pour les détails complets.
