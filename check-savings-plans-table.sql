-- =====================================================
-- VÉRIFICATION DE LA TABLE SAVINGS_PLANS
-- =====================================================

-- 1. Vérifier si la table existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'savings_plans';

-- 2. Vérifier la structure de la table (colonnes)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'savings_plans'
ORDER BY ordinal_position;

-- 3. Vérifier les contraintes de la table
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name = 'savings_plans';

-- 4. Vérifier les clés primaires
SELECT 
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'savings_plans'
AND tc.constraint_type = 'PRIMARY KEY';

-- 5. Vérifier les clés étrangères
SELECT 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'savings_plans'
AND tc.constraint_type = 'FOREIGN KEY';

-- 6. Vérifier les index
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'savings_plans'
AND schemaname = 'public';

-- 7. Vérifier les RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'savings_plans'
AND schemaname = 'public';

-- 8. Vérifier si RLS est activé sur la table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'savings_plans'
AND schemaname = 'public';

-- 9. Compter le nombre d'enregistrements
SELECT 
    COUNT(*) as total_plans
FROM savings_plans;

-- 10. Voir quelques exemples d'enregistrements (si la table existe et contient des données)
SELECT 
    id,
    user_id,
    fixed_amount,
    frequency,
    duration,
    status,
    created_at
FROM savings_plans 
LIMIT 5;

-- =====================================================
-- SCRIPT DE CRÉATION DE LA TABLE (si elle n'existe pas)
-- =====================================================

-- Si la table n'existe pas, voici le script pour la créer :
/*
CREATE TABLE IF NOT EXISTS savings_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fixed_amount DECIMAL(10,2) NOT NULL,
    frequency INTEGER NOT NULL CHECK (frequency IN (5, 10)),
    duration INTEGER NOT NULL CHECK (duration IN (1, 2, 3, 6)),
    total_deposits INTEGER DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    estimated_benefits DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    completed_deposits INTEGER DEFAULT 0,
    current_balance DECIMAL(10,2) DEFAULT 0,
    total_interest_earned DECIMAL(10,2) DEFAULT 0
);

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_savings_plans_user_id ON savings_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_plans_status ON savings_plans(status);
CREATE INDEX IF NOT EXISTS idx_savings_plans_created_at ON savings_plans(created_at);

-- Activer RLS
ALTER TABLE savings_plans ENABLE ROW LEVEL SECURITY;

-- Créer les policies RLS
CREATE POLICY "Users can view their own savings plans" ON savings_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings plans" ON savings_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings plans" ON savings_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings plans" ON savings_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Créer la fonction de mise à jour automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger
CREATE TRIGGER update_savings_plans_updated_at 
    BEFORE UPDATE ON savings_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
*/

