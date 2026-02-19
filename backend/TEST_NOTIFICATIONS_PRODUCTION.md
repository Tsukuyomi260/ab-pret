# 🧪 Guide de Test des Notifications en Production

## Test 1 : Notification d'approbation de prêt

### Via curl (depuis votre machine) :

```bash
curl -X POST https://votre-backend-url.onrender.com/api/notify-loan-approval \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "ID_UTILISATEUR_TEST",
    "loanAmount": "50000",
    "loanId": "ID_PRET_TEST"
  }'
```

### Via l'interface admin :

1. Allez dans l'interface admin
2. Approuvez un prêt
3. Vérifiez que la notification est envoyée automatiquement

## Test 2 : Notification de remboursement

### Via curl :

```bash
curl -X POST https://votre-backend-url.onrender.com/api/notify-repayment \
  -H "Content-Type: application/json" \
  -d '{
    "loanId": "ID_PRET_TEST",
    "userId": "ID_UTILISATEUR_TEST",
    "amount": "50000"
  }'
```

## Test 3 : Notification à tous les utilisateurs

```bash
curl -X POST https://votre-backend-url.onrender.com/api/notifications/test-fcm-all-users \
  -H "Content-Type: application/json"
```

## Vérifications

1. **Vérifier les logs backend** :
   - `[FCM] ✅ Notification envoyée à [nom]`
   - `[REPAYMENT_NOTIF] ✅ Notification FCM client envoyée`
   - `[LOAN_APPROVAL] ✅ Notification envoyée`

2. **Vérifier dans Supabase** :
   - Table `notifications` : vérifier que les notifications sont créées
   - Table `users` : vérifier que `fcm_token` est rempli pour les utilisateurs

3. **Vérifier sur l'appareil** :
   - Ouvrir l'app sur un téléphone/ordinateur
   - Vérifier que la notification arrive avec son et logo
