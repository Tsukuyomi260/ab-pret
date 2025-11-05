# 🔧 Guide : Ajouter les colonnes de personnalisation

## 🚨 Problème
L'erreur indique que les colonnes `goal`, `goal_label`, et `personalized_at` n'existent pas dans la table `savings_plans`.

## ✅ Solution (5 minutes)

### Étape 1 : Ouvrir Supabase
1. Allez sur [https://supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet

### Étape 2 : Ouvrir le SQL Editor
1. Dans le menu de gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur **"New query"**

### Étape 3 : Exécuter le Script
1. Ouvrez le fichier `backend/add-personalization-columns.sql`
2. Copiez tout le contenu du fichier
3. Collez-le dans l'éditeur SQL de Supabase
4. Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter`)

### Étape 4 : Vérifier
Le script devrait s'exécuter sans erreur. Vous verrez dans les résultats que les colonnes ont été ajoutées.

## 📝 Colonnes ajoutées

- `plan_name` (TEXT) : Nom personnalisé du plan (ex: "Ma Moto", "Ma Soutenance 2025")
- `goal` (TEXT) : ID de l'objectif sélectionné (ex: "graduation", "motorcycle", "custom")
- `goal_label` (TEXT) : Label de l'objectif pour l'affichage (ex: "Préparation / Soutenance")
- `personalized_at` (TIMESTAMP) : Date et heure de la personnalisation

## 🧪 Test
Après avoir exécuté le script :
1. Retournez dans l'application
2. Créez un nouveau plan d'épargne
3. Après le paiement, vous devriez voir la page de personnalisation
4. Sélectionnez un objectif et donnez un nom
5. Cliquez sur "Continuer"
6. Ça devrait fonctionner ! ✅

## ⚠️ Important
- Ce script est sûr et n'affecte pas les données existantes
- Il vérifie si les colonnes existent avant de les ajouter (pas de doublons)
- Les colonnes sont optionnelles (NULL autorisé)

## 🆘 En cas de problème
Si vous rencontrez une erreur lors de l'exécution du script :
1. Vérifiez que vous êtes connecté en tant qu'administrateur Supabase
2. Vérifiez que vous avez sélectionné le bon projet
3. Vérifiez les logs d'erreur dans Supabase
4. Assurez-vous que la table `savings_plans` existe

---

**Fichiers associés :**
- `backend/add-personalization-columns.sql` - Script SQL à exécuter

