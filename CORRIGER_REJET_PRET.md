# 🔧 Guide : Corriger le Rejet des Demandes de Prêt

## 🚨 Problème
L'admin ne peut pas rejeter les demandes de prêt car la base de données n'autorise pas le statut `'rejected'`.

## ✅ Solution (5 minutes)

### Étape 1 : Ouvrir Supabase
1. Allez sur [https://supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet

### Étape 2 : Ouvrir le SQL Editor
1. Dans le menu de gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur **"New query"**

### Étape 3 : Exécuter le Script
1. Copiez le contenu du fichier `backend/fix-loan-rejection.sql`
2. Collez-le dans l'éditeur SQL
3. Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter`)

### Étape 4 : Vérifier
Le script devrait s'exécuter sans erreur. Vous verrez dans les résultats que la contrainte a été mise à jour.

## 📝 Script à Exécuter

```sql
-- Supprimer l'ancienne contrainte
ALTER TABLE public.loans 
DROP CONSTRAINT IF EXISTS loans_status_check;

-- Créer la nouvelle contrainte avec 'rejected' inclus
ALTER TABLE public.loans 
ADD CONSTRAINT loans_status_check 
CHECK (status IN ('pending', 'approved', 'active', 'completed', 'rejected'));
```

## 🧪 Test
Après avoir exécuté le script :
1. Retournez dans l'application
2. Allez dans "Demandes de prêt" (admin)
3. Essayez de rejeter une demande
4. Ça devrait fonctionner ! ✅

## ⚠️ Important
- Ce script est sûr et n'affecte pas les données existantes
- Il modifie seulement la contrainte pour autoriser le statut `'rejected'`
- Les prêts existants ne sont pas modifiés

## 🆘 En cas de problème
Si vous rencontrez une erreur lors de l'exécution du script :
1. Vérifiez que vous êtes connecté en tant qu'administrateur Supabase
2. Vérifiez que vous avez sélectionné le bon projet
3. Vérifiez les logs d'erreur dans Supabase

## ✅ Après la correction
Une fois le script exécuté, l'admin pourra :
- ✅ Approuver les demandes de prêt
- ✅ Rejeter les demandes de prêt
- ✅ Voir les demandes rejetées dans l'historique

---

**Fichiers associés :**
- `backend/fix-loan-rejection.sql` - Script SQL à exécuter
- `backend/check-loan-status-constraint.js` - Script de vérification
