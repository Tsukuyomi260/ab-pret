import React, { useRef, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const FedaPayDepotButton = ({ plan, onSuccess }) => {
  const buttonRef = useRef(null);
  const fakeButtonRef = useRef(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.fedapay.com/checkout.js?v=1.1.7";
    script.async = true;
    script.onload = () => {
      console.log("[FedaPay] ✅ Script chargé pour dépôt");
    };
    script.onerror = () => {
      console.error("[FedaPay] ❌ Erreur chargement script");
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const startPayment = async () => {
    if (!window.FedaPay) {
      alert("FedaPay n'est pas encore chargé !");
      return;
    }

    if (!user || !plan) {
      alert("Informations utilisateur ou plan manquantes");
      return;
    }

    setLoading(true);

    try {
      // Appel au backend pour créer la transaction
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/create-savings-deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          plan_id: plan.id,
          amount: plan.fixed_amount,
        }),
      });

      const data = await response.json();
      console.log("[FedaPay] Réponse backend:", data);

      if (data.success && data.transactionUrl) {
        // Rediriger vers la page de paiement FedaPay
        window.location.href = data.transactionUrl;
      } else {
        alert("Erreur de connexion. Veuillez réessayer.");
        setLoading(false);
      }
    } catch (error) {
      console.error("[FedaPay] ❌ Erreur:", error);
      alert("Erreur de connexion. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bouton invisible pour FedaPay */}
      <button
        ref={fakeButtonRef}
        style={{ display: "none" }}
        onClick={() => {}}
      />
      
      {/* Bouton visible */}
      <button
        ref={buttonRef}
        onClick={startPayment}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Traitement...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Effectuer un Dépôt
          </>
        )}
      </button>
    </>
  );
};

export default FedaPayDepotButton;
