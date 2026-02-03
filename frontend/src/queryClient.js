/**
 * Configuration React Query : cache en mémoire, pas de refetch inutile
 * - staleTime: 2 min → les données sont considérées fraîches, pas de refetch au focus
 * - gcTime (ex cacheTime): 5 min → garde les données en mémoire 5 min après dernier usage
 * - refetchOnWindowFocus: false → ne pas recharger à chaque retour sur l'onglet
 * - refetchOnReconnect: true → rafraîchir après perte de connexion
 */
import { QueryClient } from '@tanstack/react-query';

const STALE_TIME_MS = 2 * 60 * 1000;   // 2 minutes
const GC_TIME_MS = 5 * 60 * 1000;      // 5 minutes (garder en mémoire)

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      gcTime: GC_TIME_MS,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

export default queryClient;
