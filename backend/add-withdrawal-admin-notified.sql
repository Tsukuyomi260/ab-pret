-- Garantir que l'admin est notifié pour chaque demande de retrait (job périodique)
-- Ajoute admin_notified_at pour éviter doublons et permettre un rattrapage fiable

ALTER TABLE public.withdrawal_requests
ADD COLUMN IF NOT EXISTS admin_notified_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.withdrawal_requests.admin_notified_at IS 'Date d''envoi de la notification à l''admin (évite doublons, utilisé par le job de rattrapage)';

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_pending_not_notified
ON public.withdrawal_requests(created_at)
WHERE status = 'pending' AND admin_notified_at IS NULL;
