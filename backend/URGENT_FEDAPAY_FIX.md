# 🚨 URGENT - Fix Erreur d'authentification FedaPay

## ❌ Problème
**Erreur**: "Erreur d'authentification" lors des dépôts/remboursements FedaPay

**Cause**: Incompatibilité entre les clés LIVE et l'URL SANDBOX (ou vice-versa)

---

## ✅ Solution : Créer le fichier `.env.local`

### **ÉTAPE 1 : Créez le fichier `backend/.env.local`**

Dans le dossier `backend`, créez un fichier nommé `.env.local` avec ce contenu :

```bash
# FedaPay LIVE Configuration
FEDAPAY_PUBLIC_KEY=pk_live_u0sqkP5Irt1BvqvnU5gh4FOC
FEDAPAY_SECRET_KEY=sk_live_X4n_vm2IRog0JVH50bj3Xd7x
FEDAPAY_BASE_URL=https://api.fedapay.com
FEDAPAY_CURRENCY=XOF
FEDAPAY_COUNTRY=BJ
```

### **ÉTAPE 2 : Redémarrez le backend**

```bash
cd backend
node server.js
```

---

## 🔄 Alternative : Revenir au mode SANDBOX (pour les tests)

Si vous préférez tester avec le mode SANDBOX d'abord :

### **Option A : Utiliser les clés SANDBOX**

Créez `backend/.env.local` avec :

```bash
# FedaPay SANDBOX Configuration
FEDAPAY_PUBLIC_KEY=pk_sandbox_ZXhGKFGNXwn853-mYF9pANmi
FEDAPAY_SECRET_KEY=sk_sandbox_votre_cle_secrete_sandbox
FEDAPAY_BASE_URL=https://sandbox-api.fedapay.com
FEDAPAY_CURRENCY=XOF
FEDAPAY_COUNTRY=BJ
```

**ET** modifiez aussi le frontend :
- `frontend/src/components/UI/FedaPayButton.jsx` ligne 85 → `pk_sandbox_...`
- `frontend/src/components/UI/FedaPayEpargneButton.jsx` ligne 60 → `pk_sandbox_...`

---

## 📝 Vérification

Une fois le `.env.local` créé et le backend redémarré, le backend devrait afficher :

```
[SAVINGS_DEPOSIT] 🔑 Clé secrète FedaPay: Configurée
```

Au lieu de :

```
[SAVINGS_DEPOSIT] 🔑 Clé secrète FedaPay: MANQUANTE
```

---

## ⚠️ IMPORTANT

**Les clés LIVE et SANDBOX ne sont PAS interchangeables !**

| Type de clé | URL compatible |
|-------------|----------------|
| `pk_live_...` / `sk_live_...` | `https://api.fedapay.com` |
| `pk_sandbox_...` / `sk_sandbox_...` | `https://sandbox-api.fedapay.com` |

---

## 🎯 Modifications déjà faites dans le code

✅ Les URLs ont été mises à jour pour le mode LIVE :
- Ligne 745 : `https://api.fedapay.com`
- Ligne 1456 : `https://api.fedapay.com/v1/transactions`
- Ligne 1516 : `https://api.fedapay.com/v1/transactions`

✅ Frontend mis à jour avec la clé publique LIVE :
- `FedaPayButton.jsx` : `pk_live_u0sqkP5Irt1BvqvnU5gh4FOC`
- `FedaPayEpargneButton.jsx` : `pk_live_u0sqkP5Irt1BvqvnU5gh4FOC`

---

## 🚀 Après avoir créé `.env.local`

1. Redémarrez le backend
2. Testez un dépôt
3. Le paiement devrait fonctionner ! 💰

