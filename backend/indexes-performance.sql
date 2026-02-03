-- Index pour accélérer les requêtes (Supabase / PostgreSQL)
-- Exécuter dans Supabase → SQL Editor

-- Loans : filtre par user, tri par date, filtre par statut
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_created_at ON loans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);

-- Payments : filtre par user, tri par date
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_loan_id ON payments(loan_id);

-- Users : tri par date (liste admin)
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Savings plans : filtre user + statut
CREATE INDEX IF NOT EXISTS idx_savings_plans_user_status ON savings_plans(user_id, status);
