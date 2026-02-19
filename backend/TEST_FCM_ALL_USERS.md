# Tester l'envoi de notification à tous les utilisateurs

## Vérifier que le backend tourne

1. **Ouvre un terminal** et va dans le dossier backend :
   ```bash
   cd backend
   ```

2. **Démarre le backend** (si ce n'est pas déjà fait) :
   ```bash
   npm start
   ```
   Tu devrais voir : `API server listening on port 5000`

3. **Vérifie que le backend répond** :
   - Ouvre ton navigateur : http://localhost:5000/api/health
   - Tu devrais voir : `{"ok":true}`

---

## Envoyer la notification de test à tous les utilisateurs

### Option 1 : Avec curl (terminal)

```bash
curl -X POST http://localhost:5000/api/notifications/test-fcm-all-users -H "Content-Type: application/json"
```

### Option 2 : Avec Postman

- **Méthode** : `POST`
- **URL** : `http://localhost:5000/api/notifications/test-fcm-all-users`
- **Headers** : `Content-Type: application/json`
- **Body** : (vide, pas besoin de paramètres)

### Option 3 : Depuis le navigateur (console JavaScript)

Ouvre la console (F12) sur n'importe quelle page et tape :
```javascript
fetch('http://localhost:5000/api/notifications/test-fcm-all-users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(console.log);
```

---

## Réponse attendue

```json
{
  "success": true,
  "sent": 3,
  "errors": 0,
  "total": 3
}
```

Si des erreurs :
```json
{
  "success": true,
  "sent": 2,
  "errors": 1,
  "total": 3,
  "details": [
    {
      "userId": "uuid",
      "name": "Prénom",
      "error": "message d'erreur"
    }
  ]
}
```

---

## Message envoyé

Chaque utilisateur recevra :
- **Titre** : "AB Campus Finance"
- **Corps** : "Bonjour {prénom}, ceci est un test ne vous en faites pas, tout est OK!!!"

Les utilisateurs doivent avoir :
- Un **`fcm_token`** rempli dans la table `users` (colonne `fcm_token`)
- Avoir accepté les notifications dans l'app
