import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Wallet, CheckCircle2, Target, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BACKEND_URL } from '../../config/backend';
import { formatCurrency } from '../../utils/helpers';

const EpargneHistorique = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${BACKEND_URL}/api/savings/history?userId=${user.id}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.plans)) {
          setPlans(data.plans);
        }
      } catch (e) {
        console.error('[EPARGNE_HISTORIQUE]', e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white rounded-b-2xl shadow-sm mb-4">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate('/ab-epargne')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Historique épargne</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-4 pb-8">
        <p className="text-sm text-gray-500 mb-4">
          Plans terminés (objectif atteint et retrait effectué). Pour épargner à nouveau, créez un nouveau plan depuis la page AB Épargne.
        </p>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Chargement...</div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Aucun plan terminé pour le moment.</p>
            <button
              onClick={() => navigate('/ab-epargne')}
              className="mt-4 text-blue-600 font-medium"
            >
              Créer un plan d&apos;épargne
            </button>
          </div>
        ) : (
          <ul className="space-y-4">
            {plans.map((plan) => (
              <li
                key={plan.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span className="font-medium text-gray-900 truncate">
                        {plan.plan_name || plan.goal_label || 'Plan terminé'}
                      </span>
                    </div>
                    {plan.goal && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Target className="w-4 h-4" /> {plan.goal}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Terminé le {plan.updated_at ? new Date(plan.updated_at).toLocaleDateString('fr-FR') : '–'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(plan.total_amount_target || plan.current_balance || 0)}
                    </p>
                    <p className="text-xs text-gray-500">objectif atteint</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EpargneHistorique;
