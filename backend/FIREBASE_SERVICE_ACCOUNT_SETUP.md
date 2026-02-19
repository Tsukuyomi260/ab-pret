# Configuration Firebase Service Account pour FCM

Pour envoyer des notifications FCM depuis le backend, tu as besoin du fichier **compte de service** Firebase.

## Étapes

1. **Firebase Console** → [https://console.firebase.google.com](https://console.firebase.google.com)
2. Sélectionne ton projet **ab-campus-notif**
3. ⚙️ **Paramètres du projet** (icône engrenage en haut à gauche)
4. Onglet **Comptes de service**
5. Clique sur **Générer une nouvelle clé privée** (ou utilise une clé existante)
6. Un fichier JSON se télécharge (ex. `ab-campus-notif-xxxxx-firebase-adminsdk-xxxxx.json`)

## Placer le fichier

1. **Renomme** le fichier téléchargé en : **`firebase-service-account.json`**
2. **Place-le** dans le dossier **`backend/`** (même niveau que `server.js`)
3. **Ne le commite PAS** dans Git (ajoute-le dans `.gitignore`)

## Vérifier

Le fichier doit être à : `backend/firebase-service-account.json`

Son contenu ressemble à :
```json
{
  "type": "service_account",
  "project_id": "ab-campus-notif",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  ...
}
```

## Alternative : chemin personnalisé

Si tu veux mettre le fichier ailleurs, dans `backend/.env` :
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./chemin/vers/ton/fichier.json
```
