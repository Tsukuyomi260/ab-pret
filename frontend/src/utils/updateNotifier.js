// Utilitaire pour gérer les mises à jour de l'application
class UpdateNotifier {
  constructor() {
    this.updateAvailable = false;
    this.updateCallback = null;
    this.checkInterval = null;
  }

  // Démarrer la vérification des mises à jour
  startChecking(callback) {
    this.updateCallback = callback;
    
    // Vérifier toutes les 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkForUpdates();
    }, 5 * 60 * 1000);
    
    // Vérification initiale
    this.checkForUpdates();
  }

  // Vérifier s'il y a une mise à jour
  checkForUpdates() {
    // Vérifier si le service worker a une mise à jour
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }

    // Vérifier si l'index.html a changé (technique simple)
    fetch('/index.html', { cache: 'no-cache' })
      .then(response => response.text())
      .then(html => {
        const currentHash = this.getHash(html);
        const cachedHash = localStorage.getItem('app-version-hash');
        
        if (cachedHash && cachedHash !== currentHash) {
          this.updateAvailable = true;
          if (this.updateCallback) {
            this.updateCallback();
          }
        }
        
        localStorage.setItem('app-version-hash', currentHash);
      })
      .catch(error => {
        console.log('Erreur lors de la vérification des mises à jour:', error);
      });
  }

  // Générer un hash simple du contenu
  getHash(content) {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir en 32-bit integer
    }
    return hash.toString();
  }

  // Appliquer la mise à jour
  applyUpdate() {
    if (this.updateAvailable) {
      // Recharger la page pour appliquer les changements
      window.location.reload();
    }
  }

  // Arrêter la vérification
  stopChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Afficher une notification de mise à jour
  showUpdateNotification() {
    if (this.updateAvailable && this.updateCallback) {
      this.updateCallback();
    }
  }
}

export default new UpdateNotifier();
