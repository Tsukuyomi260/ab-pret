# Configuration Complète FedaPay - AB Campus Finance

## 🚀 Vue d'ensemble

Ce guide détaille la configuration complète de FedaPay pour l'application AB Campus Finance, incluant la création de transactions, les callback URLs et les métadonnées.

## 📋 Configuration de la Transaction

### 1. Structure de l'objet transaction

```javascript
const transactionData = {
  // Informations de base
  amount: 5000, // Montant en centimes (50 FCFA)
  currency: 'XOF',
  description: 'Remboursement prêt #12345',
  
  // URLs de callback pour différents scénarios
  callback_url: 'https://votre-domaine.com/api/fedapay/webhook',
  success_url: 'https://votre-domaine.com/remboursement/success?transaction_id={transaction_id}&amount=5000&loan_id=12345&user_id=67890',
  failure_url: 'https://votre-domaine.com/remboursement/failure?transaction_id={transaction_id}&amount=5000&loan_id=12345&user_id=67890',
  cancel_url: 'https://votre-domaine.com/remboursement/cancel?transaction_id={transaction_id}&amount=5000&loan_id=12345&user_id=67890',
  
  // Informations client
  customer: {
    email: 'client@example.com',
    firstname: 'John',
    lastname: 'Doe',
    phone: '+2250701234567'
  },
  
  // Métadonnées détaillées pour le suivi
  metadata: {
    loan_id: '12345',
    user_id: '67890',
    type: 'loan_repayment',
    purpose: 'remboursement_pret',
    amount_cents: 5000,
    amount_formatted: '50,00 FCFA',
    created_at: '2024-01-15T10:30:00.000Z',
    platform: 'ab_campus_finance',
    version: '1.0.0'
  },
  
  // Configuration de paiement
  payment_methods: ['mobile_money', 'card', 'bank_transfer'],
  country: 'CI',
  locale: 'fr',
  theme: 'light'
};
```

### 2. Callback URLs

#### A. Webhook principal (`callback_url`)
- **URL** : `https://votre-domaine.com/api/fedapay/webhook`
- **Méthode** : POST
- **Fonction** : Traitement automatique des notifications de paiement
- **Gestion** : Tous les statuts (approved, failed, cancelled, pending)

#### B. URL de succès (`success_url`)
- **URL** : `https://votre-domaine.com/remboursement/success`
- **Paramètres** : `transaction_id`, `amount`, `loan_id`, `user_id`
- **Fonction** : Redirection après paiement réussi
- **Page** : `RepaymentSuccess.jsx`

#### C. URL d'échec (`failure_url`)
- **URL** : `https://votre-domaine.com/remboursement/failure`
- **Paramètres** : `transaction_id`, `amount`, `loan_id`, `user_id`
- **Fonction** : Redirection après échec de paiement
- **Page** : `RepaymentFailure.jsx`

#### D. URL d'annulation (`cancel_url`)
- **URL** : `https://votre-domaine.com/remboursement/cancel`
- **Paramètres** : `transaction_id`, `amount`, `loan_id`, `user_id`
- **Fonction** : Redirection après annulation
- **Page** : `RepaymentCancel.jsx`

### 3. Métadonnées détaillées

#### Informations de base
```javascript
metadata: {
  loan_id: '12345',           // ID du prêt dans la base de données
  user_id: '67890',           // ID de l'utilisateur
  type: 'loan_repayment',     // Type de transaction
  purpose: 'remboursement_pret' // Objectif du paiement
}
```

#### Informations financières
```javascript
metadata: {
  amount_cents: 5000,         // Montant en centimes
  amount_formatted: '50,00 FCFA', // Montant formaté
  currency: 'XOF'             // Devise
}
```

#### Informations techniques
```javascript
metadata: {
  created_at: '2024-01-15T10:30:00.000Z', // Date de création
  platform: 'ab_campus_finance',           // Nom de la plateforme
  version: '1.0.0'                        // Version de l'application
}
```

## 🔄 Flux de paiement complet

### 1. Création de la transaction
```javascript
// POST /api/fedapay/create-transaction
{
  "amount": 5000,
  "loanId": "12345",
  "userId": "67890",
  "description": "Remboursement prêt #12345",
  "customerEmail": "client@example.com",
  "customerName": "John Doe",
  "customerPhone": "+2250701234567"
}
```

### 2. Réponse de création
```javascript
{
  "success": true,
  "transaction_id": "fed_123456789",
  "checkout_url": "https://fedapay.com/checkout/fed_123456789",
  "public_key": "votre_cle_publique_fedapay"
}
```

### 3. Gestion des webhooks
```javascript
// POST /api/fedapay/webhook
{
  "transaction": {
    "id": "fed_123456789",
    "status": "approved", // approved, failed, cancelled, pending
    "amount": 5000,
    "metadata": {
      "loan_id": "12345",
      "user_id": "67890",
      "type": "loan_repayment"
    }
  }
}
```

## 🛠️ Configuration du serveur

### 1. Variables d'environnement
```bash
# Configuration FedaPay
FEDAPAY_PUBLIC_KEY=votre_cle_publique_fedapay
FEDAPAY_SECRET_KEY=votre_cle_secrete_fedapay
FEDAPAY_BASE_URL=https://api.fedapay.com/v1
FEDAPAY_CURRENCY=XOF
FEDAPAY_COUNTRY=CI
```

### 2. Configuration dans server.js
```javascript
const FEDAPAY_CONFIG = {
  secretKey: process.env.FEDAPAY_SECRET_KEY,
  publicKey: process.env.FEDAPAY_PUBLIC_KEY,
  baseUrl: process.env.FEDAPAY_BASE_URL || 'https://api.fedapay.com/v1',
  currency: process.env.FEDAPAY_CURRENCY || 'XOF',
  country: process.env.FEDAPAY_COUNTRY || 'CI'
};
```

## 📱 Interface utilisateur

### 1. Composant FedaPayEmbed
- **Fichier** : `src/components/UI/FedaPayEmbed.jsx`
- **Fonction** : Affichage du popup de paiement
- **Modes** : Simulation (développement) et Production

### 2. Pages de callback
- **Succès** : `src/components/Client/RepaymentSuccess.jsx`
- **Échec** : `src/components/Client/RepaymentFailure.jsx`
- **Annulation** : `src/components/Client/RepaymentCancel.jsx`

## 🔒 Sécurité

### 1. Validation des webhooks
```javascript
// Vérification de l'origine du webhook
if (event.origin !== 'https://fedapay.com' && event.origin !== 'https://api.fedapay.com') {
  return;
}
```

### 2. Validation des données
```javascript
// Vérification des métadonnées requises
if (!loan_id || !user_id) {
  console.error('[FEDAPAY_WEBHOOK] Métadonnées manquantes');
  return res.status(400).json({ success: false, error: 'Métadonnées manquantes' });
}
```

## 🧪 Tests

### 1. Mode développement
```javascript
// Simulation des transactions
const mockTransaction = {
  id: `mock_${Date.now()}`,
  checkout_url: `https://fedapay.com/checkout/mock_${Date.now()}`,
  status: 'pending'
};
```

### 2. Tests de webhook
```bash
# Test avec curl
curl -X POST http://localhost:5000/api/fedapay/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "transaction": {
      "id": "test_123",
      "status": "approved",
      "amount": 5000,
      "metadata": {
        "loan_id": "12345",
        "user_id": "67890"
      }
    }
  }'
```

## 📊 Monitoring et logs

### 1. Logs de transaction
```javascript
console.log('[FEDAPAY_SERVER] Création transaction:', {
  amount,
  loanId,
  userId,
  description: transactionData.description
});
```

### 2. Logs de webhook
```javascript
console.log('[FEDAPAY_WEBHOOK] Réception webhook:', {
  id: transaction.id,
  status: transaction.status,
  amount: transaction.amount,
  metadata: transaction.metadata
});
```

## 🚀 Déploiement

### 1. Production
- Configurez les vraies clés FedaPay
- Définissez les URLs de production
- Activez les webhooks FedaPay
- Testez avec de petits montants

### 2. Monitoring
- Surveillez les logs de webhook
- Vérifiez les transactions en base
- Testez les pages de callback
- Validez les redirections

## 📞 Support

Pour toute question ou problème :
- **Email** : support@campusfinance.com
- **Téléphone** : +225 07 00 00 00 00
- **Documentation FedaPay** : https://docs.fedapay.com
