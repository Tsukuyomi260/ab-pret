-- Création de la table users pour AB CAMPUS FINANCE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    filiere VARCHAR(100),
    annee_etude VARCHAR(50),
    entite VARCHAR(100),
    student_card_name VARCHAR(255),
    identity_card_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Politique RLS (Row Level Security) - permettre la lecture pour tous
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion (inscription)
CREATE POLICY "Allow insert for registration" ON public.users
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre la lecture (admin peut voir tous les utilisateurs)
CREATE POLICY "Allow read for admin" ON public.users
    FOR SELECT USING (true);

-- Politique pour permettre la mise à jour (admin peut approuver/rejeter)
CREATE POLICY "Allow update for admin" ON public.users
    FOR UPDATE USING (true);

-- Insérer un utilisateur admin par défaut (optionnel)
-- INSERT INTO public.users (
--     first_name, 
--     last_name, 
--     email, 
--     phone, 
--     password, 
--     status, 
--     role
-- ) VALUES (
--     'Admin',
--     'AB CAMPUS FINANCE',
--     'admin@abpret.com',
--     '+228 90 00 00 00',
--     'admin123', -- À changer en production
--     'approved',
--     'admin'
-- ); 