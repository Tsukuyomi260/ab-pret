# Tester les notifications Firebase FCM

## Étape 1 : Prérequis frontend

1. **Installer Firebase** (dans le dossier `frontend`) :
   ```bash
   npm install firebase
   ```

2. **Clé VAPID**  
   - Firebase Console → ton projet **ab-campus-notif** → ⚙️ Paramètres → **Cloud Messaging**.  
   - Section **Certificats Web Push** → « Générer une paire de clés » (ou copier la clé existante).  
   - Copier la **clé publique**.

3. **Configurer le `.env` du frontend** :
   ```env
   REACT_APP_FIREBASE_VAPID_KEY=ta_cle_publique_ici
   ```

4. **Colonne en base**  
   Dans Supabase → SQL Editor, exécuter :
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token TEXT;
   ```

---

## Étape 2 : Vérifier la réception (token + permission)

1. **Démarrer le frontend** en **HTTPS** ou **localhost** (les notifications ne marchent pas en HTTP sauf en localhost) :
   ```bash
   cd frontend && npm start
   ```

2. **Ouvrir l’app** dans le navigateur (Chrome de préférence).

3. **Se connecter** avec un compte utilisateur.

4. **Accepter les notifications** quand le navigateur demande la permission.

5. **Ouvrir la console** (F12 → Console) et vérifier :
   - `[FCM] Permission accordée`
   - `[FCM] Token obtenu`
   - `[FCM] Token sauvegardé pour l'utilisateur`

6. **Vérifier en base** : dans Supabase, table **users**, la ligne de ton utilisateur doit avoir **fcm_token** rempli avec un long token.

Si tu vois `REACT_APP_FIREBASE_VAPID_KEY manquante` ou `Aucun token reçu`, vérifier le `.env` et que le **service worker** `public/firebase-messaging-sw.js` est bien servi (onglet Network : `firebase-messaging-sw.js` chargé).

---

## Étape 3 : Envoyer une notification de test

### Option A : Depuis la Firebase Console (sans backend)

1. Aller sur [Firebase Console](https://console.firebase.google.com) → projet **ab-campus-notif**.
2. **Messaging** (ou **Engagement** → **Messaging**) → **Create your first campaign** ou **New campaign**.
3. Choisir **Firebase Notification messages**.
4. Remplir **Titre** et **Texte** (ex. « Test », « Ceci est un test »).
5. **Next** → **Send test message**.
6. Coller le **FCM token** copié depuis Supabase (colonne `fcm_token` de ton user).
7. Envoyer. La notification doit apparaître sur l’appareil (ou dans le navigateur si l’app est ouverte).

### Option B : Depuis ton backend (route de test)

1. **Installer Firebase Admin** (dans le dossier `backend`) :
   ```bash
   npm install firebase-admin
   ```

2. **Compte de service Firebase**  
   - Firebase Console → ⚙️ Paramètres du projet → **Comptes de service**.  
   - **Générer une nouvelle clé privée** → télécharger le JSON.  
   - Placer le fichier dans le dossier `backend` et le renommer (ex. `firebase-service-account.json`).  
   - Ne pas le committer (ajouter `firebase-service-account.json` dans `.gitignore`).

3. **Optionnel** : dans `backend/.env`, définir le chemin du fichier :
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```

4. **Appeler la route de test** (Postman, curl ou ton front) :
   ```bash
   curl -X POST http://localhost:5000/api/notifications/test-fcm \
     -H "Content-Type: application/json" \
     -d "{\"userId\": \"UUID_DE_TON_UTILISATEUR\"}"
   ```
   Ou avec un titre/corps personnalisés :
   ```json
   { "userId": "uuid", "title": "Test", "body": "Message de test" }
   ```
   Tu peux aussi passer directement le token : `{ "fcmToken": "le_token_fcm" }`.

---

## Dépannage

| Problème | À vérifier |
|----------|------------|
| Pas de demande de permission | Utiliser HTTPS ou localhost ; pas de blocage des notifications dans le navigateur. |
| « Aucun token reçu » | VAPID key dans `.env` ; `firebase-messaging-sw.js` présent dans `public/` et chargé (Network). |
| Token non sauvegardé | Colonne `fcm_token` existante sur la table `users` ; utilisateur connecté. |
| Notification non reçue | Token valide (pas expiré) ; test envoyé au bon token ; app ou onglet autorisé pour les notifications. |
