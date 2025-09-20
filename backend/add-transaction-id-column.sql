-- =====================================================
-- AJOUT DE LA COLONNE TRANSACTION_ID À LA TABLE PAYMENTS
-- =====================================================

-- Ajouter la colonne transaction_id si elle n'existe pas
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN public.payments.transaction_id IS 'ID de transaction FedaPay pour traçabilité';

-- Vérifier que la colonne a été ajoutée
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payments' 
AND column_name = 'transaction_id';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Colonne transaction_id ajoutée à la table payments !';
    RAISE NOTICE '🔗 Les remboursements FedaPay pourront maintenant être tracés';
    RAISE NOTICE '📊 Le webhook pourra créer les enregistrements de paiement';
END $$; 