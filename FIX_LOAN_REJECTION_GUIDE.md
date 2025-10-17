# 🔧 Guide de Correction - Rejet des Demandes de Prêt

## 🔍 **Problème Identifié**

L'admin ne peut pas rejeter les demandes de prêt car la contrainte `loans_status_check` dans la base de données n'autorise pas le statut `'rejected'`.

**Erreur :** `violates check constraint "loans_status_check"`

## ✅ **Solution**

Il faut modifier la contrainte de la base de données pour autoriser le statut `'rejected'`.

### **Étapes à Suivre :**

#### **1. Accéder à l'Interface SQL de Supabase**

1. Aller sur [supabase.com](https://supabase.com)
2. Se connecter à votre compte
3. Sélectionner votre projet
4. Aller dans l'onglet **"SQL Editor"**

#### **2. Exécuter le Script SQL**

Copier et coller ce script dans l'éditeur SQL :

```sql
-- 1. Supprimer l'ancienne contrainte
ALTER TABLE public.loans 
DROP CONSTRAINT IF EXISTS loans_status_check;

-- 2. Créer une nouvelle contrainte avec 'rejected' inclus
ALTER TABLE public.loans 
ADD CONSTRAINT loans_status_check 
CHECK (status IN ('pending', 'approved', 'active', 'completed', 'rejected'));
```

#### **3. Cliquer sur "Run" pour exécuter le script**

#### **4. Vérifier que la correction a fonctionné**

Exécuter cette requête pour vérifier :

```sql
-- Vérifier la contrainte
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'loans_status_check' 
AND conrelid = 'public.loans'::regclass;
```

Vous devriez voir :
```
constraint_name: loans_status_check
constraint_definition: CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'active'::text, 'completed'::text, 'rejected'::text])))
```

## 🧪 **Test de la Correction**

### **Test Automatique**

Exécuter ce script pour tester :

```sql
-- Tester avec un prêt en attente
UPDATE public.loans 
SET status = 'rejected', updated_at = NOW()
WHERE status = 'pending' 
LIMIT 1;

-- Vérifier que ça a fonctionné
SELECT id, status, updated_at 
FROM public.loans 
WHERE status = 'rejected' 
ORDER BY updated_at DESC 
LIMIT 1;

-- Remettre en pending pour ne pas affecter les données
UPDATE public.loans 
SET status = 'pending', updated_at = NOW()
WHERE status = 'rejected' 
ORDER BY updated_at DESC 
LIMIT 1;
```

### **Test dans l'Interface Admin**

1. Se connecter en tant qu'admin
2. Aller dans "Demandes de prêt"
3. Trouver une demande en attente
4. Cliquer sur "Refuser"
5. Vérifier que la demande passe au statut "rejeté"

## 📊 **Statuts Autorisés Après Correction**

- ✅ `pending` - En attente
- ✅ `approved` - Approuvé (devient automatiquement `active`)
- ✅ `active` - En cours
- ✅ `completed` - Remboursé
- ✅ `rejected` - Rejeté (NOUVEAU)

## 🎯 **Résultat Attendu**

Après cette correction :

1. **✅ L'admin peut approuver** les demandes de prêt
2. **✅ L'admin peut rejeter** les demandes de prêt
3. **✅ Les statuts sont correctement mis à jour** dans l'interface
4. **✅ Les notifications fonctionnent** pour les deux actions

## 🚨 **Important**

- **Sauvegardez votre base de données** avant d'exécuter le script
- **Testez d'abord sur un environnement de développement** si possible
- **Vérifiez que la correction fonctionne** avant de déployer en production

## 📝 **Fichiers de Script**

- `backend/fix-loans-status-constraint.sql` - Script SQL de correction
- `backend/apply-loans-status-fix.js` - Script Node.js (nécessite accès direct à la DB)
- `backend/test-loan-rejection.js` - Script de test

---

**Une fois la correction appliquée, l'admin pourra rejeter les demandes de prêt normalement ! 🎉**
