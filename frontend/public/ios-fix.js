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
    
    // Fix 2: Empêcher le scroll élastique (bounce) - version améliorée
    let touchStartY = 0;
    document.addEventListener('touchstart', function(e) {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', function(e) {
      const target = e.target;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      const scrollable = target.closest('.overflow-auto, .overflow-y-auto, .overflow-scroll, [data-scrollable]');
      
      if (!isInput && !scrollable) {
        const touchY = e.touches[0].clientY;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const isAtTop = scrollTop === 0 && touchY > touchStartY;
        const isAtBottom = scrollTop + window.innerHeight >= document.documentElement.scrollHeight && touchY < touchStartY;
        
        if (isAtTop || isAtBottom) {
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
    
    // Fix 4: Forcer le rendu après chargement et corriger le viewport
    function forceRender() {
      // Forcer le recalcul du layout
      document.body.style.display = 'none';
      document.body.offsetHeight; // Trigger reflow
      document.body.style.display = '';
      
      // Scroll trick pour iOS
      setTimeout(function() {
        window.scrollTo(0, 1);
        setTimeout(function() {
          window.scrollTo(0, 0);
        }, 10);
      }, 100);
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', forceRender);
    } else {
      forceRender();
    }
    
    window.addEventListener('load', forceRender);
    window.addEventListener('orientationchange', function() {
      setTimeout(forceRender, 200);
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
    
    // Fix 7: Désactiver le service worker problématique sur iOS
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for (let registration of registrations) {
          registration.unregister().then(function(success) {
            if (success) {
              console.log('[iOS Fix] Service Worker désenregistré');
            }
          });
        }
      });
    }
    
    // Fix 8: Vider le cache si nécessaire
    if ('caches' in window) {
      caches.keys().then(function(names) {
        names.forEach(function(name) {
          caches.delete(name);
        });
      });
    }
    
    console.log('[iOS Fix] ✅ Correctifs appliqués avec succès');
  } else {
    console.log('[iOS Fix] ℹ️ Pas iOS/Safari, correctifs non appliqués');
  }
})();

