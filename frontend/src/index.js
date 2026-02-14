import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Détecter iOS pour désactiver StrictMode (peut causer des problèmes)
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

// Fonction de rendu sécurisée avec gestion d'erreurs
function renderApp() {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    const root = ReactDOM.createRoot(rootElement);
    
    // Désactiver StrictMode sur iOS pour éviter les problèmes de double rendu
    const appContent = (
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    if (isIOS) {
      // Sans StrictMode sur iOS
      root.render(appContent);
    } else {
      // Avec StrictMode sur les autres plateformes
      root.render(
        <React.StrictMode>
          {appContent}
        </React.StrictMode>
      );
    }

    console.log('[REACT] ✅ Application React montée avec succès');
  } catch (error) {
    console.error('[REACT] ❌ Erreur lors du montage de React:', error);
    
    // Afficher un message d'erreur dans le DOM
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
          <h1 style="color: #e74c3c;">Erreur de chargement</h1>
          <p style="color: #666; margin: 20px 0;">Une erreur s'est produite lors du chargement de l'application.</p>
          <p style="color: #999; font-size: 14px; margin-top: 10px;">${error.message}</p>
          <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
            Recharger la page
          </button>
        </div>
      `;
    }
    
    // Afficher l'écran d'erreur si disponible
    const errorScreen = document.getElementById('error-screen');
    if (errorScreen) {
      errorScreen.classList.add('show');
    }
  }
}

// Attendre que le DOM soit prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  // DOM déjà chargé
  renderApp();
}

// Service Worker désactivé en développement pour éviter les erreurs
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/serviceWorker.js')
//       .then((registration) => {
//         console.log('Service Worker enregistré avec succès:', registration.scope);
//         
//         // Vérifier les mises à jour
//         registration.addEventListener('updatefound', () => {
//           const newWorker = registration.installing;
//           newWorker.addEventListener('statechange', () => {
//             if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
//               console.log('Nouvelle version disponible');
//               // Vous pouvez afficher une notification ici
//             }
//           });
//         });
//       })
//       .catch((error) => {
//         console.log('Échec de l\'enregistrement du Service Worker:', error);
//       });
//   });
// }

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();