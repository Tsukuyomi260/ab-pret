# 🚀 Guide de Mise en Production - AB Campus Finance

## 📋 Checklist avant le déploiement

### 1. **Variables d'environnement Backend** (`backend/.env`)

#### ✅ Variables à modifier pour la production :

```env
# ===== FEDAPAY (PRODUCTION) =====
FEDAPAY_ENVIRONMENT=live  # ⚠️ Changer de 'sandbox' à 'live'
FEDAPAY_BASE_URL=https://api.fedapay.com  # ⚠️ Changer de sandbox à live
FEDAPAY_PUBLIC_KEY=pk_live_XXXXXXXXXXXXX  # ⚠️ Clé publique LIVE
FEDAPAY_SECRET_KEY=sk_live_XXXXXXXXXXXXX  # ⚠️ Clé secrète LIVE

# ===== FRONTEND URL (PRODUCTION) =====
FRONTEND_URL=https://ab-cf1.vercel.app  # ⚠️ URL de production Vercel
# Ne pas mettre localhost en production !

# ===== BACKEND URL (si backend déployé) =====
BACKEND_URL=https://ab-pret-back.onrender.com  # ⚠️ URL de votre backend en production
# Ou votre URL de backend si déployé ailleurs

# ===== SUPABASE (Déjà configuré, vérifier) =====
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # ✅ Déjà configuré
# Cette clé permet au backend de contourner RLS

# ===== FIREBASE FCM (PRODUCTION) =====
# Le fichier firebase-service-account.json doit être présent dans backend/
# Voir section "Firebase Service Account" ci-dessous

# ===== SMS (PRODUCTION) =====
SMS_MODE=live  # ⚠️ Changer de 'echo' à 'live' pour envoyer de vrais SMS
REACT_APP_VONAGE_API_KEY=XXXXXXXXXXXXX  # ✅ Déjà configuré
REACT_APP_VONAGE_API_SECRET=XXXXXXXXXXXXX  # ✅ Déjà configuré

# ===== PORT =====
PORT=5000  # Ou le port de votre hébergeur (Render utilise automatiquement)
```

### 2. **Variables d'environnement Frontend** (`frontend/.env`)

```env
# ===== BACKEND URL (PRODUCTION) =====
REACT_APP_BACKEND_URL=https://ab-pret-back.onrender.com  # ⚠️ URL de votre backend en production
# Ne pas mettre localhost en production !

# ===== SUPABASE (Déjà configuré) =====
REACT_APP_SUPABASE_URL=https://dlgfhgcczqefbuhcyazh.supabase.co  # ✅ Déjà configuré
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # ✅ Déjà configuré

# ===== FIREBASE FCM (PRODUCTION) =====
REACT_APP_FIREBASE_VAPID_KEY=BJfHsbhtQhWA-laTTi9Ffq36xHSO8ylv-T4aU5Db6xlN5xhGqXBKtDtzcAi8qdiXimz6S-M2PxjgxNNXFftfGvQ  # ✅ Déjà configuré
# Cette clé est la même en dev et prod (pas de problème de sécurité)
```

### 3. **Firebase Service Account** (`firebase-service-account.json`)

#### ⚠️ Pourquoi ce fichier est dans `.gitignore` ?

Le fichier `firebase-service-account.json` contient des **clés secrètes** qui donnent accès complet à votre projet Firebase. C'est comme un mot de passe administrateur. Il ne doit **JAMAIS** être commité sur GitHub car :
- N'importe qui avec ce fichier peut envoyer des notifications en votre nom
- Peut accéder à toutes vos données Firebase
- Peut modifier votre configuration Firebase

#### ✅ Comment le configurer en production ?

**Option 1 : Uploader le fichier sur votre hébergeur (Recommandé pour Render)**

1. Téléchargez le fichier depuis Firebase Console :
   - Firebase Console → Paramètres du projet → Comptes de service
   - Cliquez sur "Générer une nouvelle clé privée"
   - Téléchargez le fichier JSON

2. Sur Render (ou votre hébergeur) :
   - Allez dans les variables d'environnement de votre service backend
   - Ajoutez une variable `FIREBASE_SERVICE_ACCOUNT_PATH` pointant vers le fichier
   - OU uploadez le fichier directement sur le serveur

**Option 2 : Utiliser les variables d'environnement (Recommandé pour Vercel/Railway)**

1. Créez une variable d'environnement `FIREBASE_SERVICE_ACCOUNT_JSON` avec le contenu JSON complet
2. Le backend créera automatiquement le fichier au démarrage

**Option 3 : Stocker dans un service de secrets (Recommandé pour production)**

- Utilisez AWS Secrets Manager, Google Secret Manager, ou HashiCorp Vault
- Chargez le fichier au démarrage du backend

### 4. **Configuration FedaPay Webhook en Production**

#### ⚠️ IMPORTANT : Configurer le webhook dans FedaPay

1. Allez sur [FedaPay Dashboard](https://dashboard.fedapay.com)
2. Paramètres → Webhooks
3. Ajoutez l'URL de votre backend :
   ```
   https://ab-pret-back.onrender.com/api/fedapay/webhook
   ```
   (Remplacez par votre vraie URL de backend)

4. Sélectionnez les événements :
   - ✅ Transaction approuvée (`transaction.approved`)
   - ✅ Transaction transférée (`transaction.transferred`)

5. **Testez le webhook** avec l'outil de test FedaPay

### 5. **Vérifications Post-Déploiement**

#### ✅ Checklist de vérification :

1. **Backend démarré** :
   ```bash
   # Vérifier les logs
   [SUPABASE_SERVER] Client créé avec clé service_role (RLS contourné)
   [FCM] Firebase Admin initialisé
   ```

2. **Frontend accessible** :
   - Ouvrir `https://ab-cf1.vercel.app`
   - Vérifier que l'app se charge

3. **Notifications FCM** :
   - Se connecter avec un compte utilisateur
   - Accepter les notifications dans le navigateur
   - Vérifier dans Supabase que `users.fcm_token` est rempli
   - Tester avec : `POST /api/notifications/test-fcm-all-users`

4. **Webhook FedaPay** :
   - Effectuer un petit paiement de test
   - Vérifier les logs backend pour voir si le webhook arrive
   - Vérifier que les notifications sont envoyées

5. **Notifications automatiques** :
   - Approuver un prêt → vérifier notification client
   - Effectuer un remboursement → vérifier notifications client + admin

## 🔧 Configuration selon l'hébergeur

### **Render (Backend)**

1. Créez un nouveau service "Web Service"
2. Connectez votre repo GitHub
3. Configurez les variables d'environnement dans Render Dashboard
4. **Important** : Uploadez `firebase-service-account.json` :
   - Soit via SSH dans le dossier backend
   - Soit via variable d'environnement `FIREBASE_SERVICE_ACCOUNT_JSON`

### **Vercel (Frontend)**

1. Connectez votre repo GitHub
2. Configurez les variables d'environnement dans Vercel Dashboard
3. Les variables doivent commencer par `REACT_APP_` pour être accessibles dans le code
4. Déployez automatiquement à chaque push sur `main`

### **Railway (Backend)**

1. Connectez votre repo GitHub
2. Ajoutez les variables d'environnement
3. Uploadez `firebase-service-account.json` via Railway Files

## 📝 Variables d'environnement à NE JAMAIS commit

Ces fichiers/variables sont déjà dans `.gitignore` :

- ✅ `firebase-service-account.json` - Clés secrètes Firebase
- ✅ `.env` - Variables d'environnement locales
- ✅ `.env.local` - Variables d'environnement locales
- ✅ `backend/.env` - Variables backend
- ✅ `frontend/.env` - Variables frontend

## 🧪 Test avant mise en production

### Test local avec variables de production :

1. **Backend** :
   ```bash
   cd backend
   # Modifier .env avec les valeurs de production
   npm start
   ```

2. **Frontend** :
   ```bash
   cd frontend
   # Modifier .env avec les valeurs de production
   npm start
   ```

3. **Tester** :
   - Créer un prêt de test
   - Approuver le prêt → vérifier notification FCM
   - Effectuer un remboursement → vérifier notifications

## 🚨 Problèmes courants en production

### 1. **Notifications FCM ne fonctionnent pas**

**Symptômes** : Aucune notification reçue

**Solutions** :
- Vérifier que `firebase-service-account.json` est présent sur le serveur
- Vérifier que `FIREBASE_SERVICE_ACCOUNT_PATH` pointe vers le bon chemin
- Vérifier les logs backend : `[FCM] ❌ Erreur pour userId: ...`
- Vérifier que les utilisateurs ont bien un `fcm_token` dans Supabase

### 2. **Webhook FedaPay ne fonctionne pas**

**Symptômes** : Paiements réussis mais pas de notifications

**Solutions** :
- Vérifier l'URL du webhook dans FedaPay Dashboard
- Vérifier que l'URL est accessible publiquement (pas localhost)
- Vérifier les logs backend pour voir si le webhook arrive
- Vérifier que `FEDAPAY_SECRET_KEY` est correcte

### 3. **Frontend ne peut pas appeler le backend**

**Symptômes** : Erreurs CORS ou "Network Error"

**Solutions** :
- Vérifier que `REACT_APP_BACKEND_URL` pointe vers l'URL de production
- Vérifier que le backend autorise les requêtes depuis le frontend (CORS)
- Vérifier que le backend est accessible publiquement

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifier les logs backend
2. Vérifier les logs frontend (console navigateur)
3. Vérifier les variables d'environnement
4. Tester avec les routes de test FCM
