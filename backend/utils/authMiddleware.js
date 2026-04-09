const { supabase } = require('./supabaseClient-server');

/**
 * Vérifie que la requête contient un token Supabase valide.
 * Attache req.user = { id, email, role } si valide.
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Token d\'authentification manquant' });
    }

    const token = authHeader.substring(7);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Token invalide ou expiré' });
    }

    const { data: dbUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      role: dbUser?.role || 'client'
    };

    next();
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE] Erreur:', error.message);
    return res.status(500).json({ success: false, error: 'Erreur d\'authentification' });
  }
};

/**
 * Vérifie que l'utilisateur connecté est un administrateur.
 */
const requireAdmin = async (req, res, next) => {
  await requireAuth(req, res, async () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Accès réservé aux administrateurs' });
    }
    next();
  });
};

module.exports = { requireAuth, requireAdmin };
