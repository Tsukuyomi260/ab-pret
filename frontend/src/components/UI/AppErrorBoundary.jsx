import React from 'react';

/**
 * Error Boundary de premier niveau : si une erreur se produit au rendu,
 * on affiche un message au lieu de laisser l'écran bloqué (ex. logo seul).
 */
class AppErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AppErrorBoundary] Erreur capturée:', error, errorInfo);
    if (typeof window.hideAppLoadingScreen === 'function') {
      window.hideAppLoadingScreen();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ color: '#1a1a2e', fontSize: 22, marginBottom: 8 }}>
            Une erreur s'est produite
          </h1>
          <p style={{ color: '#666', fontSize: 16, marginBottom: 24, maxWidth: 360 }}>
            L'application a rencontré un problème. Vérifiez votre connexion internet ou réessayez plus tard.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default AppErrorBoundary;
