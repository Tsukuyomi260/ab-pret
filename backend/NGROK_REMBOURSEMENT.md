# Remboursement FedaPay (local et production)

## Comment ça marche maintenant

- **FedaPay** redirige l'utilisateur vers la page frontend **`/remboursement-retour`** après le paiement (`callback_url` = frontend), avec l'ID de transaction dans l'URL (`id`, `reference`, `txId` ou `transaction_id`).
- **Le webhook FedaPay** (URL configurée dans le dashboard FedaPay vers ton backend, ex. ngrok en local) est **le seul** qui crée le paiement en base et met à jour le prêt. Dès que FedaPay envoie le webhook, le backend enregistre le paiement, met le prêt à `completed` si tout est remboursé, et envoie les notifications (FCM, etc.).
- **La page de retour** ne fait **que** vérifier : elle appelle **`GET /api/loans/repayment-status?id=...`** (polling toutes les 2 s, max 10 fois). Si le paiement et le prêt sont trouvés → message de succès et redirection. Sinon → message « Remboursement en cours de traitement » et redirection sans erreur. **Aucun appel à `process-payment-manually`** depuis cette page.

**En local** : il faut que FedaPay puisse joindre ton backend (ex. **ngrok**) pour le webhook, sinon le prêt ne sera pas mis à jour automatiquement. La page de retour affichera « en cours de traitement » et redirigera ; après traitement manuel ou une fois le webhook reçu, le prêt sera à jour.

---

## Pourquoi ça ne marchait plus / ce qui a changé

- Les **doublons webhook** : quand le webhook recevait un retry pour un paiement déjà traité, il ne mettait pas à jour le prêt. Désormais, même en cas de doublon, on appelle `syncLoanStatusToCompletedIfFullyPaid` pour que le prêt passe à `completed`.
- La **page de retour** appelait `process-payment-manually`, ce qui provoquait des erreurs (statut transaction undefined) et des logs « manual payment ». Elle a été modifiée pour **ne plus appeler** cette route : uniquement polling `repayment-status`.

---

## Si FedaPay n'ajoute pas l'ID de transaction à l'URL

Si après paiement l'utilisateur arrive sur `/remboursement-retour` **sans** `id`, `reference`, `txId` ou `transaction_id` dans l'URL, le frontend ne peut pas vérifier le remboursement. Dans ce cas :

1. **Option webhook** : configure dans le **dashboard FedaPay** une URL de webhook vers ton backend (en prod ou via ngrok en local), ex. `https://ton-backend.com/api/fedapay/webhook`.
2. **Option manuelle** : récupère l'ID de transaction dans le dashboard FedaPay, puis appelle toi-même :
   ```
   POST /api/fedapay/process-payment-manually
   Content-Type: application/json
   { "transaction_id": "ID_DE_LA_TRANSACTION_FEDAPAY" }
   ```

---

## Remboursement déjà effectué mais prêt toujours actif

1. Vérifier dans **Supabase** → table **`payments`** s'il existe une ligne avec le `transaction_id` FedaPay de ce remboursement.
2. Si **non** : appeler **`POST /api/fedapay/process-payment-manually`** avec le `transaction_id` (dashboard FedaPay ou URL de retour si elle contient l'ID).
3. Si le **paiement** existe déjà mais pas le statut du prêt : utiliser un script ou une route qui appelle `syncLoanStatusToCompletedIfFullyPaid` pour le `loan_id` concerné.
