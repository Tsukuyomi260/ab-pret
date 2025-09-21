# Configuration Production Backend

## Variables d'environnement requises pour la production

```bash
# Configuration Production Backend
NODE_ENV=production

# Configuration Supabase (OBLIGATOIRE)
REACT_APP_SUPABASE_URL=https://dlgfhgcczqefbuhcyazh.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZ2ZoZ2NjenFlZmJ1aGN5YXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDM3NjQsImV4cCI6MjA3MDE3OTc2NH0.ILqv7fUAP8KAr0GzkqeqaRqDcbKcPhcHtIQR7PYFIgY

# Configuration Vonage pour SMS 
REACT_APP_VONAGE_API_KEY=5991994e
REACT_APP_VONAGE_API_SECRET=TXqA0XxEzJQWBtfI
REACT_APP_VONAGE_BRAND_NAME=AB Campus Finance

# Configuration du backend API
REACT_APP_BACKEND_URL=https://ab-pret-back.onrender.com

# Configuration Frontend URL pour les callbacks
FRONTEND_URL=https://ab-cf1.vercel.app

# Configuration SMS Mode
SMS_MODE=echo

# Configuration FedaPay
FEDAPAY_SECRET_KEY=sk_sandbox_zQfrV6wyvCHlZXdOHAHJzvJ6
FEDAPAY_PUBLIC_KEY=pk_sandbox_ZXhGKFGNXwn853-mYF9pANmi
FEDAPAY_BASE_URL=https://sandbox-api.fedapay.com
FEDAPAY_CURRENCY=XOF
FEDAPAY_COUNTRY=BJ
FEDAPAY_ENVIRONMENT=sandbox

# Configuration Web Push
VAPID_PUBLIC_KEY=BE9VFV1KtXEMvnO08dDmURfaPzKIl3jSvdc3W57qf4hm7njmbfbGfIIRaFFwEkifmh7pcuveEWvXbSMsbVa1LS0
VAPID_PRIVATE_KEY=ZY87Cj43T1fobf_ci_2NqQx1kTDAEH0CP4AwFZQkrIg
```

## URLs de callback automatiques

Le backend utilise maintenant une fonction `getFrontendUrl()` qui :

- **En développement** : Utilise `http://localhost:3001`
- **En production** : Utilise `https://ab-cf1.vercel.app`

## Déploiement

1. **Render (Backend)** : Configurer les variables d'environnement ci-dessus
2. **Vercel (Frontend)** : L'URL de callback sera automatiquement `https://ab-cf1.vercel.app`

## Test

Pour tester en local avec les URLs de production :
```bash
NODE_ENV=production FRONTEND_URL=https://ab-cf1.vercel.app node server.js
```
