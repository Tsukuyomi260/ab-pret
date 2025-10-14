# 🔴 Configuration FedaPay LIVE - Frontend

## ⚠️ Variables d'environnement Frontend

### **Fichier : `frontend/.env.local`** (créez-le s'il n'existe pas)

```bash
# FedaPay LIVE Configuration
REACT_APP_FEDAPAY_PUBLIC_KEY=pk_live_u0sqkP5Irt1BvqvnU5gh4FOC
REACT_APP_FEDAPAY_SECRET_KEY=sk_live_X4n_vm2IRog0JVH50bj3Xd7x
REACT_APP_FEDAPAY_BASE_URL=https://api.fedapay.com/v1
```

### **⚠️ IMPORTANT**
Le frontend n'a généralement **PAS BESOIN** de `REACT_APP_FEDAPAY_SECRET_KEY` car c'est une clé sensible qui doit rester côté backend uniquement.

---

## ✅ Modifications déjà effectuées

### **Clés publiques hardcodées mises à jour :**

1. **`FedaPayButton.jsx` (ligne 85)**
   - Ancienne : `pk_sandbox_ZXhGKFGNXwn853-mYF9pANmi`
   - Nouvelle : `pk_live_u0sqkP5Irt1BvqvnU5gh4FOC`

2. **`FedaPayEpargneButton.jsx` (ligne 60)**
   - Ancienne : `pk_sandbox_ZXhGKFGNXwn853-mYF9pANmi`
   - Nouvelle : `pk_live_u0sqkP5Irt1BvqvnU5gh4FOC`

---

## 🚀 Redémarrage du frontend

Après avoir créé/modifié `.env.local`, redémarrez le serveur de développement :

```bash
cd frontend
npm start
```

Ou pour la production :

```bash
cd frontend
npm run build
```

---

## 🔒 Sécurité

- ✅ `.env.local` est déjà dans `.gitignore`
- ⚠️ Ne commitez jamais ce fichier
- ⚠️ Pour la production (Vercel), ajoutez ces variables dans les paramètres du projet

