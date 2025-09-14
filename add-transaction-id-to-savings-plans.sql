-- Ajouter la colonne transaction_id à la table savings_plans
ALTER TABLE public.savings_plans 
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(50);

-- Créer un index pour optimiser les requêtes par transaction_id
CREATE INDEX IF NOT EXISTS idx_savings_plans_transaction_id 
ON public.savings_plans(transaction_id);

-- Modifier la fonction create_savings_plan pour accepter transaction_id
CREATE OR REPLACE FUNCTION create_savings_plan(
  user_id_param UUID,
  savings_account_id_param UUID,
  plan_name_param VARCHAR(100),
  fixed_amount_param DECIMAL(15,2),
  frequency_days_param INTEGER,
  duration_months_param INTEGER,
  total_deposits_required_param INTEGER,
  total_amount_target_param DECIMAL(15,2),
  completed_deposits_param INTEGER,
  current_balance_param DECIMAL(15,2),
  total_deposited_param DECIMAL(15,2),
  start_date_param TIMESTAMP WITH TIME ZONE,
  end_date_param TIMESTAMP WITH TIME ZONE,
  next_deposit_date_param TIMESTAMP WITH TIME ZONE,
  status_param VARCHAR(20),
  completion_percentage_param DECIMAL(5,2),
  transaction_id_param VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  savings_account_id UUID,
  plan_name VARCHAR(100),
  fixed_amount DECIMAL(15,2),
  frequency_days INTEGER,
  duration_months INTEGER,
  total_deposits_required INTEGER,
  total_amount_target DECIMAL(15,2),
  completed_deposits INTEGER,
  current_balance DECIMAL(15,2),
  total_deposited DECIMAL(15,2),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  next_deposit_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20),
  completion_percentage DECIMAL(5,2),
  transaction_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_plan_id UUID;
BEGIN
  -- Insérer le nouveau plan d'épargne
  INSERT INTO public.savings_plans (
    user_id,
    savings_account_id,
    plan_name,
    fixed_amount,
    frequency_days,
    duration_months,
    total_deposits_required,
    total_amount_target,
    completed_deposits,
    current_balance,
    total_deposited,
    start_date,
    end_date,
    next_deposit_date,
    status,
    completion_percentage,
    transaction_id,
    created_at,
    updated_at
  ) VALUES (
    user_id_param,
    savings_account_id_param,
    plan_name_param,
    fixed_amount_param,
    frequency_days_param,
    duration_months_param,
    total_deposits_required_param,
    total_amount_target_param,
    completed_deposits_param,
    current_balance_param,
    total_deposited_param,
    start_date_param,
    end_date_param,
    next_deposit_date_param,
    status_param,
    completion_percentage_param,
    transaction_id_param,
    NOW(),
    NOW()
  ) RETURNING id INTO new_plan_id;

  -- Retourner le plan créé
  RETURN QUERY
  SELECT 
    sp.id,
    sp.user_id,
    sp.savings_account_id,
    sp.plan_name,
    sp.fixed_amount,
    sp.frequency_days,
    sp.duration_months,
    sp.total_deposits_required,
    sp.total_amount_target,
    sp.completed_deposits,
    sp.current_balance,
    sp.total_deposited,
    sp.start_date,
    sp.end_date,
    sp.next_deposit_date,
    sp.status,
    sp.completion_percentage,
    sp.transaction_id,
    sp.created_at,
    sp.updated_at
  FROM public.savings_plans sp
  WHERE sp.id = new_plan_id;
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION create_savings_plan(UUID, UUID, VARCHAR, DECIMAL, INTEGER, INTEGER, INTEGER, DECIMAL, INTEGER, DECIMAL, DECIMAL, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, VARCHAR, DECIMAL, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION create_savings_plan(UUID, UUID, VARCHAR, DECIMAL, INTEGER, INTEGER, INTEGER, DECIMAL, INTEGER, DECIMAL, DECIMAL, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, VARCHAR, DECIMAL, VARCHAR) TO service_role;
