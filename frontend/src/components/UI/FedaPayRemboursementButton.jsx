import React, { useRef, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { BACKEND_URL } from "../../config/backend";

const FedaPayRemboursementButton = ({ loan, onSuccess }) => {
  const buttonRef = useRef(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.fedapay.com/checkout.js?v=1.1.7";
    script.async = true;
    script.onload = () => {
      console.log("[FedaPay] ✅ Script chargé pour remboursement");
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

    if (!user || !loan) {
      alert("Informations utilisateur ou prêt manquantes");
      return;
    }

    setLoading(true);

    try {
      // Appel au backend pour créer la transaction
      const backendUrl = BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/create-loan-repayment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id,
          loan_id: loan.id,
          amount: loan.remainingAmount,
        }),
      });

      const data = await response.json();
      console.log("[FedaPayRemboursementButton] Réponse backend:", data);
      console.log("[FedaPayRemboursementButton] Status HTTP:", response.status);

      if (data.success && data.transactionUrl) {
        if (data.transactionId) {
          sessionStorage.setItem('pending_repayment_transaction_id', data.transactionId);
        }
        window.location.href = data.transactionUrl;
      } else {
        console.error("[FedaPayRemboursementButton] ❌ Erreur détaillée:", data);
        alert(`Erreur lors de la création de la transaction de remboursement: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error("[FedaPayRemboursementButton] ❌ Erreur:", error);
      alert("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={startPayment}
      disabled={loading}
      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
      ) : (
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )}
      Rembourser mon prêt
    </button>
  );
};

export default FedaPayRemboursementButton;
