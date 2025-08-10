# 🚀 Instructions d'installation - AB CAMPUS FINANCE

## 📋 Prérequis

- Node.js 16+ 
- npm ou yarn
- Compte Supabase (gratuit)
- Compte Twilio (pour les SMS)

## 🔧 Configuration étape par étape

### 1. Configuration Supabase

1. **Créer un projet Supabase**
   - Allez sur [https://supabase.com](https://supabase.com)
   - Créez un nouveau projet
   - Notez l'URL et la clé anonyme

2. **Exécuter le script SQL**
   - Dans votre projet Supabase, allez dans "SQL Editor"
   - Copiez le contenu du fichier `complete_schema.sql`
   - Exécutez le script

3. **Vérifier les tables**
   - Allez dans "Table Editor"
   - Vérifiez que toutes les tables sont créées :
     - `users`
     - `loans`
     - `payments`
     - `savings_accounts`
     - `savings_transactions`
     - `otp_codes`

### 2. Configuration des variables d'environnement

1. **Créer le fichier .env.local**
   ```bash
   cp env.example .env.local
   ```

2. **Configurer Supabase**
   ```env
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Configurer Twilio (optionnel pour le développement)**
   ```env
   REACT_APP_TWILIO_ACCOUNT_SID=your_twilio_account_sid
   REACT_APP_TWILIO_AUTH_TOKEN=your_twilio_auth_token
   REACT_APP_TWILIO_PHONE_NUMBER=+1234567890
   ```

4. **Mode SMS pour développement**
   ```env
   SMS_MODE=echo  # Ne pas envoyer de vrais SMS
   ```

### 3. Installation des dépendances

```bash
npm install
```

### 4. Test de la connexion

```bash
node test-connection.js
```

Si tout fonctionne, vous devriez voir :
```
✅ Connexion Supabase réussie !
✅ Table users: Accessible
✅ Table loans: Accessible
...
🚀 Prêt pour l'inscription des utilisateurs !
```

### 5. Démarrage de l'application

```bash
# Terminal 1 - Frontend
npm start

# Terminal 2 - Backend API
npm run start:api
```

## 🔍 Vérification

1. **Ouvrez l'application** : http://localhost:3000
2. **Testez l'inscription** :
   - Cliquez sur "Créer un compte"
   - Remplissez les informations
   - Vérifiez l'OTP (en mode echo, le code s'affiche dans la console)
   - Complétez l'inscription

3. **Vérifiez dans Supabase** :
   - Allez dans "Table Editor" > "users"
   - Vous devriez voir le nouvel utilisateur avec status "pending"

## 🚨 Dépannage

### Problème de connexion Supabase
- Vérifiez l'URL et la clé dans `.env.local`
- Assurez-vous que le projet Supabase est actif
- Vérifiez que les tables sont créées

### Problème d'OTP
- En développement, utilisez `SMS_MODE=echo`
- Les codes OTP s'affichent dans la console du navigateur
- Vérifiez la table `otp_codes` dans Supabase

### Problème d'inscription
- Vérifiez les logs dans la console du navigateur
- Vérifiez les politiques RLS dans Supabase
- Assurez-vous que toutes les tables existent

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans la console
2. Exécutez `node test-connection.js`
3. Vérifiez la configuration dans Supabase

## 🎯 Prochaines étapes

Une fois l'inscription fonctionnelle :
1. Configurez Twilio pour les vrais SMS
2. Testez les fonctionnalités de prêts
3. Testez les fonctionnalités d'épargne
4. Configurez l'upload de fichiers
