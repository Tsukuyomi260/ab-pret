# Guide de Configuration FedaPay - Intégration Embarquée

## 🚀 Configuration Rapide

### Étape 1 : Créer le fichier `.env.local`

Créez un fichier `.env.local` à la racine de votre projet avec ce contenu :

```bash
# Configuration FedaPay (OBLIGATOIRE)
REACT_APP_FEDAPAY_PUBLIC_KEY=votre_cle_publique_fedapay
REACT_APP_FEDAPAY_SECRET_KEY=votre_cle_secrete_fedapay
REACT_APP_FEDAPAY_BASE_URL=https://api.fedapay.com/v1
REACT_APP_FEDAPAY_CURRENCY=XOF
REACT_APP_FEDAPAY_COUNTRY=CI
```

### Étape 2 : Remplacer vos clés FedaPay

Remplacez `votre_cle_publique_fedapay` et `votre_cle_secrete_fedapay` par vos vraies clés FedaPay.

### Étape 3 : Redémarrer l'application

```bash
npm start
```

## 🔧 Comment obtenir vos clés FedaPay

### 1. Créer un compte FedaPay
- Allez sur [https://fedapay.com](https://fedapay.com)
- Créez un compte développeur
- Vérifiez votre compte

### 2. Récupérer vos clés API
- Connectez-vous à votre dashboard FedaPay
- Allez dans **Settings > API Keys**
- Copiez votre **Public Key** et **Secret Key**

### 3. Configurer votre application
- Ajoutez votre domaine dans les **Webhook Settings**
- Configurez l'URL de callback : `https://votre-domaine.com/payment-callback`

## 🎯 Fonctionnalités de l'Intégration Embarquée

### ✅ Avantages
- **Paiement intégré** : Le formulaire FedaPay s'affiche directement dans votre app
- **Pas de redirection** : L'utilisateur reste sur votre site
- **Expérience fluide** : Interface cohérente avec votre design
- **Sécurité** : Communication sécurisée via iframe

### 🔄 Flux de paiement
1. **Clic sur "Effectuer le remboursement"**
2. **Création de la transaction** via l'API FedaPay
3. **Affichage de l'embed** FedaPay dans un modal
4. **Paiement** via Mobile Money dans l'iframe
5. **Notification de succès** et enregistrement en base
6. **Redirection** vers le dashboard

## 🛠️ Composants créés

### 1. `FedaPayEmbed.jsx`
- Composant iframe pour l'intégration FedaPay
- Gestion des messages de paiement
- Interface utilisateur moderne

### 2. Service FedaPay mis à jour
- Support de l'intégration embarquée
- Gestion des transactions
- Validation des données

### 3. Page de remboursement modifiée
- Bouton unique pour lancer le paiement
- Affichage de l'embed FedaPay
- Gestion des états de paiement

## 🧪 Test de l'intégration

### Mode développement
En mode développement, le système utilise des fonctions de simulation :

```javascript
const isDevelopment = process.env.NODE_ENV === 'development';
const paymentResult = isDevelopment 
  ? await simulateFedaPayPayment(paymentData)
  : await initiateFedaPayPayment(paymentData);
```

### Test en production
1. Configurez vos vraies clés FedaPay
2. Testez avec un petit montant
3. Vérifiez l'enregistrement en base de données

## 📱 Interface utilisateur

### Modal FedaPay
- **En-tête** avec logo et montant
- **Iframe** FedaPay intégré
- **Bouton de fermeture**
- **Indicateur de chargement**

### États du paiement
- `loading` : Chargement de l'iframe
- `success` : Paiement réussi
- `error` : Erreur de paiement

## 🔒 Sécurité

### Validation des messages
```javascript
// Vérifier l'origine du message (sécurité)
if (event.origin !== 'https://fedapay.com' && event.origin !== 'https://api.fedapay.com') {
  return;
}
```

### Types de messages gérés
- `fedapay:payment:success` : Paiement réussi
- `fedapay:payment:error` : Erreur de paiement
- `fedapay:payment:cancelled` : Paiement annulé
- `fedapay:embed:ready` : Embed prêt

## 🚨 Dépannage

### Problèmes courants

#### 1. "Données de transaction manquantes"
- Vérifiez que vos clés FedaPay sont correctes
- Assurez-vous que l'API FedaPay répond

#### 2. "Erreur lors de l'initialisation du paiement"
- Vérifiez votre connexion internet
- Contrôlez les logs de la console

#### 3. Iframe ne se charge pas
- Vérifiez que votre domaine est autorisé dans FedaPay
- Contrôlez les paramètres de l'URL d'embed

### Logs de débogage
```javascript
console.log('[FEDAPAY] Initialisation du paiement embarqué:', paymentData);
console.log('[FEDAPAY_EMBED] Message reçu:', data);
console.log('[FEDAPAY_EMBED] Paiement réussi:', data);
```

## 📞 Support

### Documentation FedaPay
- [Documentation officielle](https://docs.fedapay.com)
- [Guide d'intégration](https://docs.fedapay.com/integration)

### Support technique
- Email : support@fedapay.com
- Chat : Disponible sur le dashboard FedaPay

### Votre équipe
- Email : abpret51@gmail.com
- WhatsApp : +225 0700000000

## ✅ Checklist de configuration

- [ ] Fichier `.env.local` créé
- [ ] Clés FedaPay configurées
- [ ] Application redémarrée
- [ ] Test en mode développement
- [ ] Test avec vraies clés
- [ ] Vérification des logs
- [ ] Test de paiement complet

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025  
**Auteur** : Équipe AB Pret



