import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const FedaPayEpargneButton = ({ planConfig }) => {
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fedaPayLoaded, setFedaPayLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour forcer le rafraîchissement de la page
  const forcePageRefresh = () => {
    console.log("[FedaPay] 🔄 FORÇAGE du rafraîchissement de la page");
    
    // Annuler le timer de sécurité s'il existe
    if (window.fedaPaySafetyTimer) {
      clearTimeout(window.fedaPaySafetyTimer);
      window.fedaPaySafetyTimer = null;
    }
    
    // Mettre à jour l'URL avec le statut "approved"
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set('status', 'approved');
    window.history.replaceState({}, '', currentUrl);
    
    // Forcer le rafraîchissement immédiat
    setTimeout(() => {
      window.location.reload();
    }, 500); // Délai court pour s'assurer que l'URL est mise à jour
  };

  useEffect(() => {
    // Vérifier si FedaPay est déjà chargé
    if (window.FedaPay) {
      console.log("[FedaPay] ✅ Déjà chargé");
      setFedaPayLoaded(true);
      setIsLoading(false);
      return;
    }

    // Vérifier si le script est déjà en cours de chargement
    const existingScript = document.querySelector('script[src*="fedapay.com/checkout.js"]');
    if (existingScript) {
      console.log("[FedaPay] ⏳ Script déjà en cours de chargement, attente...");
      const checkInterval = setInterval(() => {
        if (window.FedaPay) {
          console.log("[FedaPay] ✅ Script chargé (détection différée)");
          setFedaPayLoaded(true);
          setIsLoading(false);
          clearInterval(checkInterval);
        }
      }, 100);

      // Timeout après 10 secondes
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.FedaPay) {
          console.error("[FedaPay] ❌ Timeout - Script non chargé après 10 secondes");
          setError("Erreur de chargement de FedaPay. Veuillez actualiser la page.");
          setIsLoading(false);
        }
      }, 10000);

      return () => clearInterval(checkInterval);
    }

    // Charger le script
    console.log("[FedaPay] 📥 Chargement du script...");
    setIsLoading(true);
    setError(null);

    const script = document.createElement("script");
    script.src = "https://cdn.fedapay.com/checkout.js?v=1.1.7";
    script.async = true;

    script.onload = () => {
      console.log("[FedaPay] ✅ Script chargé avec succès");
      
      // Vérifier que window.FedaPay est disponible
      if (window.FedaPay) {
        setFedaPayLoaded(true);
        setIsLoading(false);
      } else {
        // Attendre un peu plus si ce n'est pas immédiatement disponible
        setTimeout(() => {
          if (window.FedaPay) {
            setFedaPayLoaded(true);
            setIsLoading(false);
          } else {
            console.error("[FedaPay] ❌ Script chargé mais window.FedaPay non disponible");
            setError("Erreur d'initialisation de FedaPay. Veuillez actualiser la page.");
            setIsLoading(false);
          }
        }, 500);
      }
    };

    script.onerror = () => {
      console.error("[FedaPay] ❌ Erreur lors du chargement du script");
      setError("Impossible de charger FedaPay. Vérifiez votre connexion internet.");
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Ne pas supprimer le script si FedaPay est utilisé ailleurs
      // Le script peut être utilisé par d'autres composants
      if (script.parentNode) {
        // Vérifier si d'autres composants utilisent FedaPay avant de supprimer
        const otherScripts = document.querySelectorAll('script[src*="fedapay.com/checkout.js"]');
        if (otherScripts.length === 1) {
          // C'est le seul script, on peut le supprimer
          // Mais attention, cela peut causer des problèmes si d'autres composants l'utilisent
        }
      }
    };
  }, []);

  const startPayment = () => {
    // Double vérification pour sécurité
    if (!fedaPayLoaded) {
      console.error("[FedaPay] ❌ FedaPay n'est pas chargé (fedaPayLoaded = false)");
      alert("FedaPay est en cours de chargement. Veuillez patienter quelques secondes.");
      return;
    }

    if (!window.FedaPay) {
      console.error("[FedaPay] ❌ window.FedaPay n'est pas disponible");
      alert("Erreur d'initialisation de FedaPay. Veuillez actualiser la page.");
      return;
    }

    if (!user) {
      alert("Vous devez être connecté pour effectuer un paiement.");
      return;
    }

    if (!planConfig) {
      alert("Configuration du plan manquante.");
      return;
    }

    console.log("[FedaPay] 🚀 Initialisation du paiement...");

    // Démarrer le polling immédiatement pour détecter la création du plan
    startPollingForPlan();

    window.FedaPay.init(buttonRef.current, {
      public_key: process.env.REACT_APP_FEDAPAY_PUBLIC_KEY || "pk_live_u0sqkP5Irt1BvqvnU5gh4FOC",
      transaction: {
        amount: 1000, // frais de création fixe
        description: `Création plan épargne - ${user?.email}`,
        currency: { iso: "XOF" },
        callback_url: `${window.location.origin}/ab-epargne/retour`,
        custom_metadata: {
          paymentType: "savings_plan_creation",
          user_id: user?.id,
          fixed_amount: planConfig.montant,
          frequency_days: planConfig.frequence,
          duration_months: planConfig.nombreMois
        }
      },
      customer: {
        email: user?.email,
        firstname: user?.first_name || "Client",
        lastname: user?.last_name || "Campus",
        phone_number: {
          number: user?.phone || "97000000",
          country: "BJ"
        }
      },
      modal: true
    });
  };

  // Fonction de polling pour détecter la création du plan
  const startPollingForPlan = () => {
    console.log("[FedaPay] 🔍 Démarrage du polling pour détecter la création du plan...");
    
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max (60 * 2 secondes)
    
    const pollForPlan = async () => {
      try {
        attempts++;
        console.log(`[FedaPay] 🔍 Tentative ${attempts}/${maxAttempts} - Vérification du plan...`);
        
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/savings/plan-status?userId=${user?.id}`);
        const data = await response.json();
        
        if (data.success && data.plan) {
          console.log("[FedaPay] ✅ Plan trouvé ! Redirection vers RetourEpargne...");
          // Redirection immédiate vers RetourEpargne avec l'ID du plan
          window.location.href = `/ab-epargne/retour?planId=${data.plan.id}&status=approved`;
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.log("[FedaPay] ⏰ Timeout - Aucun plan trouvé après 2 minutes");
          alert("Le plan n'a pas été créé dans les temps. Veuillez réessayer.");
          return;
        }
        
        // Attendre 2 secondes avant la prochaine tentative
        setTimeout(pollForPlan, 2000);
        
      } catch (error) {
        console.error("[FedaPay] ❌ Erreur lors du polling:", error);
        attempts++;
        
        if (attempts >= maxAttempts) {
          alert("Erreur de connexion. Veuillez réessayer.");
          return;
        }
        
        setTimeout(pollForPlan, 2000);
      }
    };
    
    // Démarrer le polling après 5 secondes (laisser le temps au modal de s'ouvrir)
    setTimeout(pollForPlan, 5000);
  };

  // Affichage en fonction de l'état
  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-600 text-sm font-medium mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
        >
          Actualiser la page
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <button
        disabled
        className="w-full bg-gray-400 text-white py-3 rounded-lg font-semibold text-base cursor-not-allowed flex items-center justify-center gap-2"
      >
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        Chargement de FedaPay...
      </button>
    );
  }

  return (
    <button
      ref={buttonRef}
      onClick={startPayment}
      disabled={!fedaPayLoaded}
      className={`w-full py-3 rounded-lg font-semibold text-base transition-all ${
        fedaPayLoaded
          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
          : 'bg-gray-400 text-white cursor-not-allowed'
      }`}
    >
      {fedaPayLoaded ? 'Payer 1000 F' : 'Chargement...'}
    </button>
  );
};

export default FedaPayEpargneButton;
