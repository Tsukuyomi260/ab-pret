import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useLoanCounters = () => {
  const { user } = useAuth();
  const [counters, setCounters] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    active: 0,
    completed: 0
  });
  const [pendingRequests, setPendingRequests] = useState(0); // Demandes en attente de validation

  // Charger les compteurs initiaux
  const loadCounters = async () => {
    if (!user?.id) return;

    try {
      let query = supabase.from('loans').select('status, amount');

      // Si c'est un utilisateur normal, filtrer par user_id
      if (user.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors du chargement des compteurs:', error);
        return;
      }

      // Calculer les compteurs
      const newCounters = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        active: 0,
        completed: 0
      };

      data?.forEach(loan => {
        newCounters.total++;
        newCounters[loan.status]++;
      });

      setCounters(newCounters);

      // Pour l'admin, calculer les demandes en attente de validation
      if (user.role === 'admin') {
        const { data: pendingData, error: pendingError } = await supabase
          .from('loans')
          .select('id')
          .eq('status', 'pending');

        if (!pendingError && pendingData) {
          setPendingRequests(pendingData.length);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des compteurs:', error);
    }
  };

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!user?.id) return;

    loadCounters();

    // S'abonner aux changements de la table loans
    const loansSubscription = supabase
      .channel('loan_counters')
      .on(
        'postgres_changes',
        {
          event: '*', // Tous les événements (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'loans'
        },
        (payload) => {
          console.log('[COUNTERS] Changement détecté:', payload);
          
          // Recharger les compteurs après un changement
          setTimeout(() => {
            loadCounters();
          }, 100); // Petit délai pour s'assurer que la base est à jour
        }
      )
      .subscribe((status) => {
        console.log('[COUNTERS] Statut de la connexion:', status);
      });

    return () => {
      loansSubscription.unsubscribe();
    };
  }, [user?.id, user?.role]);

  // Fonction pour obtenir le compteur de demandes en attente (admin seulement)
  const getPendingRequestsCount = () => {
    if (user?.role !== 'admin') return 0;
    return pendingRequests;
  };

  // Fonction pour obtenir le compteur total de prêts
  const getTotalLoansCount = () => {
    return counters.total;
  };

  // Fonction pour obtenir le compteur par statut
  const getCountByStatus = (status) => {
    return counters[status] || 0;
  };

  // Fonction pour obtenir tous les compteurs
  const getAllCounters = () => {
    return counters;
  };

  return {
    counters,
    pendingRequests: getPendingRequestsCount(),
    totalLoans: getTotalLoansCount(),
    getCountByStatus,
    getAllCounters,
    refresh: loadCounters
  };
};
