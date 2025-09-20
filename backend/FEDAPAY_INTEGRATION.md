# Intégration FedaPay - Système de Remboursement de Prêts

## 📋 Vue d'ensemble

Ce document décrit l'intégration de FedaPay pour gérer les remboursements de prêts dans l'application AB Pret. Le système permet aux utilisateurs de rembourser leurs prêts via Mobile Money en utilisant l'API FedaPay.

## 🏗️ Architecture

### Composants principaux

1. **Service FedaPay** (`src/utils/fedaPayService.js`)
   - Gestion des paiements FedaPay
   - Simulation pour les tests
   - Utilitaires de conversion et formatage

2. **API Supabase** (`src/utils/supabaseAPI.js`)
   - Fonctions de gestion des remboursements
   - Intégration avec la base de données

3. **Composant Repayment** (`src/components/Client/Repayment.jsx`)
   - Interface utilisateur pour les remboursements
   - Modal de paiement FedaPay
   - Gestion des états de paiement

## 🔧 Configuration

### Variables d'environnement

```bash
# Clés FedaPay (à configurer en production)
REACT_APP_FEDAPAY_PUBLIC_KEY=votre_cle_publique_fedapay
REACT_APP_FEDAPAY_SECRET_KEY=votre_cle_secrete_fedapay
REACT_APP_FEDAPAY_BASE_URL=https://api.fedapay.com/v1

# Configuration par défaut
REACT_APP_FEDAPAY_CURRENCY=XOF
REACT_APP_FEDAPAY_COUNTRY=CI
```

### Structure de la base de données

#### Table `payments`
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES loans(id),
  user_id UUID REFERENCES users(id),
  amount NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'fedapay',
  fedapay_transaction_id TEXT,
  status TEXT DEFAULT 'pending',
  payment_date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔄 Flux de remboursement

### 1. Initialisation du paiement
```javascript
// L'utilisateur clique sur "Effectuer le remboursement"
const paymentData = {
  amount: convertToCentimes(500), // 500 FCFA en centimes
  currency: 'XOF',
  description: 'Remboursement de prêt - [purpose]',
  customer_email: user.email,
  customer_phone: user.phone_number,
  customer_firstname: user.first_name,
  customer_lastname: user.last_name,
  loan_id: currentLoan.id,
  user_id: user.id
};

const result = await initiateFedaPayPayment(paymentData);
```

### 2. Création de la transaction FedaPay
- Appel à l'API FedaPay avec les données du paiement
- FedaPay retourne un `transaction_id` et `payment_url`
- Le système affiche le modal de paiement

### 3. Vérification du statut
```javascript
// Vérification automatique toutes les 5 secondes
const interval = setInterval(async () => {
  const statusResult = await checkFedaPayPaymentStatus(transactionId);
  
  if (statusResult.data.status === 'approved') {
    // Paiement réussi
    await handleSuccessfulPayment(statusResult.data);
    clearInterval(interval);
  } else if (statusResult.data.status === 'failed') {
    // Paiement échoué
    handleFailedPayment(statusResult.data);
    clearInterval(interval);
  }
}, 5000);
```

### 4. Enregistrement en base de données
```javascript
const repaymentData = {
  loan_id: currentLoan.id,
  user_id: user.id,
  amount: parseFloat(paymentAmount),
  payment_method: 'fedapay',
  fedapay_transaction_id: fedapayData.transaction_id,
  status: 'completed',
  payment_date: fedapayData.paid_at,
  description: `Remboursement de prêt via FedaPay - ${currentLoan.purpose}`,
  fedapay_data: fedapayData
};

const result = await createLoanRepayment(repaymentData);
```

## 🧪 Tests et simulation

### Mode développement
En mode développement, le système utilise des fonctions de simulation :

```javascript
const isDevelopment = process.env.NODE_ENV === 'development';
const paymentResult = isDevelopment 
  ? await simulateFedaPayPayment(paymentData)
  : await initiateFedaPayPayment(paymentData);
```

### Test du système
```bash
# Exécuter le test
node test-fedaPay-repayment.js
```

## 📱 Interface utilisateur

### Modal de paiement FedaPay
- Affichage des détails du paiement
- Statut en temps réel
- Indicateurs visuels (spinner, icônes)
- Messages d'erreur et de succès

### États du paiement
- `idle` : État initial
- `processing` : Paiement en cours
- `success` : Paiement réussi
- `error` : Paiement échoué

## 🔒 Sécurité

### Validation des données
- Vérification du montant minimum
- Validation du numéro de téléphone
- Contrôle des permissions utilisateur

### Gestion des erreurs
- Messages d'erreur traduits
- Logs détaillés pour le débogage
- Fallback en cas d'échec

## 📊 Monitoring

### Logs
```javascript
console.log('[FEDAPAY] Initialisation du paiement:', paymentData);
console.log('[FEDAPAY] Réponse FedaPay:', result);
console.log('[FEDAPAY] Statut du paiement:', status);
```

### Métriques à surveiller
- Taux de succès des paiements
- Temps de traitement moyen
- Erreurs fréquentes
- Performance de l'API

## 🚀 Déploiement

### Prérequis
1. Compte FedaPay actif
2. Clés API configurées
3. Base de données Supabase configurée
4. Variables d'environnement définies

### Étapes de déploiement
1. Configurer les variables d'environnement
2. Tester en mode simulation
3. Passer en mode production
4. Monitorer les premiers paiements

## 🔧 Maintenance

### Mises à jour
- Vérifier les changements de l'API FedaPay
- Mettre à jour les clés si nécessaire
- Tester après chaque déploiement

### Support
- Documentation FedaPay : https://docs.fedapay.com
- Support technique : support@fedapay.com
- Logs d'erreur dans la console

## 📞 Support

Pour toute question ou problème :
- Email : abpret51@gmail.com
- WhatsApp : +225 0700000000
- Documentation technique : Ce fichier

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025  
**Auteur** : Équipe AB Pret



