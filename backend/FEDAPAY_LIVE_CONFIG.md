# 🔴 Configuration FedaPay en Mode LIVE

## ⚠️ IMPORTANT - Variables d'environnement à mettre à jour

### **Fichier : `backend/.env.local`**

Remplacez les anciennes valeurs par les nouvelles clés **LIVE** :

```bash
# FedaPay LIVE Configuration
FEDAPAY_PUBLIC_KEY=pk_live_u0sqkP5Irt1BvqvnU5gh4FOC
FEDAPAY_SECRET_KEY=sk_live_X4n_vm2IRog0JVH50bj3Xd7x
FEDAPAY_BASE_URL=https://api.fedapay.com
FEDAPAY_CURRENCY=XOF
FEDAPAY_COUNTRY=BJ
```

### **Si vous déployez sur Vercel/Production :**

Ajoutez ces variables d'environnement dans les paramètres de votre projet :

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez :
   - `FEDAPAY_PUBLIC_KEY` = `pk_live_u0sqkP5Irt1BvqvnU5gh4FOC`
   - `FEDAPAY_SECRET_KEY` = `sk_live_X4n_vm2IRog0JVH50bj3Xd7x`
   - `FEDAPAY_BASE_URL` = `https://api.fedapay.com`

---

## ✅ Modifications déjà effectuées dans le code

### **1. Backend (`server.js`)**
- ✅ Ligne 745 : URL de base mise à jour → `https://api.fedapay.com`
- ✅ Ligne 1456 : URL API dépôt épargne → `https://api.fedapay.com/v1/transactions`
- ✅ Ligne 1516 : URL API remboursement prêt → `https://api.fedapay.com/v1/transactions`

### **2. Frontend**
- ✅ `FedaPayButton.jsx` (ligne 85) : Clé publique → `pk_live_u0sqkP5Irt1BvqvnU5gh4FOC`
- ✅ `FedaPayEpargneButton.jsx` (ligne 60) : Clé publique → `pk_live_u0sqkP5Irt1BvqvnU5gh4FOC`

### **3. Boutons utilisant le backend**
- ✅ `FedaPayDepotButton.jsx` : Utilise le backend (pas de modification nécessaire)
- ✅ `FedaPayRemboursementButton.jsx` : Utilise le backend (pas de modification nécessaire)

---

## 🚀 Étapes à suivre

1. **Créez ou modifiez** le fichier `backend/.env.local` avec les nouvelles clés LIVE
2. **Redémarrez** le serveur backend :
   ```bash
   cd backend
   pkill -f "node server.js"
   node server.js
   ```
3. **Si en production**, mettez à jour les variables d'environnement sur votre plateforme de déploiement
4. **Testez** un paiement réel avec un petit montant pour vérifier que tout fonctionne

---

## 🔒 Sécurité

- ⚠️ **NE JAMAIS** commit le fichier `.env.local` sur Git
- ⚠️ **NE JAMAIS** partager votre `FEDAPAY_SECRET_KEY` publiquement
- ✅ Assurez-vous que `.env.local` est bien dans `.gitignore`

---

## 📝 Note

Les URLs sandbox ont été remplacées par les URLs LIVE :
- **Ancien** : `https://sandbox-api.fedapay.com`
- **Nouveau** : `https://api.fedapay.com`

Les clés sandbox ont été remplacées par les clés LIVE :
- **Ancienne clé publique** : `pk_sandbox_ZXhGKFGNXwn853-mYF9pANmi`
- **Nouvelle clé publique** : `pk_live_u0sqkP5Irt1BvqvnU5gh4FOC`
- **Nouvelle clé secrète** : `sk_live_X4n_vm2IRog0JVH50bj3Xd7x`

