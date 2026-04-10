import { supabase } from './supabaseClient';

/**
 * Wrapper de fetch qui ajoute automatiquement le token Supabase.
 * Si la session est expirée, tente un refresh avant d'envoyer la requête.
 */
export const fetchWithAuth = async (url, options = {}) => {
  let { data: { session } } = await supabase.auth.getSession();

  // Si pas de session ou token expiré, tenter un refresh
  if (!session?.access_token) {
    const { data: refreshed } = await supabase.auth.refreshSession();
    session = refreshed?.session;
  }

  const token = session?.access_token;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  return fetch(url, { ...options, headers });
};
