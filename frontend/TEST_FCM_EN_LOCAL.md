# Tester FCM en local (localhost)

Tout se fait sur ta machine, sans déployer.

---

## 1. Préparer le frontend

- **Clé VAPID** dans `frontend/.env` :
  ```env
  REACT_APP_FIREBASE_VAPID_KEY=ta_cle_publique_firebase
  ```
  (Firebase Console → Paramètres → Cloud Messaging → Certificats Web Push → clé publique)

- **Colonne en base** (Supabase) :
  ```sql
  ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token TEXT;
  ```

---

## 2. Lancer et récupérer le token

1. Démarrer le front en local :
   ```bash
   cd frontend && npm start
   ```
2. Ouvrir **http://localhost:3000** (ou le port affiché).
3. Se **connecter** avec un compte.
4. Quand le navigateur demande **« Autoriser les notifications »** → **Autoriser**.
5. Ouvrir la **console** (F12 → Console) et vérifier :
   - `[FCM] Permission accordée`
   - `[FCM] Token obtenu`
   - `[FCM] Token sauvegardé pour l'utilisateur`
6. Aller dans **Supabase** → table **users** → ton utilisateur → copier la valeur de **fcm_token** (longue chaîne).

Si tu ne vois pas le token : vérifier que `REACT_APP_FIREBASE_VAPID_KEY` est bien dans `.env` et redémarrer `npm start`.

---

## 3. Envoyer une notification de test (en local)

### Option A : Firebase Console (sans backend)

1. Va sur [Firebase Console](https://console.firebase.google.com) → projet **ab-campus-notif**.
2. **Messaging** (menu gauche) → **Create your first campaign** ou **New notification**.
3. Remplis **Notification title** et **Notification text** (ex. « Test local », « Hello depuis localhost »).
4. **Next** → **Send test message**.
5. Colle le **FCM token** (celui copié depuis Supabase `users.fcm_token`).
6. **Test**. La notification doit s’afficher sur ton navigateur (ou en icône si l’onglet est en arrière-plan).

### Option B : Backend en local

1. Dans `backend` :
   ```bash
   npm install firebase-admin
   ```
2. Télécharge le **compte de service** : Firebase Console → Paramètres → Comptes de service → **Générer une nouvelle clé** → enregistre le JSON dans `backend/firebase-service-account.json`.
3. Démarre le backend :
   ```bash
   cd backend && npm start
   ```
4. Envoie la requête (remplace `TON_USER_ID` par l’UUID de ton user dans Supabase) :
   ```bash
   curl -X POST http://localhost:5000/api/notifications/test-fcm -H "Content-Type: application/json" -d "{\"userId\": \"TON_USER_ID\"}"
   ```
   Ou avec le token directement :
   ```bash
   curl -X POST http://localhost:5000/api/notifications/test-fcm -H "Content-Type: application/json" -d "{\"fcmToken\": \"COLLE_LE_TOKEN_ICI\"}"
   ```

Tu peux garder le front sur **http://localhost:3000** et le backend sur **http://localhost:5000** : tout le test se fait en local, sans push ni déploiement.
