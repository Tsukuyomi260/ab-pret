/**
 * Hook React Query pour les prêts : cache 2 min, pas de refetch au focus
 */
import { useQuery } from '@tanstack/react-query';
import { getLoans, getLoansPaginated } from '../utils/supabaseAPI';

const LOANS_QUERY_KEY = 'loans';
const LOANS_PAGINATED_KEY = 'loansPaginated';

export function useLoansQuery(userId, options = {}) {
  return useQuery({
    queryKey: [LOANS_QUERY_KEY, userId],
    queryFn: () => getLoans(userId).then(r => (r.success ? r.data : [])),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useLoansPaginatedQuery(userId, page = 0, pageSize = 50, options = {}) {
  return useQuery({
    queryKey: [LOANS_PAGINATED_KEY, userId, page, pageSize],
    queryFn: () => getLoansPaginated(userId, page, pageSize),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

export { LOANS_QUERY_KEY, LOANS_PAGINATED_KEY };
