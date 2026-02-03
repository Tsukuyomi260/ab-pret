# Guide Performance – AB Campus Finance

## 1. Outils installés

- **@tanstack/react-query** : cache des données en mémoire, pas de rechargement inutile au retour sur une page.
- **react-window** : listes virtuelles pour afficher de longues listes sans tout rendre (optionnel, à brancher sur les listes > 100 éléments).

## 2. Charger moins de données à la fois

- **Prêts / Paiements** : `getLoansPaginated(userId, page, 50)` et `getPaymentsPaginated(userId, page, 50)` dans `supabaseAPI.js`. Premier chargement = 50 éléments, puis pagination ou “Charger plus”.
- **Utilisateurs (admin)** : `getAllUsersPaginated(page, 50)` pour la liste admin.
- **Champs allégés** : les requêtes paginées ne demandent que les colonnes nécessaires (id, amount, status, created_at, etc.) au lieu de `*`.

## 3. Garder les données en mémoire (React Query)

- **staleTime** : 2 min → les données sont considérées fraîches, pas de refetch automatique au focus.
- **gcTime** (ex cacheTime) : 5 min → les données restent en mémoire 5 min après le dernier usage.
- **refetchOnWindowFocus** : false → pas de rechargement à chaque retour sur l’onglet.
- **Rafraîchir** : via le bouton “Actualiser” ou `refetch()` quand c’est nécessaire (ex. après une action admin).

Fichier de config : `frontend/src/queryClient.js`.

## 4. Affichage pendant le chargement

- **Skeletons** dans `frontend/src/components/UI/Skeleton.jsx` :
  - `DashboardStatsSkeleton` : grille de cartes pour le dashboard.
  - `ListSkeleton` / `ListRowSkeleton` : lignes pour historiques / listes.
- Le dashboard utilise le skeleton pendant le premier chargement ; les listes (ex. historique prêts) utilisent `ListSkeleton` pendant le chargement.
- Pas de blocage plein écran : la structure de la page s’affiche tout de suite, le contenu se remplit au fur et à mesure.

## 5. Optimiser la base de données (Supabase / PostgreSQL)

Pour des recherches et listes plus rapides :

1. **Index sur les colonnes de filtre et tri**
   - `loans` : `CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);`
   - `loans` : `CREATE INDEX IF NOT EXISTS idx_loans_created_at ON loans(created_at DESC);`
   - `loans` : `CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);`
   - `payments` : `CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);`
   - `payments` : `CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);`
   - `users` : `CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);`
   - `savings_plans` : `CREATE INDEX IF NOT EXISTS idx_savings_plans_user_status ON savings_plans(user_id, status);`

2. **Éviter les `select *`**  
   Utiliser les requêtes paginées/allégées qui ne sélectionnent que les champs nécessaires.

3. **RLS (Row Level Security)**  
   Vérifier que les politiques RLS sont simples (pas de sous-requêtes lourdes) pour ne pas ralentir les `select`.

4. **Supabase Dashboard**  
   Dans Table Editor → index, vérifier que les index ci-dessus existent ; ajouter si besoin via SQL Editor.

## 6. Résumé des fichiers modifiés / ajoutés

| Fichier | Rôle |
|--------|------|
| `frontend/package.json` | Dépendances `@tanstack/react-query`, `react-window` |
| `frontend/src/queryClient.js` | Config cache React Query |
| `frontend/src/index.js` | `QueryClientProvider` |
| `frontend/src/utils/supabaseAPI.js` | `getLoansPaginated`, `getPaymentsPaginated`, `getAllUsersPaginated`, `getLoanById` |
| `frontend/src/hooks/useDashboardStats.js` | Cache dashboard (prêts + paiements + épargne) |
| `frontend/src/hooks/useLoansQuery.js` | Hooks React Query prêts |
| `frontend/src/hooks/usePaymentsQuery.js` | Hooks React Query paiements |
| `frontend/src/components/UI/Skeleton.jsx` | Composants skeleton |
| `frontend/src/components/Client/Dashboard.jsx` | Utilise `useDashboardStats` + skeleton |
| `frontend/src/components/Client/LoanHistory.jsx` | Utilise `ListSkeleton` pendant chargement |

## 7. Prochaines étapes possibles

- **Listes longues** : utiliser `react-window` dans LoanHistory et UserManagement (admin) pour virtualiser les lignes (scroll infini sans tout rendre).
- **Infinite scroll** : sur les pages listes, charger la page suivante au scroll (ex. `useInfiniteQuery`).
- **Détail prêt** : appeler `getLoanById(loanId)` seulement à l’ouverture d’une fiche, pas au chargement de la liste.
