import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const FedaPayEpargneButton = ({ planConfig }) => {
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

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
    const script = document.createElement("script");
    script.src = "https://cdn.fedapay.com/checkout.js?v=1.1.7";
    script.async = true;

    script.onload = () => {
      console.log("[FedaPay] ✅ Script chargé");
    };

    script.onerror = () => {
      console.error("[FedaPay] ❌ Erreur chargement script");
    };

    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const startPayment = () => {
    if (!window.FedaPay) {
      alert("FedaPay n'est pas encore chargé !");
      return;
    }

    console.log("[FedaPay] 🚀 Initialisation du paiement...");

    // Démarrer le polling immédiatement pour détecter la création du plan
    startPollingForPlan();

    window.FedaPay.init(buttonRef.current, {
      public_key: "pk_sandbox_ZXhGKFGNXwn853-mYF9pANmi",
      transaction: {
        amount: 1000, // frais de création fixe
        description: `Création plan épargne - ${user?.email}`,
        currency: { iso: "XOF" },
        callback_url: "http://localhost:3000/ab-epargne/retour",
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
        
        const response = await fetch(`http://localhost:5000/api/savings/plan-status?userId=${user?.id}`);
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

  return (
    <button
      ref={buttonRef}
      onClick={startPayment}
      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-semibold"
    >
      Payer 1000 F
    </button>
  );
};

export default FedaPayEpargneButton;
