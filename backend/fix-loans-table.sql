-- =====================================================
-- CORRECTION DE LA TABLE LOANS
-- =====================================================

-- Vérifier si la table loans existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'loans') THEN
        -- Créer la table loans si elle n'existe pas
        CREATE TABLE public.loans (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            amount DECIMAL(15,2) NOT NULL,
            purpose TEXT NOT NULL,
            loan_type VARCHAR(50) DEFAULT 'general',
            duration INTEGER DEFAULT 12,
            interest_rate DECIMAL(5,2) DEFAULT 10.0,
            monthly_payment DECIMAL(15,2),
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'completed', 'rejected')),
            approved_by UUID REFERENCES public.users(id),
            approved_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Table loans créée avec succès';
    ELSE
        RAISE NOTICE 'Table loans existe déjà';
    END IF;
END $$;

-- Ajouter les colonnes manquantes si elles n'existent pas
DO $$ 
BEGIN
    -- Ajouter la colonne duration si elle n'existe pas
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'duration') THEN
        ALTER TABLE public.loans ADD COLUMN duration INTEGER DEFAULT 12;
        RAISE NOTICE 'Colonne duration ajoutée';
    END IF;
    
    -- Ajouter la colonne interest_rate si elle n'existe pas
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'interest_rate') THEN
        ALTER TABLE public.loans ADD COLUMN interest_rate DECIMAL(5,2) DEFAULT 10.0;
        RAISE NOTICE 'Colonne interest_rate ajoutée';
    END IF;
    
    -- Ajouter la colonne monthly_payment si elle n'existe pas
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'monthly_payment') THEN
        ALTER TABLE public.loans ADD COLUMN monthly_payment DECIMAL(15,2);
        RAISE NOTICE 'Colonne monthly_payment ajoutée';
    END IF;
    
    -- Ajouter la colonne approved_by si elle n'existe pas
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'approved_by') THEN
        ALTER TABLE public.loans ADD COLUMN approved_by UUID REFERENCES public.users(id);
        RAISE NOTICE 'Colonne approved_by ajoutée';
    END IF;
    
    -- Ajouter la colonne approved_at si elle n'existe pas
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'approved_at') THEN
        ALTER TABLE public.loans ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Colonne approved_at ajoutée';
    END IF;
    
    -- Ajouter la colonne updated_at si elle n'existe pas
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'updated_at') THEN
        ALTER TABLE public.loans ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Colonne updated_at ajoutée';
    END IF;
END $$;

-- Vérifier la structure finale
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'loans' 
ORDER BY ordinal_position;
