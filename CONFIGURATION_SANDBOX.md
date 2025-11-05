# 🔧 Configuration Sandbox FedaPay

## ⚠️ Configuration pour les fichiers `.env.local`

### **Backend (`backend/.env.local`)**

```bash
# Supabase
SUPABASE_URL=https://dlgfhgcczqefbuhcyazh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZ2ZoZ2NjenFlZmJ1aGN5YXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDM3NjQsImV4cCI6MjA3MDE3OTc2NH0.ILqv7fUAP8KAr0GzkqeqaRqDcbKcPhcHtIQR7PYFIgY

# Vonage SMS
VONAGE_API_KEY=your_vonage_api_key
VONAGE_API_SECRET=your_vonage_api_secret
VONAGE_BRAND_NAME=AB Campus Finance

# Backend API
BACKEND_URL=http://localhost:5000

# Email (optionnel)
RESEND_API_KEY=your_resend_api_key

# SMS Mode
SMS_MODE=echo

# FedaPay SANDBOX Configuration
FEDAPAY_BASE_URL=https://sandbox-api.fedapay.com
FEDAPAY_SECRET_KEY=sk_sandbox_zQfrV6wyvCHlZXdOHAHJzvJ6
FEDAPAY_PUBLIC_KEY=pk_sandbox_ZXhGKFGNXwn853-mYF9pANmi
FEDAPAY_ENVIRONMENT=sandbox
FEDAPAY_CURRENCY=XOF
FEDAPAY_COUNTRY=BJ
```

### **Frontend (`frontend/.env.local`)**

```bash
# Supabase
REACT_APP_SUPABASE_URL=https://dlgfhgcczqefbuhcyazh.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZ2ZoZ2NjenFlZmJ1aGN5YXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDM3NjQsImV4cCI6MjA3MDE3OTc2NH0.ILqv7fUAP8KAr0GzkqeqaRqDcbKcPhcHtIQR7PYFIgY

# Vonage SMS (optionnel)
REACT_APP_VONAGE_API_KEY=your_vonage_api_key
REACT_APP_VONAGE_API_SECRET=your_vonage_api_secret
REACT_APP_VONAGE_BRAND_NAME=AB Campus Finance

# Backend API
REACT_APP_BACKEND_URL=http://localhost:5000

# Email (optionnel)
REACT_APP_RESEND_API_KEY=your_resend_api_key

# Configuration Application
REACT_APP_APP_NAME=AB CAMPUS FINANCE
REACT_APP_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development

# FedaPay SANDBOX Configuration
REACT_APP_FEDAPAY_PUBLIC_KEY=pk_sandbox_ZXhGKFGNXwn853-mYF9pANmi
REACT_APP_FEDAPAY_BASE_URL=https://sandbox-api.fedapay.com/v1
REACT_APP_FEDAPAY_ENVIRONMENT=sandbox
```

---

## ✅ Modifications effectuées dans le code

### **Backend**
- ✅ `FEDAPAY_CONFIG.environment` : Valeur par défaut changée de `'live'` à `'sandbox'`

### **Frontend**
- ✅ `FedaPayEpargneButton.jsx` : Clé publique par défaut changée vers sandbox
- ✅ `FedaPayButton.jsx` : Clé publique par défaut changée vers sandbox
- ✅ `fedaPayService.js` : Clé publique et environnement par défaut changés vers sandbox

---

## 🚀 Prochaines étapes

1. **Mettre à jour `backend/.env.local`** avec les valeurs sandbox ci-dessus
2. **Mettre à jour `frontend/.env.local`** avec les valeurs sandbox ci-dessus
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
5. **Tester un paiement** avec les cartes de test FedaPay sandbox

---

## 📝 Notes importantes

- ⚠️ Les valeurs sandbox sont maintenant les valeurs **par défaut** dans le code
- ✅ Les variables d'environnement dans `.env.local` ont toujours la priorité
- 🔄 Pour repasser en LIVE, il suffit de changer les valeurs dans `.env.local` et redémarrer

---

**✅ Configuration Sandbox activée !**

