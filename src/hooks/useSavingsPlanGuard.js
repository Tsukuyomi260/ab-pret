import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSavingsPlanStatus } from '../utils/supabaseAPI';

// Hook pour vérifier le statut du plan d'épargne (sans redirection forcée)
export const useSavingsPlanStatus = () => {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [hasConfiguredPlan, setHasConfiguredPlan] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const checkSavingsPlanStatus = async () => {
      if (!user?.id) {
        setIsChecking(false);
        return;
      }

      try {
        setIsChecking(true);
        
        // Vérifier le statut du plan d'épargne
        const planStatusResult = await getSavingsPlanStatus(user.id);
        
        if (planStatusResult.success) {
          const planStatus = planStatusResult.data;
          
          setHasConfiguredPlan(planStatus.hasConfiguredPlan);
          setIsFirstVisit(planStatus.isFirstVisit);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du plan d\'épargne:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkSavingsPlanStatus();
  }, [user?.id]);

  // Fonction pour forcer la vérification (utile après création d'un plan)
  const refreshPlanStatus = async () => {
    if (!user?.id) return;

    try {
      const planStatusResult = await getSavingsPlanStatus(user.id);
      
      if (planStatusResult.success) {
        const planStatus = planStatusResult.data;
        setHasConfiguredPlan(planStatus.hasConfiguredPlan);
        setIsFirstVisit(planStatus.isFirstVisit);
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du statut:', error);
    }
  };

  return {
    isChecking,
    hasConfiguredPlan,
    isFirstVisit,
    refreshPlanStatus
  };
};

// Hook spécifique pour la page AB Épargne (avec redirection si première visite)
export const useABEpargneGuard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasConfiguredPlan, setHasConfiguredPlan] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const checkSavingsPlanStatus = async () => {
      if (!user?.id) {
        setIsChecking(false);
        return;
      }

      try {
        setIsChecking(true);
        
        // Vérifier le statut du plan d'épargne
        const planStatusResult = await getSavingsPlanStatus(user.id);
        
        if (planStatusResult.success) {
          const planStatus = planStatusResult.data;
          
          setHasConfiguredPlan(planStatus.hasConfiguredPlan);
          setIsFirstVisit(planStatus.isFirstVisit);
          
          // Seulement sur la page AB Épargne : si première visite, afficher le modal de configuration
          if (location.pathname === '/ab-epargne' && planStatus.isFirstVisit) {
            // Ne pas rediriger, juste indiquer qu'il faut configurer
            console.log('Première visite sur AB Épargne - Affichage du modal de configuration');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du plan d\'épargne:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkSavingsPlanStatus();
  }, [user?.id, location.pathname]);

  return {
    isChecking,
    hasConfiguredPlan,
    isFirstVisit
  };
};

// Hook pour les pages qui nécessitent un plan configuré (désactivé pour l'instant)
export const useRequireSavingsPlan = () => {
  const { isChecking, hasConfiguredPlan, isFirstVisit } = useSavingsPlanStatus();
  
  return {
    isChecking,
    hasConfiguredPlan,
    isFirstVisit,
    shouldShowContent: true // Toujours autoriser l'accès
  };
};

// Hook pour les pages qui sont accessibles sans plan configuré
export const useOptionalSavingsPlan = () => {
  const { isChecking, hasConfiguredPlan, isFirstVisit } = useSavingsPlanStatus();
  
  return {
    isChecking,
    hasConfiguredPlan,
    isFirstVisit
  };
};
