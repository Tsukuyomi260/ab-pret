/**
 * Hook React Query pour les paiements : cache 2 min
 */
import { useQuery } from '@tanstack/react-query';
import { getPayments, getPaymentsPaginated } from '../utils/supabaseAPI';

const PAYMENTS_QUERY_KEY = 'payments';
const PAYMENTS_PAGINATED_KEY = 'paymentsPaginated';

export function usePaymentsQuery(userId, options = {}) {
  return useQuery({
    queryKey: [PAYMENTS_QUERY_KEY, userId],
    queryFn: () => getPayments(userId).then(r => (r.success ? r.data : [])),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

export function usePaymentsPaginatedQuery(userId, page = 0, pageSize = 50, options = {}) {
  return useQuery({
    queryKey: [PAYMENTS_PAGINATED_KEY, userId, page, pageSize],
    queryFn: () => getPaymentsPaginated(userId, page, pageSize),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

export { PAYMENTS_QUERY_KEY, PAYMENTS_PAGINATED_KEY };
