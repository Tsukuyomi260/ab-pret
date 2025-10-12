// Fix pour les problèmes iOS/Safari
(function() {
  'use strict';
  
  // Détecter iOS/Safari
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  if (isIOS || isSafari) {
    console.log('[iOS Fix] Détection iOS/Safari - Application des correctifs...');
    
    // Fix 1: Désactiver le zoom sur double-tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
    
    // Fix 2: Empêcher le scroll élastique (bounce)
    document.addEventListener('touchmove', function(e) {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        const scrollable = e.target.closest('.overflow-auto, .overflow-y-auto, .overflow-scroll');
        if (!scrollable) {
          e.preventDefault();
        }
      }
    }, { passive: false });
    
    // Fix 3: Gérer la hauteur de viewport (100vh bug sur iOS)
    function setViewportHeight() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    
    // Fix 4: Forcer le rendu après chargement
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.scrollTo(0, 1);
        window.scrollTo(0, 0);
      }, 100);
    });
    
    // Fix 5: Gérer les erreurs non capturées
    window.addEventListener('error', function(e) {
      console.error('[iOS Fix] Erreur détectée:', e.message, e.filename, e.lineno, e.colno);
      // Ne pas bloquer l'exécution
      return false;
    });
    
    // Fix 6: Gérer les promesses rejetées
    window.addEventListener('unhandledrejection', function(e) {
      console.error('[iOS Fix] Promise rejetée:', e.reason);
      // Ne pas bloquer l'exécution
      e.preventDefault();
    });
    
    console.log('[iOS Fix] Correctifs appliqués avec succès');
  }
})();

