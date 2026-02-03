import React from 'react';

/** Skeleton pour une carte de stat (Dashboard, Admin) */
export function StatsCardSkeleton({ className = '' }) {
  return (
    <div className={`rounded-2xl p-4 sm:p-6 border border-gray-100 bg-white animate-pulse ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl" />
        <div className="w-12 h-4 bg-gray-200 rounded" />
      </div>
      <div className="w-16 h-8 sm:w-20 sm:h-9 bg-gray-200 rounded mb-2" />
      <div className="w-24 h-4 bg-gray-100 rounded" />
    </div>
  );
}

/** Skeleton pour la grille de stats (4 cartes) */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {[1, 2, 3, 4].map(i => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton pour une ligne de liste (historique prêts, utilisateurs) */
export function ListRowSkeleton({ lines = 3 }) {
  return (
    <div className="border border-gray-200/50 rounded-2xl p-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="h-5 w-24 bg-gray-200 rounded" />
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
          </div>
          <div className="h-4 w-3/4 bg-gray-100 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-gray-50 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Grille de lignes skeleton pour listes longues */
export function ListSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <ListRowSkeleton key={i} />
      ))}
    </div>
  );
}

export default { StatsCardSkeleton, DashboardStatsSkeleton, ListRowSkeleton, ListSkeleton };
