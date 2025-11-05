# 🔴 Configuration FedaPay en Mode LIVE

## ⚠️ Variables d'environnement à configurer

### **Backend (`backend/.env.local`)**

```bash
# FedaPay LIVE Configuration
FEDAPAY_BASE_URL=https://api.fedapay.com/v1
FEDAPAY_SECRET_KEY=sk_live_X4n_vm2IRog0JVH50bj3Xd7x
FEDAPAY_PUBLIC_KEY=pk_live_u0sqkP5Irt1BvqvnU5gh4FOC
FEDAPAY_ENVIRONMENT=live
FEDAPAY_CURRENCY=XOF
FEDAPAY_COUNTRY=BJ
```

**⚠️ IMPORTANT** : 
- `FEDAPAY_BASE_URL` doit être `https://api.fedapay.com/v1` (sans `/transactions/ID`)
- Le code gère automatiquement l'ajout de `/transactions` dans les appels API

### **Frontend (`frontend/.env.local`)**

```bash
# FedaPay LIVE Configuration
REACT_APP_FEDAPAY_PUBLIC_KEY=pk_live_u0sqkP5Irt1BvqvnU5gh4FOC
REACT_APP_FEDAPAY_BASE_URL=https://api.fedapay.com/v1
REACT_APP_FEDAPAY_ENVIRONMENT=live
```

**⚠️ Note** : Le frontend n'a pas besoin de la clé secrète (sécurité).

---

## ✅ Modifications effectuées dans le code

### **Backend**
- ✅ Valeurs par défaut mises à jour vers LIVE
- ✅ Gestion intelligente de l'URL (suppression automatique de `/transactions/ID` si présent)
- ✅ Toutes les routes utilisent les variables d'environnement

### **Frontend**
- ✅ Clés publiques par défaut mises à jour vers LIVE
- ✅ Tous les composants FedaPay utilisent les variables d'environnement

---

## 🚀 Prochaines étapes

1. **Mettre à jour `backend/.env.local`** avec les valeurs LIVE ci-dessus
2. **Mettre à jour `frontend/.env.local`** avec les valeurs LIVE ci-dessus
3. **Redémarrer le backend** :
   ```bash
   cd backend
   npm run dev
   ```
4. **Redémarrer le frontend** :
   ```bash
   cd frontend
   npm start
   ```
5. **Tester un paiement** avec un petit montant pour vérifier que tout fonctionne

---

## 🌐 Production (Vercel/Render)

### **Backend (Render, Heroku, etc.)**
Ajoutez ces variables dans les paramètres de votre projet :
- `FEDAPAY_BASE_URL` = `https://api.fedapay.com/v1`
- `FEDAPAY_SECRET_KEY` = `sk_live_X4n_vm2IRog0JVH50bj3Xd7x`
- `FEDAPAY_PUBLIC_KEY` = `pk_live_u0sqkP5Irt1BvqvnU5gh4FOC`
- `FEDAPAY_ENVIRONMENT` = `live`

### **Frontend (Vercel, Netlify, etc.)**
Ajoutez ces variables dans les paramètres de votre projet :
- `REACT_APP_FEDAPAY_PUBLIC_KEY` = `pk_live_u0sqkP5Irt1BvqvnU5gh4FOC`
- `REACT_APP_FEDAPAY_BASE_URL` = `https://api.fedapay.com/v1`
- `REACT_APP_FEDAPAY_ENVIRONMENT` = `live`

---

## 🔒 Sécurité

- ✅ Les clés secrètes ne sont jamais exposées dans le frontend
- ✅ Toutes les clés sont stockées dans les variables d'environnement
- ✅ Les fichiers `.env.local` sont dans `.gitignore`

---

## ⚠️ Important

- Les clés LIVE et SANDBOX ne sont **PAS** interchangeables
- Assurez-vous d'utiliser les bonnes URLs avec les bonnes clés
- En production, utilisez **TOUJOURS** les clés LIVE

