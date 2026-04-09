import { supabase } from './supabaseClient';

/**
 * Wrapper de fetch qui ajoute automatiquement le token Supabase
 * dans le header Authorization de chaque requête vers le backend.
 */
export const fetchWithAuth = async (url, options = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  return fetch(url, { ...options, headers });
};
