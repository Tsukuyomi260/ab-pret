-- Script SQL pour appliquer le schéma complet AB CAMPUS FINANCE
-- À exécuter dans l'éditeur SQL de votre dashboard Supabase

-- 1. Créer ou mettre à jour la table users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    filiere VARCHAR(100),
    annee_etude VARCHAR(50),
    entite VARCHAR(100),
    -- Informations du témoin
    temoin_name VARCHAR(100),
    temoin_quartier VARCHAR(100),
    temoin_phone VARCHAR(20),
    temoin_email VARCHAR(255),
    -- Informations de contact d'urgence
    emergency_name VARCHAR(100),
    emergency_relation VARCHAR(50),
    emergency_phone VARCHAR(20),
    emergency_email VARCHAR(255),
    emergency_address TEXT,
    -- Documents
    user_identity_card_name VARCHAR(255),
    temoin_identity_card_name VARCHAR(255),
    student_card_name VARCHAR(255),
    -- Statut et rôle
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ajouter les colonnes manquantes si la table existe déjà
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS temoin_name VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS temoin_quartier VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS temoin_phone VARCHAR(20);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS temoin_email VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_name VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_relation VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_email VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS user_identity_card_name VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS temoin_identity_card_name VARCHAR(255);

-- 3. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON public.users(phone_number);

-- 4. Créer la fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Créer le trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Configurer les politiques RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow insert for registration" ON public.users;
DROP POLICY IF EXISTS "Allow read for admin" ON public.users;
DROP POLICY IF EXISTS "Allow update for admin" ON public.users;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.users;

-- Créer les nouvelles politiques
CREATE POLICY "Allow insert for registration" ON public.users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for admin" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Allow update for admin" ON public.users
    FOR UPDATE USING (true);

CREATE POLICY "Allow users to update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 7. Créer la table loans si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    purpose TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'repaid')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Index pour la table loans
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON public.loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_created_at ON public.loans(created_at);

-- 9. Trigger pour la table loans
DROP TRIGGER IF EXISTS update_loans_updated_at ON public.loans;
CREATE TRIGGER update_loans_updated_at 
    BEFORE UPDATE ON public.loans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. RLS pour la table loans
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow loan operations" ON public.loans;
CREATE POLICY "Allow loan operations" ON public.loans
    FOR ALL USING (true);

-- 11. Insérer un utilisateur admin par défaut (optionnel - décommentez si nécessaire)
-- INSERT INTO public.users (
--     first_name, 
--     last_name, 
--     email, 
--     phone_number, 
--     password, 
--     status, 
--     role
-- ) VALUES (
--     'Admin',
--     'AB CAMPUS FINANCE',
--     'admin@abpret.com',
--     '+229 90 00 00 00',
--     'admin123', -- À changer en production
--     'approved',
--     'admin'
-- ) ON CONFLICT (phone_number) DO NOTHING;

-- 12. Message de confirmation
SELECT 'Schéma AB CAMPUS FINANCE appliqué avec succès !' as message;
