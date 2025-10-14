# 🔧 Correction de la table notifications

## ❌ Problème identifié

**Erreur :**
```
NotificationContext.jsx:50 [NOTIFICATIONS] Erreur lors du chargement: 
{code: '42703', details: null, hint: null, message: 'column notifications.user_id does not exist'}
```

**Cause :** La table `notifications` dans Supabase ne contient pas la colonne `user_id`, ce qui empêche le système de filtrer les notifications par utilisateur.

---

## ✅ Solution

### Option 1 : Via l'interface Supabase (Recommandée)

1. **Ouvrir Supabase Dashboard**
   - Aller sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sélectionner votre projet

2. **Ouvrir l'éditeur SQL**
   - Dans le menu latéral, cliquer sur **SQL Editor**
   - Cliquer sur **New query**

3. **Copier et exécuter le script**
   - Copier tout le contenu du fichier `add-notifications-user-id.sql`
   - Coller dans l'éditeur SQL
   - Cliquer sur **Run** ou appuyer sur `Ctrl+Enter`

4. **Vérifier les résultats**
   - Vous devriez voir un message de succès
   - La table affichera les colonnes et index créés

---

### Option 2 : Via psql (Ligne de commande)

Si vous avez accès direct à PostgreSQL :

```bash
# Se connecter à la base de données
psql -h YOUR_SUPABASE_HOST -U postgres -d postgres

# Exécuter le script
\i backend/add-notifications-user-id.sql

# Ou copier-coller le contenu du script
```

---

## 📋 Que fait le script ?

### 1. Ajoute la colonne `user_id`
```sql
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS user_id UUID;
```

### 2. Crée une clé étrangère vers `users`
```sql
ALTER TABLE public.notifications
ADD CONSTRAINT fk_notifications_user_id
FOREIGN KEY (user_id) 
REFERENCES public.users(id)
ON DELETE CASCADE;
```
→ Garantit l'intégrité : si un utilisateur est supprimé, ses notifications le seront aussi

### 3. Crée des index pour optimiser les performances
```sql
-- Index simple sur user_id
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- Index composite pour user_id + read (filtre notifications non lues)
CREATE INDEX idx_notifications_user_id_read ON public.notifications(user_id, read);

-- Index composite pour user_id + created_at (tri par date)
CREATE INDEX idx_notifications_user_id_created_at ON public.notifications(user_id, created_at DESC);
```

---

## 🗂️ Structure finale de la table `notifications`

Après l'exécution du script, votre table `notifications` devrait contenir :

| Colonne | Type | Nullable | Description |
|---------|------|----------|-------------|
| `id` | UUID | NO | ID unique de la notification |
| `title` | TEXT | YES | Titre de la notification |
| `message` | TEXT | YES | Message de la notification |
| `type` | TEXT | YES | Type (info, success, warning, error) |
| `priority` | TEXT | YES | Priorité (low, medium, high) |
| `read` | BOOLEAN | YES | Lu ou non lu |
| `created_at` | TIMESTAMP | NO | Date de création |
| `data` | JSONB | YES | Données supplémentaires |
| `action` | TEXT | YES | Action à effectuer |
| **`user_id`** | **UUID** | **YES** | **ID de l'utilisateur destinataire** ⭐ |

---

## 🔄 Gestion des notifications existantes

Si vous avez déjà des notifications dans la table **sans `user_id`**, vous avez 2 options :

### Option A : Supprimer les anciennes notifications
```sql
DELETE FROM public.notifications WHERE user_id IS NULL;
```

### Option B : Assigner à un utilisateur admin
```sql
-- 1. Récupérer l'UUID de votre admin
SELECT id, email, role FROM public.users WHERE role = 'admin' LIMIT 1;

-- 2. Assigner les notifications orphelines à cet admin
UPDATE public.notifications 
SET user_id = 'VOTRE_ADMIN_UUID_ICI'
WHERE user_id IS NULL;
```

---

## ✅ Vérification

Après avoir exécuté le script, vérifiez que tout fonctionne :

### 1. Vérifier la structure de la table
```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'notifications'
ORDER BY ordinal_position;
```

### 2. Vérifier les index
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'notifications'
  AND schemaname = 'public';
```

### 3. Tester une requête
```sql
-- Récupérer les notifications d'un utilisateur
SELECT * FROM public.notifications 
WHERE user_id = 'UN_USER_ID_EXISTANT'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🚀 Après l'application du correctif

1. **Rafraîchir l'application web**
   - Recharger la page dans le navigateur (`Ctrl+R` ou `F5`)
   - Ou vider le cache (`Ctrl+Shift+R`)

2. **Vérifier la console**
   - Ouvrir les DevTools (`F12`)
   - Aller dans l'onglet Console
   - L'erreur `column notifications.user_id does not exist` ne devrait plus apparaître

3. **Tester les notifications**
   - Les notifications devraient maintenant se charger correctement
   - Elles seront filtrées par utilisateur

---

## 📝 Notes importantes

- ⚠️ **Sauvegarde** : Toujours faire une sauvegarde avant de modifier la structure d'une table
- 🔒 **Permissions** : Assurez-vous d'avoir les droits nécessaires pour modifier la base de données
- 🎯 **RLS (Row Level Security)** : Vérifiez que vos politiques RLS sont à jour pour la colonne `user_id`

---

## 🔐 Politique RLS recommandée

Pour sécuriser l'accès aux notifications :

```sql
-- Politique pour permettre aux utilisateurs de voir uniquement leurs notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Politique pour permettre aux admins de voir toutes les notifications
CREATE POLICY "Admins can view all notifications"
ON public.notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Politique pour permettre au système d'insérer des notifications
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);
```

---

## 📞 Support

Si vous rencontrez des problèmes lors de l'application de ce correctif :
1. Vérifiez les logs Supabase pour plus de détails
2. Assurez-vous que la table `notifications` existe bien
3. Vérifiez que vous avez les droits d'administration sur la base de données

---

**Temps estimé :** 2-3 minutes  
**Difficulté :** Facile  
**Impact :** Aucun downtime requis


