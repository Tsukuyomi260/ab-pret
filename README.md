# 🏦 AB Campus Finance - Monorepo

Application de financement étudiant avec architecture séparée frontend/backend.

## 📁 Structure du projet

```
ab-campus-finance/
├── frontend/          # Application React
│   ├── src/          # Code source React
│   ├── public/       # Fichiers publics
│   ├── package.json  # Dépendances frontend
│   └── vercel.json   # Configuration Vercel frontend
├── backend/          # API Express
│   ├── server.js     # Serveur Express principal
│   ├── utils/        # Utilitaires backend
│   ├── *.sql         # Scripts de base de données
│   ├── test-*.js     # Tests backend
│   ├── package.json  # Dépendances backend
│   └── vercel.json   # Configuration Vercel backend
└── package.json      # Scripts racine
```

## 🚀 Démarrage rapide

### Installation
```bash
# Installer toutes les dépendances
npm run install:all
```

### Développement local
```bash
# Lancer frontend et backend ensemble
npm run dev

# Ou séparément
npm run dev:frontend  # Port 3000
npm run dev:backend   # Port 5000
```

### Build pour production
```bash
npm run build
```

## 🌐 Déploiement

### Frontend (Vercel)
1. Connecter le dossier `/frontend` à Vercel
2. Configurer les variables d'environnement :
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_BACKEND_URL=https://your-backend.vercel.app
   ```

### Backend (Vercel)
1. Connecter le dossier `/backend` à Vercel
2. Configurer les variables d'environnement :
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   FEDAPAY_SECRET_KEY=your_fedapay_secret
   FEDAPAY_PUBLIC_KEY=your_fedapay_public
   FEDAPAY_ENVIRONMENT=live
   REACT_APP_VONAGE_API_KEY=your_vonage_key
   REACT_APP_VONAGE_API_SECRET=your_vonage_secret
   REACT_APP_VONAGE_BRAND_NAME=AB Campus Finance
   ```

## 🔧 Scripts disponibles

### Racine
- `npm run dev` - Lancer frontend + backend
- `npm run build` - Build complet
- `npm run install:all` - Installer toutes les dépendances

### Frontend
- `npm start` - Serveur de développement React
- `npm run build` - Build de production
- `npm test` - Tests

### Backend
- `npm start` - Serveur Express
- `npm run dev` - Serveur avec nodemon
- `npm test` - Tests

## 📊 Technologies utilisées

### Frontend
- React 18
- React Router
- Tailwind CSS
- Supabase Client
- FedaPay React
- Framer Motion

### Backend
- Express.js
- Supabase (Service Role)
- Vonage (SMS)
- FedaPay (Paiements)
- Twilio (SMS de secours)

## 🛡️ Sécurité

- Variables d'environnement sensibles isolées côté backend
- CORS configuré pour la production
- Rate limiting sur les API
- Validation des signatures webhook

## 📞 Support

Pour toute question ou problème, consultez la documentation dans chaque dossier.