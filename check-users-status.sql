-- =====================================================
-- VÉRIFICATION DE L'ÉTAT DES UTILISATEURS
-- =====================================================

-- 1. Vérifier les utilisateurs dans auth.users
SELECT 
    'auth.users' as table_name,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
    COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as unconfirmed_users
FROM auth.users;

-- 2. Vérifier les utilisateurs dans public.users
SELECT 
    'public.users' as table_name,
    COUNT(*) as total_users,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_users,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_users
FROM public.users;

-- 3. Afficher les utilisateurs récents dans auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;

-- 4. Afficher les utilisateurs récents dans public.users
SELECT 
    id,
    first_name,
    last_name,
    phone_number,
    email,
    status,
    created_at
FROM public.users 
ORDER BY created_at DESC
LIMIT 5;

-- 5. Vérifier la correspondance entre les deux tables
SELECT 
    'Correspondance' as info,
    COUNT(a.id) as auth_users,
    COUNT(p.id) as public_users,
    COUNT(CASE WHEN a.id = p.id THEN 1 END) as matching_users
FROM auth.users a
FULL OUTER JOIN public.users p ON a.id = p.id;
