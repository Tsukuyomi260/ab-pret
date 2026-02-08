-- Notifications automatiques quand un plan atteint son objectif
-- Ajoute goal_reached_notified_at pour éviter doublons et permettre un rattrapage fiable

ALTER TABLE public.savings_plans
ADD COLUMN IF NOT EXISTS goal_reached_notified_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.savings_plans.goal_reached_notified_at IS 'Date d''envoi de la notification admin quand l''objectif est atteint (évite doublons, utilisé par le job de rattrapage)';

CREATE INDEX IF NOT EXISTS idx_savings_plans_active_goal_not_notified
ON public.savings_plans(updated_at)
WHERE status = 'active' AND goal_reached_notified_at IS NULL;
